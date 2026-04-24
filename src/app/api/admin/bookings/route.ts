import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminRequest } from "@/lib/verify-admin-request";

export async function GET(request: Request) {
  const denied = await requireAdminRequest(request);
  if (denied) {
    return denied;
  }

  try {
    const bookings = await prisma.appointment.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        serviceId: true,
        slotId: true,
        customerName: true,
        customerPhone: true,
        status: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("[admin/bookings]", error);
    return NextResponse.json({ message: "Could not load bookings." }, { status: 503 });
  }
}
