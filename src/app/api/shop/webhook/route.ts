import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

function getWebhookSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET;
}

export async function POST(request: Request) {
  const webhookSecret = getWebhookSecret();

  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { message: "Stripe webhook is not configured. Add STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET." },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ message: "Missing stripe-signature header." }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    return NextResponse.json({ message: "Invalid webhook signature." }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      await prisma.order.updateMany({
        where: { stripeSessionId: session.id },
        data: {
          status: "paid",
          stripePaymentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
        },
      });
    }

    if (event.type === "checkout.session.async_payment_failed") {
      const session = event.data.object as Stripe.Checkout.Session;
      await prisma.order.updateMany({
        where: { stripeSessionId: session.id },
        data: { status: "failed" },
      });
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      await prisma.order.updateMany({
        where: { stripeSessionId: session.id },
        data: { status: "cancelled" },
      });
    }
  } catch {
    return NextResponse.json({ message: "Webhook handling failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
