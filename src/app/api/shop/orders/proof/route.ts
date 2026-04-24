import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminRequest } from "@/lib/verify-admin-request";

const PRIVATE_ROOT = path.join(process.cwd(), "private", "payment-proofs");

const extToMime: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");
  const uploadToken = searchParams.get("uploadToken");

  if (!orderId) {
    return NextResponse.json({ message: "Missing orderId." }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { paymentProofStorageKey: true, paymentUploadToken: true },
  });

  if (!order?.paymentProofStorageKey) {
    return NextResponse.json({ message: "Proof not found." }, { status: 404 });
  }

  const adminDenied = await requireAdminRequest(request);
  if (adminDenied !== null) {
    if (!uploadToken || !order.paymentUploadToken || uploadToken !== order.paymentUploadToken) {
      return adminDenied;
    }
  }

  const filePath = path.join(PRIVATE_ROOT, order.paymentProofStorageKey);
  let buffer: Buffer;
  try {
    buffer = await readFile(filePath);
  } catch {
    return NextResponse.json({ message: "File missing." }, { status: 404 });
  }

  const ext = path.extname(order.paymentProofStorageKey).toLowerCase();
  const contentType = extToMime[ext] ?? "application/octet-stream";

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, no-store",
    },
  });
}
