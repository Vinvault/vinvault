import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function discoursePost(path: string, body: Record<string, unknown>) {
  const apiUrl = process.env.DISCOURSE_API_URL;
  const apiKey = process.env.DISCOURSE_API_KEY;
  if (!apiUrl || !apiKey) throw new Error("Discourse not configured");

  const res = await fetch(`${apiUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Api-Key": apiKey,
      "Api-Username": "system",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Discourse API error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function POST(request: NextRequest) {
  const cookie = request.headers.get("cookie") || "";
  if (!cookie.includes("vv_admin=")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }

  const makeName = String(body.make_name || "").trim();
  const modelName = String(body.model_name || "").trim();
  if (!makeName || !modelName) {
    return NextResponse.json({ error: "make_name and model_name required" }, { status: 400 });
  }

  const categoryName = `${makeName} ${modelName}`;
  const categorySlug = slugify(categoryName);

  try {
    const parent = await discoursePost("/categories.json", {
      name: categoryName,
      slug: categorySlug,
      color: "4A90B8",
      text_color: "FFFFFF",
      description: `Discussion for the ${categoryName}`,
    });

    const parentId = parent.category?.id;
    if (!parentId) throw new Error("No category ID returned from Discourse");

    const subcategories = ["General Discussion", "Technical", "History & Provenance", "Spottings"];
    for (const sub of subcategories) {
      await discoursePost("/categories.json", {
        name: sub,
        slug: slugify(`${categorySlug}-${sub}`),
        color: "4A90B8",
        text_color: "FFFFFF",
        parent_category_id: parentId,
      });
    }

    const categoryUrl = `${process.env.DISCOURSE_API_URL}/c/${categorySlug}/${parentId}`;
    return NextResponse.json({ category_id: parentId, category_url: categoryUrl });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Forum category creation failed:", msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
