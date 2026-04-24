import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { computeAdminSessionValue } from "@/lib/admin-session";
import { COOKIE_NAME } from "@/lib/auth-admin";

export async function POST(request: Request) {
  const body = (await request.json()) as { secret?: string };
  const key = process.env.ADMIN_API_KEY;

  if (!key) {
    return NextResponse.json({ message: "Admin is not configured." }, { status: 503 });
  }

  if (!body.secret || body.secret !== key) {
    return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
  }

  const token = await computeAdminSessionValue(key);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ ok: true });
}
