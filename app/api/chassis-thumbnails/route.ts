import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || !key || !publicUrl) return NextResponse.json({});

  try {
    // List top-level folders in chassis-photos bucket (one folder per chassis)
    const listRes = await fetch(`${url}/storage/v1/object/list/chassis-photos`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prefix: "", limit: 500, offset: 0, sortBy: { column: "name", order: "asc" } }),
      cache: "no-store",
    });

    if (!listRes.ok) return NextResponse.json({});
    const folders: Array<{ name: string; id: string | null }> = await listRes.json();

    const thumbnails: Record<string, string> = {};

    await Promise.all(
      folders
        .filter((f) => f.id === null) // folders have null id
        .map(async (folder) => {
          const chassis = folder.name;
          const photosRes = await fetch(`${url}/storage/v1/object/list/chassis-photos`, {
            method: "POST",
            headers: {
              apikey: key,
              Authorization: `Bearer ${key}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              prefix: `${chassis}/`,
              limit: 1,
              offset: 0,
              sortBy: { column: "created_at", order: "asc" },
            }),
            cache: "no-store",
          });
          if (!photosRes.ok) return;
          const photos: Array<{ name: string }> = await photosRes.json();
          const first = photos.find((p) => p.name !== ".emptyFolderPlaceholder");
          if (first) {
            thumbnails[chassis] = `${publicUrl}/storage/v1/object/public/chassis-photos/${chassis}/${first.name}`;
          }
        })
    );

    return NextResponse.json(thumbnails, {
      headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" },
    });
  } catch {
    return NextResponse.json({});
  }
}
