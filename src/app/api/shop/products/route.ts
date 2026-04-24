import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const demoProducts = [
  { id: "demo-1", nameZh: "保濕洗髮露 500ml", nameEn: "Moisture Shampoo 500ml", priceCents: 24800, currency: "hkd" },
  { id: "demo-2", nameZh: "深層修護髮膜", nameEn: "Repair Treatment Mask", priceCents: 32800, currency: "hkd" },
];

export async function GET() {
  const isProd = process.env.NODE_ENV === "production";

  try {
    const products = await prisma.product.findMany({
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
    return NextResponse.json(
      { products },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } },
    );
  } catch (error) {
    console.error("[shop/products]", error);
    if (isProd) {
      return NextResponse.json(
        { message: "Product catalog is temporarily unavailable." },
        { status: 503 },
      );
    }
    return NextResponse.json({ products: demoProducts }, { status: 200 });
  }
}
