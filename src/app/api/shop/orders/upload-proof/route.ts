import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const PRIVATE_ROOT = path.join(process.cwd(), "private", "payment-proofs");

const allowedExt = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

export async function POST(request: Request) {
  const formData = await request.formData();
  const orderId = formData.get("orderId");
  const uploadToken = formData.get("uploadToken");
  const file = formData.get("proof");

  if (typeof orderId !== "string" || typeof uploadToken !== "string" || !(file instanceof File)) {
    return NextResponse.json(
      { message: "Missing orderId, uploadToken, or proof file." },
      { status: 400 },
    );
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      paymentUploadToken: true,
      paymentMethod: true,
      status: true,
    },
  });

  if (!order) {
    return NextResponse.json({ message: "Order not found." }, { status: 404 });
  }

  if (order.paymentMethod === "stripe_card") {
    return NextResponse.json({ message: "Proof upload is for local payment orders only." }, { status: 400 });
  }

  if (!order.paymentUploadToken || order.paymentUploadToken !== uploadToken) {
    return NextResponse.json({ message: "Invalid upload token." }, { status: 401 });
  }

  if (order.status !== "pending" && order.status !== "proof_submitted") {
    return NextResponse.json(
      { message: "This order is not accepting payment proof." },
      { status: 400 },
    );
  }

  if (file.size === 0 || file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ message: "Invalid file size (max 5MB)." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ message: "Only image files are allowed." }, { status: 400 });
  }

  const rawName = file.name || "proof.png";
  const ext = rawName.includes(".") ? rawName.slice(rawName.lastIndexOf(".")).toLowerCase() : ".png";
  if (!allowedExt.has(ext)) {
    return NextResponse.json({ message: "Unsupported image format." }, { status: 400 });
  }

  const filename = `${randomUUID()}${ext}`;
  const absoluteDir = PRIVATE_ROOT;
  const absolutePath = path.join(absoluteDir, filename);
  const bytes = await file.arrayBuffer();

  await mkdir(absoluteDir, { recursive: true });
  await writeFile(absolutePath, Buffer.from(bytes));

  const proofViewUrl = `/api/shop/orders/proof?orderId=${encodeURIComponent(orderId)}&uploadToken=${encodeURIComponent(uploadToken)}`;

  await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentProofStorageKey: filename,
      paymentProofUrl: proofViewUrl,
      status: "proof_submitted",
    },
  });

  return NextResponse.json({
    message: "Payment proof uploaded. Order is pending manual review.",
    proofViewUrl,
  });
}
