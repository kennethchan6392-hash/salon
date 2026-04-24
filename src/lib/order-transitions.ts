import type { OrderStatus } from "@prisma/client";

const allowed: Record<OrderStatus, OrderStatus[]> = {
  pending: ["proof_submitted", "failed", "cancelled", "paid"],
  proof_submitted: ["paid", "failed", "cancelled", "pending"],
  paid: ["cancelled"],
  failed: ["pending", "proof_submitted", "cancelled"],
  cancelled: ["pending"],
};

export function isOrderTransitionAllowed(from: OrderStatus, to: OrderStatus) {
  return allowed[from]?.includes(to) ?? false;
}
