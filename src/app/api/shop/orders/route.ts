import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminRequest } from "@/lib/verify-admin-request";

export async function GET(request: Request) {
  const denied = await requireAdminRequest(request);
  if (denied) {
    return denied;
  }

  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: {
              select: { nameZh: true, nameEn: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("[shop/orders]", error);
    return NextResponse.json({ message: "Could not load orders." }, { status: 503 });
  }
}
