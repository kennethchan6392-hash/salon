import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const serviceSlots: Record<string, { id: string; label: string }[]> = {
  haircut: [
    { id: "2026-04-25T11:00", label: "Apr 25, 11:00" },
    { id: "2026-04-25T13:00", label: "Apr 25, 13:00" },
  ],
  color: [
    { id: "2026-04-25T12:00", label: "Apr 25, 12:00" },
    { id: "2026-04-25T15:00", label: "Apr 25, 15:00" },
  ],
  perm: [
    { id: "2026-04-26T12:00", label: "Apr 26, 12:00" },
    { id: "2026-04-26T16:00", label: "Apr 26, 16:00" },
  ],
};

export async function GET(request: Request) {
  const isProd = process.env.NODE_ENV === "production";
  const { searchParams } = new URL(request.url);
  const service = searchParams.get("service") ?? "haircut";

  try {
    const rows = await prisma.availabilitySlot.findMany({
      where: {
        serviceKey: service,
        status: "open",
        remaining: { gt: 0 },
      },
      orderBy: { startsAt: "asc" },
      take: 12,
    });

    if (rows.length > 0) {
      return NextResponse.json(
        {
          slots: rows.map((slot) => ({
            id: slot.id,
            label: slot.startsAt.toLocaleString("en-HK", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }),
          })),
        },
        { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } },
      );
    }

    if (isProd) {
      return NextResponse.json({ slots: [] });
    }
  } catch (error) {
    console.error("[booking/slots]", error);
    if (isProd) {
      return NextResponse.json({ message: "Availability is temporarily unavailable." }, { status: 503 });
    }
  }

  return NextResponse.json({
    slots: serviceSlots[service] ?? serviceSlots.haircut,
  });
}
