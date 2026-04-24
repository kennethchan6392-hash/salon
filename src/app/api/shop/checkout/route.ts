import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { withIdempotencyByKey } from "@/lib/idempotency";

type CheckoutItem = {
  productId: string;
  quantity: number;
};

type CheckoutPayload = {
  locale?: string;
  customerName?: string;
  customerEmail?: string;
  paymentMethod?: "mpay" | "boc" | "uepay" | "bank_transfer" | "stripe_card";
  items?: CheckoutItem[];
};

const localPaymentInstructions = {
  mpay: {
    account: process.env.MPAY_ACCOUNT ?? "MPAY-NNSALON-001",
    note: "Use MPay app and transfer to the merchant ID above.",
  },
  boc: {
    account: process.env.BOC_ACCOUNT ?? "BOC Macau 001-234567-890",
    note: "Transfer via BOC mobile banking and keep receipt screenshot.",
  },
  uepay: {
    account: process.env.UEPAY_ACCOUNT ?? "UEPAY-NNSALON-001",
    note: "Use UEPay merchant transfer and include order ID in note.",
  },
  bank_transfer: {
    account: process.env.BANK_TRANSFER_ACCOUNT ?? "Bank of China Macau A/C: 001-234567-890",
    note: "Bank transfer and upload payment proof for manual review.",
  },
} as const;

export async function POST(request: Request) {
  const idempotencyKey = request.headers.get("idempotency-key");
  const body = (await request.json()) as CheckoutPayload;
  const result = await withIdempotencyByKey<Record<string, unknown>>(idempotencyKey, "shop_checkout", async () => {
    const paymentMethod = body.paymentMethod ?? "stripe_card";

    if (!body.customerName || !body.customerEmail || !body.items || body.items.length === 0) {
      return { status: 400, body: { message: "Missing checkout fields." } };
    }

    const productIds = body.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });

    if (products.length === 0) {
      return { status: 400, body: { message: "No valid products found." } };
    }

    const mappedItems = body.items
      .map((item) => {
        const product = products.find((entry) => entry.id === item.productId);
        if (!product || item.quantity <= 0) {
          return null;
        }
        return {
          product,
          quantity: item.quantity,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    if (mappedItems.length === 0) {
      return { status: 400, body: { message: "Invalid cart items." } };
    }

    const totalAmountCents = mappedItems.reduce(
      (sum, item) => sum + item.product.priceCents * item.quantity,
      0,
    );

    if (paymentMethod !== "stripe_card") {
      const uploadToken = randomBytes(32).toString("hex");
      const order = await prisma.order.create({
        data: {
          customerName: body.customerName,
          customerEmail: body.customerEmail,
          totalAmountCents,
          currency: "hkd",
          status: "pending",
          paymentMethod,
          paymentUploadToken: uploadToken,
          paymentAccount: localPaymentInstructions[paymentMethod].account,
          paymentNote: localPaymentInstructions[paymentMethod].note,
          items: {
            create: mappedItems.map((item) => ({
              productId: item.product.id,
              quantity: item.quantity,
              unitPriceCents: item.product.priceCents,
            })),
          },
        },
        include: { items: true },
      });

      return {
        status: 201,
        body: {
          orderId: order.id,
          paymentMethod,
          amountCents: order.totalAmountCents,
          currency: order.currency,
          paymentAccount: localPaymentInstructions[paymentMethod].account,
          paymentNote: localPaymentInstructions[paymentMethod].note,
          uploadToken,
          message:
            body.locale === "zh-HK"
              ? "訂單已建立，請按以下資料付款並上傳付款截圖。"
              : "Order created. Please pay using the details below and upload payment proof.",
        },
      };
    }

    if (!stripe || !process.env.NEXT_PUBLIC_SITE_URL) {
      return {
        status: 500,
        body: { message: "Stripe is not configured. Add STRIPE_SECRET_KEY and NEXT_PUBLIC_SITE_URL." },
      };
    }

    const order = await prisma.order.create({
      data: {
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        totalAmountCents,
        currency: "hkd",
        status: "pending",
        paymentMethod: "stripe_card",
        paymentNote: "Paid through Stripe card checkout.",
        items: {
          create: mappedItems.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            unitPriceCents: item.product.priceCents,
          })),
        },
      },
      include: { items: true },
    });

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: body.customerEmail,
        line_items: mappedItems.map((item) => ({
          quantity: item.quantity,
          price_data: {
            currency: item.product.currency,
            unit_amount: item.product.priceCents,
            product_data: {
              name: body.locale === "zh-HK" ? item.product.nameZh : item.product.nameEn,
            },
          },
        })),
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/${body.locale ?? "zh-HK"}?checkout=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/${body.locale ?? "zh-HK"}?checkout=cancelled`,
        metadata: {
          orderId: order.id,
        },
      });

      if (!session.url) {
        throw new Error("Missing Stripe session URL");
      }

      await prisma.order.update({
        where: { id: order.id },
        data: { stripeSessionId: session.id },
      });

      return {
        status: 201,
        body: { checkoutUrl: session.url, orderId: order.id },
      };
    } catch {
      await prisma.order.delete({ where: { id: order.id } }).catch(() => {});
      return {
        status: 500,
        body: {
          message: "Could not start card checkout. Please try again or choose local payment.",
        },
      };
    }
  });

  return NextResponse.json(result.body, { status: result.status });
}
