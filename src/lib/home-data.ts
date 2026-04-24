import { prisma } from "@/lib/prisma";

export type HomeProduct = {
  id: string;
  nameZh: string;
  nameEn: string;
  priceCents: number;
  currency: string;
};

export type HomeSlot = {
  id: string;
  label: string;
};

export async function getHomeProducts(): Promise<HomeProduct[]> {
  try {
    return await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        nameZh: true,
        nameEn: true,
        priceCents: true,
        currency: true,
      },
    });
  } catch {
    return [];
  }
}

export async function getHomeSlotsForService(serviceKey: string): Promise<HomeSlot[]> {
  try {
    const rows = await prisma.availabilitySlot.findMany({
      where: {
        serviceKey,
        status: "open",
        remaining: { gt: 0 },
      },
      orderBy: { startsAt: "asc" },
      take: 12,
    });
    return rows.map((slot) => ({
      id: slot.id,
      label: slot.startsAt.toLocaleString("en-HK", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    }));
  } catch {
    return [];
  }
}
