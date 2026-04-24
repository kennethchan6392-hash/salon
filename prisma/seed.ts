import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.service.upsert({
    where: { key: "haircut" },
    update: {},
    create: {
      key: "haircut",
      nameZh: "洗剪造型",
      nameEn: "Haircut",
      durationMins: 60,
      basePrice: 280,
    },
  });

  await prisma.service.upsert({
    where: { key: "color" },
    update: {},
    create: {
      key: "color",
      nameZh: "染髮",
      nameEn: "Color",
      durationMins: 120,
      basePrice: 780,
    },
  });

  await prisma.service.upsert({
    where: { key: "perm" },
    update: {},
    create: {
      key: "perm",
      nameZh: "燙髮",
      nameEn: "Perm",
      durationMins: 150,
      basePrice: 980,
    },
  });

  await prisma.product.upsert({
    where: { slug: "moisture-shampoo-500ml" },
    update: {},
    create: {
      slug: "moisture-shampoo-500ml",
      nameZh: "保濕洗髮露 500ml",
      nameEn: "Moisture Shampoo 500ml",
      description: "Salon-grade moisture care for daily use.",
      priceCents: 24800,
      currency: "hkd",
    },
  });

  await prisma.product.upsert({
    where: { slug: "repair-treatment-mask" },
    update: {},
    create: {
      slug: "repair-treatment-mask",
      nameZh: "深層修護髮膜",
      nameEn: "Repair Treatment Mask",
      description: "Weekly deep-repair treatment for damaged hair.",
      priceCents: 32800,
      currency: "hkd",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
