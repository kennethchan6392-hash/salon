import type { Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

function slotLocaleTag(locale: Locale): string {
  return locale === "zh-HK" ? "zh-HK" : "en-HK";
}

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

export async function getHomeSlotsForService(
  locale: Locale,
  serviceKey: string,
): Promise<HomeSlot[]> {
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
    const tag = slotLocaleTag(locale);
    return rows.map((slot) => ({
      id: slot.id,
      label: slot.startsAt.toLocaleString(tag, {
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
