import { NextResponse } from "next/server";

export const COOKIE_NAME = "admin_session";

export function adminAuthJsonResponse() {
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}
