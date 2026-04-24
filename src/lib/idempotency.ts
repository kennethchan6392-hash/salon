import { prisma } from "@/lib/prisma";

export async function withIdempotencyByKey<T>(
  idempotencyKey: string | null | undefined,
  route: string,
  fn: () => Promise<{ status: number; body: T }>,
): Promise<{ status: number; body: T; fromCache: boolean }> {
  const key = idempotencyKey?.trim();
  if (!key) {
    const result = await fn();
    return { ...result, fromCache: false };
  }

  const composite = `${route}:${key}`;
  const existing = await prisma.idempotencyRecord.findUnique({
    where: { key: composite },
  });
  if (existing) {
    return {
      status: existing.status,
      body: JSON.parse(existing.body) as T,
      fromCache: true,
    };
  }

  const result = await fn();
  if (result.status < 200 || result.status >= 300) {
    return { ...result, fromCache: false };
  }
  const bodyString = JSON.stringify(result.body);
  try {
    await prisma.idempotencyRecord.create({
      data: {
        key: composite,
        route,
        status: result.status,
        body: bodyString,
      },
    });
  } catch {
    const retry = await prisma.idempotencyRecord.findUnique({ where: { key: composite } });
    if (retry) {
      return {
        status: retry.status,
        body: JSON.parse(retry.body) as T,
        fromCache: true,
      };
    }
  }
  return { ...result, fromCache: false };
}
