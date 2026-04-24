import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withIdempotencyByKey } from "@/lib/idempotency";

type BookingPayload = {
  locale?: string;
  serviceId?: string;
  slotId?: string;
  customerName?: string;
  customerPhone?: string;
};

type BookingSuccessBody = {
  message: string;
  appointmentId: string;
};

function isProduction() {
  return process.env.NODE_ENV === "production";
}

export async function POST(request: Request) {
  const idempotencyKey = request.headers.get("idempotency-key");
  const body = (await request.json()) as BookingPayload;

  const result = await withIdempotencyByKey<BookingSuccessBody | { message: string }>(
    idempotencyKey,
    "booking_create",
    async () => {
      if (!body.serviceId || !body.slotId || !body.customerName || !body.customerPhone) {
        return { status: 400, body: { message: "Missing required fields." } };
      }

      try {
        const appointmentId = await prisma.$transaction(async (tx) => {
          const existing = await tx.appointment.findFirst({
            where: {
              slotId: body.slotId!,
              customerPhone: body.customerPhone!,
              status: { in: ["pending", "confirmed"] },
            },
          });

          if (existing) {
            throw new Error("DUPLICATE_BOOKING");
          }

          const slotUpdate = await tx.availabilitySlot.updateMany({
            where: {
              id: body.slotId!,
              status: "open",
              remaining: { gt: 0 },
            },
            data: {
              remaining: { decrement: 1 },
            },
          });

          if (slotUpdate.count !== 1) {
            const slot = await tx.availabilitySlot.findUnique({
              where: { id: body.slotId! },
            });
            if (!slot) {
              throw new Error("SLOT_NOT_FOUND");
            }
            throw new Error("SLOT_UNAVAILABLE");
          }

          const appointment = await tx.appointment.create({
            data: {
              serviceId: body.serviceId!,
              slotId: body.slotId!,
              customerName: body.customerName!,
              customerPhone: body.customerPhone!,
              status: "pending",
            },
          });

          return appointment.id;
        });

        const message =
          body.locale === "zh-HK"
            ? "預約已送出，我們會盡快確認。"
            : "Booking submitted. We will confirm shortly.";

        return {
          status: 201,
          body: { message, appointmentId },
        };
      } catch (error) {
        if (error instanceof Error && error.message === "SLOT_UNAVAILABLE") {
          return {
            status: 409,
            body: {
              message:
                body.locale === "zh-HK" ? "此時段已滿，請選擇其他時段。" : "Selected slot is full.",
            },
          };
        }

        if (error instanceof Error && error.message === "SLOT_NOT_FOUND") {
          return {
            status: 404,
            body: {
              message:
                body.locale === "zh-HK" ? "找不到此時段，請重新整理頁面。" : "Slot not found. Please refresh.",
            },
          };
        }

        if (error instanceof Error && error.message === "DUPLICATE_BOOKING") {
          return {
            status: 409,
            body: {
              message:
                body.locale === "zh-HK"
                  ? "你已預約此時段，請勿重複提交。"
                  : "You already booked this slot.",
            },
          };
        }

        console.error("[booking]", error);
        if (isProduction()) {
          return {
            status: 500,
            body: {
              message:
                body.locale === "zh-HK"
                  ? "系統暫時無法處理預約，請稍後再試。"
                  : "We could not complete your booking. Please try again later.",
            },
          };
        }

        return {
          status: 503,
          body: {
            message:
              "Booking service unavailable (database may not be migrated). Run prisma migrate in development.",
          },
        };
      }
    },
  );

  return NextResponse.json(result.body, { status: result.status });
}
