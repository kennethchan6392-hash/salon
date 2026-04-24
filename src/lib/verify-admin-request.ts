import { NextResponse } from "next/server";
import { computeAdminSessionValue } from "@/lib/admin-session";
import { adminAuthJsonResponse, COOKIE_NAME } from "@/lib/auth-admin";
import { timingSafeEqual } from "node:crypto";

function bufferTimingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
  } catch {
    return false;
  }
}

function getCookieValue(cookieHeader: string, name: string) {
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.startsWith(`${name}=`)) {
      return decodeURIComponent(trimmed.slice(name.length + 1));
    }
  }
  return undefined;
}

export async function requireAdminRequest(request: Request) {
  const key = process.env.ADMIN_API_KEY;
  if (!key) {
    return NextResponse.json({ message: "Admin access is not configured." }, { status: 503 });
  }

  const header =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    request.headers.get("x-admin-key");
  if (header && bufferTimingSafeEqual(header, key)) {
    return null;
  }

  const cookieHeader = request.headers.get("cookie") ?? "";
  const value = getCookieValue(cookieHeader, COOKIE_NAME);
  const expected = await computeAdminSessionValue(key);
  if (value && bufferTimingSafeEqual(value, expected)) {
    return null;
  }

  return adminAuthJsonResponse();
}
