import { NextRequest } from "next/server";

const ALLOWED_ORIGINS = [
  "https://www.vinvault.net",
  "https://vinvault.net",
  "http://localhost:3000",
];

export function verifyCsrf(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  // Allow requests with matching origin
  if (origin) {
    return ALLOWED_ORIGINS.some((o) => origin === o || origin.startsWith(o));
  }

  // Fall back to referer check
  if (referer) {
    return ALLOWED_ORIGINS.some((o) => referer.startsWith(o));
  }

  // No origin or referer — only allow from same host via server actions
  return false;
}
