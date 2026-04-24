const SALT = "salon-admin-v1";

export async function computeAdminSessionValue(secret: string) {
  const data = new TextEncoder().encode(`${secret}:${SALT}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function isValidAdminSessionCookie(cookieValue: string | undefined, adminKey: string) {
  if (!cookieValue || !adminKey) return false;
  const expected = await computeAdminSessionValue(adminKey);
  return constantTimeEqual(cookieValue, expected);
}

function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
