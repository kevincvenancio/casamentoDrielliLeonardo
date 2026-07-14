import crypto from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "admin_auth";

/** Token derivado da senha admin, usado como valor do cookie httpOnly. */
export function adminToken(): string {
  const pwd = process.env.ADMIN_PASSWORD ?? "";
  return crypto.createHash("sha256").update(`admin:${pwd}`).digest("hex");
}

export function isAdminAuthenticated(): boolean {
  const pwd = process.env.ADMIN_PASSWORD;
  if (!pwd) return false;
  const cookie = cookies().get(ADMIN_COOKIE)?.value;
  if (!cookie) return false;
  const expected = adminToken();
  try {
    return crypto.timingSafeEqual(
      Buffer.from(cookie),
      Buffer.from(expected)
    );
  } catch {
    return false;
  }
}
