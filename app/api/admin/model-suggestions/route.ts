import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
export const dynamic = "force-dynamic";

const h = () => ({
  apikey: process.env.SUPABASE_SERVICE_KEY!,
  Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY!}`,
  "Content-Type": "application/json",
});

function isAdmin(req: NextRequest) { return isAdminAuthed(req); }

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = process.env.SUPABASE_URL;
  if (!url) return NextResponse.json([]);

  const res = await fetch(
    `${url}/rest/v1/sightings?needs_model_review=eq.true&select=id,unverified_make,unverified_model,spotter_email,spotted_at,make_id,model_id&order=spotted_at.desc&limit=500`,
    { headers: h(), cache: "no-store" }
  );
  if (!res.ok) return NextResponse.json([]);
  const rows: { id: string; unverified_make: string | null; unverified_model: string | null; spotter_email: string; spotted_at: string; make_id: string | null; model_id: string | null }[] = await res.json();

  // Group by unverified_make + unverified_model
  const groups = new Map<string, { make: string; model: string; count: number; firstSpotter: string; firstDate: string; ids: string[] }>();
  for (const r of rows) {
    const make = r.unverified_make || "(known brand)";
    const model = r.unverified_model || "(unknown)";
    const key = `${make}|||${model}`;
    if (!groups.has(key)) {
      groups.set(key, { make, model, count: 0, firstSpotter: r.spotter_email, firstDate: r.spotted_at, ids: [] });
    }
    const g = groups.get(key)!;
    g.count++;
    g.ids.push(r.id);
    if (new Date(r.spotted_at) < new Date(g.firstDate)) {
      g.firstDate = r.spotted_at;
      g.firstSpotter = r.spotter_email;
    }
  }

  return NextResponse.json(Array.from(groups.values()).sort((a, b) => b.count - a.count));
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = process.env.SUPABASE_URL;
  if (!url) return NextResponse.json({ error: "Config" }, { status: 500 });

  const { action, make: makeName, model: modelName, ids, firstSpotter } = await req.json();
  const headers = h();

  if (action === "reject") {
    // Just clear the review flag on all matching sightings
    await fetch(`${url}/rest/v1/sightings?id=in.(${ids.join(",")})`, {
      method: "PATCH",
      headers: { ...headers, Prefer: "return=minimal" },
      body: JSON.stringify({ needs_model_review: false }),
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "approve") {
    // 1. Find or create the make
    let makeId: string | null = null;
    if (makeName && makeName !== "(known brand)") {
      const lookupRes = await fetch(`${url}/rest/v1/makes?name=eq.${encodeURIComponent(makeName)}&limit=1`, { headers });
      if (lookupRes.ok) {
        const existing = await lookupRes.json();
        if (existing.length > 0) {
          makeId = existing[0].id;
        } else {
          const slug = makeName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
          const createRes = await fetch(`${url}/rest/v1/makes`, {
            method: "POST",
            headers: { ...headers, Prefer: "return=representation" },
            body: JSON.stringify({ name: makeName, slug }),
          });
          if (createRes.ok) makeId = (await createRes.json())[0]?.id || null;
        }
      }
    } else {
      // Known brand — look up make_id from a sighting
      const sightingRes = await fetch(
        `${url}/rest/v1/sightings?id=eq.${ids[0]}&select=make_id`,
        { headers }
      );
      if (sightingRes.ok) {
        const s = await sightingRes.json();
        makeId = s[0]?.make_id || null;
      }
    }

    // 2. Insert model if not exists
    let modelId: string | null = null;
    if (makeId && modelName) {
      const existRes = await fetch(
        `${url}/rest/v1/models?make_id=eq.${makeId}&model=eq.${encodeURIComponent(modelName)}&limit=1`,
        { headers }
      );
      if (existRes.ok) {
        const existingModels = await existRes.json();
        if (existingModels.length > 0) {
          modelId = existingModels[0].id;
        } else {
          // Get make name for full_model_name
          const makeNameForModel = makeName !== "(known brand)" ? makeName : (
            await fetch(`${url}/rest/v1/makes?id=eq.${makeId}&select=name`, { headers })
              .then(r => r.ok ? r.json() : [])
              .then(rows => rows[0]?.name || "")
          );
          const insertRes = await fetch(`${url}/rest/v1/models`, {
            method: "POST",
            headers: { ...headers, Prefer: "return=representation" },
            body: JSON.stringify({
              make: makeNameForModel,
              model: modelName,
              full_model_name: `${makeNameForModel} ${modelName}`,
              production_start_year: new Date().getFullYear(),
              is_active: true,
            }),
          });
          if (insertRes.ok) modelId = (await insertRes.json())[0]?.id || null;
        }
      }
    }

    // 3. Update all sightings in the group
    await fetch(`${url}/rest/v1/sightings?id=in.(${ids.join(",")})`, {
      method: "PATCH",
      headers: { ...headers, Prefer: "return=minimal" },
      body: JSON.stringify({
        needs_model_review: false,
        unverified_make: null,
        unverified_model: null,
        ...(makeId ? { make_id: makeId } : {}),
        ...(modelId ? { model_id: modelId } : {}),
      }),
    });

    // 4. Award 25 bonus points to first spotter
    if (firstSpotter && firstSpotter !== "anonymous") {
      await fetch(`${url}/rest/v1/points_log`, {
        method: "POST",
        headers: { ...headers, Prefer: "return=minimal" },
        body: JSON.stringify({
          user_email: firstSpotter,
          action: "model_suggestion_approved",
          points: 25,
          reference_id: ids[0] || null,
        }),
      }).catch(() => {});

      // Update spotter profile points
      const profileRes = await fetch(`${url}/rest/v1/spotter_profiles?user_email=eq.${encodeURIComponent(firstSpotter)}&limit=1`, { headers });
      if (profileRes.ok) {
        const profiles = await profileRes.json();
        if (profiles.length > 0) {
          const p = profiles[0];
          const notification = { type: "model_approved", text: `Your spotted model "${makeName !== "(known brand)" ? makeName + " " : ""}${modelName}" has been added to the registry! +25 bonus points`, date: new Date().toISOString() };
          const existingNotifs: unknown[] = Array.isArray(p.pending_notifications) ? p.pending_notifications : [];
          await fetch(`${url}/rest/v1/spotter_profiles?user_email=eq.${encodeURIComponent(firstSpotter)}`, {
            method: "PATCH",
            headers: { ...headers, Prefer: "return=minimal" },
            body: JSON.stringify({
              total_points: (p.total_points || 0) + 25,
              pending_notifications: [...existingNotifs, notification],
            }),
          }).catch(() => {});
        }
      }
    }

    return NextResponse.json({ ok: true, makeId, modelId });
  }

  if (action === "mark_variant") {
    // Just clear review flag — it's a known variant, no new model needed
    await fetch(`${url}/rest/v1/sightings?id=in.(${ids.join(",")})`, {
      method: "PATCH",
      headers: { ...headers, Prefer: "return=minimal" },
      body: JSON.stringify({ needs_model_review: false }),
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
