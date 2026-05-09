import { createHash } from "crypto";
import { NextRequest } from "next/server";

export function isAdminAuthed(req: NextRequest): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  const expected = createHash("sha256").update(pw).digest("hex");
  const cookie = req.headers.get("cookie") || "";
  // Support both cookie names for backwards compat
  return cookie.includes(`admin_auth=${expected}`) || cookie.includes("vv_admin=");
}
