import { NextRequest, NextResponse } from "next/server";
import { computeAdminSessionValue } from "@/lib/admin-session";
import { COOKIE_NAME } from "@/lib/auth-admin";

const ADMIN_LOGIN_PATH = "/admin/login";

function timingSafeStringEq(a: string, b: string) {
  if (a.length !== b.length) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
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

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname === ADMIN_LOGIN_PATH) {
    return NextResponse.next();
  }

  const adminKey = process.env.ADMIN_API_KEY ?? "";
  if (!adminKey) {
    return new NextResponse("Admin access is not configured.", { status: 503 });
  }

  const authHeader = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (authHeader && timingSafeStringEq(authHeader, adminKey)) {
    return NextResponse.next();
  }

  const xHeader = request.headers.get("x-admin-key");
  if (xHeader && timingSafeStringEq(xHeader, adminKey)) {
    return NextResponse.next();
  }

  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookie = getCookieValue(cookieHeader, COOKIE_NAME);
  const expected = await computeAdminSessionValue(adminKey);
  if (cookie && timingSafeStringEq(cookie, expected)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = ADMIN_LOGIN_PATH;
  url.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*"],
};
