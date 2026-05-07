import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const cookie = request.headers.get("cookie") || "(none)";
  const hasCookie = request.cookies.has("vv_admin");
  return NextResponse.json({ 
    cookie_header: cookie,
    has_vv_admin: hasCookie,
    all_cookies: request.cookies.getAll()
  });
}
