export const dynamic = "force-dynamic";
import Link from "next/link";
import type { Metadata } from "next";
import EnrichForm from "./EnrichForm";

const SUPA_H = () => ({
  apikey: process.env.SUPABASE_SERVICE_KEY!,
  Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY!}`,
});

interface Sighting {
  id: string;
  chassis_number: string | null;
  make_id: string;
  model_id: string;
  spotter_email: string;
  spotter_username: string | null;
  spotted_at: string;
  latitude: number;
  longitude: number;
  location_name: string;
  country: string;
  photo_url: string;
  photo_urls: string[] | null;
  numberplate_seen: string | null;
  notes: string | null;
  status: string;
  confidence_score: number;
  registry_entry_id: string | null;
  points_awarded: number;
}

async function getSighting(id: string): Promise<Sighting | null> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  try {
    const res = await fetch(`${url}/rest/v1/sightings?id=eq.${encodeURIComponent(id)}&limit=1`, {
      headers: SUPA_H(), cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data[0] ?? null;
  } catch { return null; }
}

async function getMake(id: string): Promise<string> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key || !id) return "";
  try {
    const res = await fetch(`${url}/rest/v1/makes?id=eq.${encodeURIComponent(id)}&select=name&limit=1`, {
      headers: SUPA_H(), cache: "no-store",
    });
    const data = res.ok ? await res.json() : [];
    return data[0]?.name ?? "";
  } catch { return ""; }
}

async function getModel(id: string): Promise<string> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key || !id) return "";
  try {
    const res = await fetch(`${url}/rest/v1/models?id=eq.${encodeURIComponent(id)}&select=model&limit=1`, {
      headers: SUPA_H(), cache: "no-store",
    });
    const data = res.ok ? await res.json() : [];
    return data[0]?.model ?? "";
  } catch { return ""; }
}

async function getSpotterUsername(email: string): Promise<string | null> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key || !email) return null;
  try {
    const res = await fetch(`${url}/rest/v1/spotter_profiles?user_email=eq.${encodeURIComponent(email)}&select=username&limit=1`, {
      headers: SUPA_H(), cache: "no-store",
    });
    const data = res.ok ? await res.json() : [];
    return data[0]?.username ?? null;
  } catch { return null; }
}

async function getRegistryChassis(id: string): Promise<string | null> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key || !id) return null;
  try {
    const res = await fetch(`${url}/rest/v1/submissions?id=eq.${encodeURIComponent(id)}&select=chassis_number&limit=1`, {
      headers: SUPA_H(), cache: "no-store",
    });
    const data = res.ok ? await res.json() : [];
    return data[0]?.chassis_number ?? null;
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const s = await getSighting(id);
  if (!s) return { title: "Spotting Not Found" };
  const [makeName, modelName] = await Promise.all([getMake(s.make_id), getModel(s.model_id)]);
  return {
    title: `${makeName} ${modelName} spotted in ${s.country}`,
    description: `${makeName} ${modelName} spotted at ${s.location_name}, ${s.country} on ${new Date(s.spotted_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`,
  };
}

export default async function SpottingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await getSighting(id);

  if (!s) {
    return (
      <main style={{ background: "#F8F6F1", color: "#1A1A1A", fontFamily: "Verdana, sans-serif", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <h1 style={{ fontSize: "24px", marginBottom: "16px" }}>Spotting not found</h1>
          <Link href="/spotters" style={{ color: "#C9A84C" }}>Back to Spotters</Link>
        </div>
      </main>
    );
  }

  const [makeName, modelName] = await Promise.all([getMake(s.make_id), getModel(s.model_id)]);
  const spotterUsername = s.spotter_username || await getSpotterUsername(s.spotter_email);
  const registryChassis = s.registry_entry_id ? await getRegistryChassis(s.registry_entry_id) : null;

  const photos = s.photo_urls?.length ? s.photo_urls : (s.photo_url ? [s.photo_url] : []);
  const vinKnown = Boolean(s.chassis_number);
  const missingPlate = !s.numberplate_seen;
  const missingVin = !vinKnown;
  const missingRegistryLink = vinKnown && !s.registry_entry_id;
  const hasCommunityWork = missingPlate || missingVin || missingRegistryLink;

  const date = new Date(s.spotted_at);
  const dateStr = date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const timeStr = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  return (
    <main style={{ background: "#F8F6F1", color: "#1A1A1A", fontFamily: "Verdana, sans-serif", minHeight: "100vh" }}>
      {/* Breadcrumb */}
      <div className="vv-spotting-breadcrumb" style={{ padding: "16px 40px", borderBottom: "1px solid #E8E2D8" }}>
        <p style={{ color: "#9A8A7A", fontSize: "12px" }}>
          <Link href="/spotters" style={{ color: "#C9A84C", textDecoration: "none" }}>Spotters</Link>
          {" / "}
          <span>{makeName} {modelName}</span>
        </p>
      </div>

      <div className="vv-spotting-page" style={{ maxWidth: "900px", margin: "0 auto", padding: "48px 40px" }}>

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <p style={{ color: "#C9A84C", fontSize: "11px", letterSpacing: "3px", marginBottom: "8px" }}>SPOTTING RECORD</p>
          <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "8px" }}>{makeName} {modelName}</h1>
          <p style={{ color: "#6A5A4A", fontSize: "14px" }}>{s.location_name}, {s.country} · {dateStr} at {timeStr}</p>
        </div>

        {/* Photo gallery */}
        {photos.length > 0 && <PhotoGallery photos={photos} alt={`${makeName} ${modelName}`} />}

        {/* VIN unknown banner */}
        {missingVin && (
          <div style={{ background: "#FFFBE8", border: "1px solid #8A6A00", padding: "16px 20px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <p style={{ color: "#E0C060", fontSize: "13px", flex: 1, margin: 0 }}>
              VIN not yet identified — look it up and earn 50 points.
            </p>
            <Link href="/vin-lookup"
              style={{ background: "#FBF3E0", border: "1px solid #8A6A00", color: "#E0C060", padding: "8px 16px", textDecoration: "none", fontSize: "12px", letterSpacing: "1px", flexShrink: 0 }}>
              VIN LOOKUP →
            </Link>
          </div>
        )}

        <div className="vv-spotting-detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>

          {/* Left: details */}
          <div>
            <h2 style={{ color: "#C9A84C", fontSize: "11px", letterSpacing: "3px", marginBottom: "20px", borderBottom: "1px solid #E8E2D8", paddingBottom: "12px" }}>DETAILS</h2>

            <DetailRow label="Car" value={`${makeName} ${modelName}`} />
            <DetailRow label="Spotted" value={`${dateStr}, ${timeStr}`} />
            <DetailRow label="Location" value={`${s.location_name}, ${s.country}`} />
            <DetailRow
              label="Spotter"
              value={spotterUsername ? `@${spotterUsername}` : s.spotter_email?.split("@")[0] || "Anonymous"}
              href={spotterUsername ? `/spotters/${spotterUsername}` : undefined}
            />
            {s.numberplate_seen && <DetailRow label="Numberplate" value={s.numberplate_seen} mono />}
            {s.chassis_number && (
              <DetailRow
                label="VIN / Chassis"
                value={s.chassis_number}
                href={registryChassis ? `/ferrari/288-gto/${s.chassis_number}` : undefined}
                mono
              />
            )}
            {s.notes && (
              <div style={{ marginBottom: "16px" }}>
                <p style={{ color: "#9A8A7A", fontSize: "11px", letterSpacing: "1px", marginBottom: "4px" }}>NOTES</p>
                <p style={{ color: "#1A1A1A", fontSize: "13px", lineHeight: "1.7" }}>{s.notes}</p>
              </div>
            )}

            {registryChassis && (
              <div style={{ marginTop: "20px" }}>
                <Link href={`/ferrari/288-gto/${s.chassis_number}`}
                  style={{ background: "#FFFDF8", border: "1px solid #C9A84C", color: "#C9A84C", padding: "10px 20px", textDecoration: "none", fontSize: "13px", letterSpacing: "1px", display: "inline-block" }}>
                  VIEW FULL REGISTRY ENTRY →
                </Link>
              </div>
            )}
          </div>

          {/* Right: status & enrichment */}
          <div>
            <h2 style={{ color: "#C9A84C", fontSize: "11px", letterSpacing: "3px", marginBottom: "20px", borderBottom: "1px solid #E8E2D8", paddingBottom: "12px" }}>STATUS</h2>

            <div style={{ background: "#FFFDF8", border: "1px solid #E8E2D8", padding: "16px 20px", marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ color: "#6A5A4A", fontSize: "11px", letterSpacing: "1px" }}>CONFIDENCE</span>
                <span style={{ fontSize: "18px", fontWeight: "bold", color: s.confidence_score >= 70 ? "#4AB87A" : s.confidence_score >= 40 ? "#B8944A" : "#E07070" }}>
                  {s.confidence_score}/100
                </span>
              </div>
              <div style={{ background: "#F8F6F1", height: "4px", borderRadius: "2px" }}>
                <div style={{ height: "4px", borderRadius: "2px", width: `${s.confidence_score}%`, background: s.confidence_score >= 70 ? "#4AB87A" : s.confidence_score >= 40 ? "#B8944A" : "#E07070" }} />
              </div>
              <p style={{ color: "#9A8A7A", fontSize: "11px", marginTop: "8px" }}>
                {s.status === "approved" ? "Verified — live on map" : s.status === "pending_community" ? "Awaiting community confirmation" : "Under review"}
              </p>
            </div>

            {hasCommunityWork && (
              <EnrichForm
                sightingId={s.id}
                missingPlate={missingPlate}
                missingVin={missingVin}
                missingRegistryLink={missingRegistryLink}
              />
            )}
          </div>
        </div>

        {/* Bottom nav */}
        <div style={{ marginTop: "48px", paddingTop: "24px", borderTop: "1px solid #E8E2D8", display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <Link href="/spot" style={{ background: "#C9A84C", color: "#fff", padding: "10px 24px", textDecoration: "none", fontSize: "13px", letterSpacing: "1px" }}>
            + SUBMIT A SPOTTING
          </Link>
          <Link href="/spotters" style={{ border: "1px solid #E8E2D8", color: "#6A5A4A", padding: "10px 24px", textDecoration: "none", fontSize: "13px", letterSpacing: "1px" }}>
            LEADERBOARD
          </Link>
        </div>
      </div>
    </main>
  );
}

function DetailRow({ label, value, href, mono }: { label: string; value: string; href?: string; mono?: boolean }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <p style={{ color: "#9A8A7A", fontSize: "11px", letterSpacing: "1px", marginBottom: "2px" }}>{label.toUpperCase()}</p>
      {href ? (
        <Link href={href} style={{ color: "#C9A84C", fontSize: "13px", textDecoration: "none", fontFamily: mono ? "monospace" : "inherit" }}>
          {value}
        </Link>
      ) : (
        <p style={{ color: "#1A1A1A", fontSize: "13px", fontFamily: mono ? "monospace" : "inherit" }}>{value}</p>
      )}
    </div>
  );
}

function PhotoGallery({ photos, alt }: { photos: string[]; alt: string }) {
  if (photos.length === 1) {
    return (
      <div style={{ marginBottom: "32px" }}>
        <img src={photos[0]} alt={alt} style={{ width: "100%", maxHeight: "480px", objectFit: "cover", border: "1px solid #E8E2D8" }} />
      </div>
    );
  }
  return (
    <div style={{ marginBottom: "32px" }}>
      <img src={photos[0]} alt={alt} style={{ width: "100%", maxHeight: "420px", objectFit: "cover", border: "1px solid #E8E2D8", marginBottom: "8px" }} />
      <div style={{ display: "flex", gap: "8px", overflowX: "auto" }}>
        {photos.slice(1).map((src, i) => (
          <img key={i} src={src} alt={`${alt} ${i + 2}`}
            style={{ height: "90px", width: "120px", objectFit: "cover", border: "1px solid #E8E2D8", flexShrink: 0 }} />
        ))}
      </div>
    </div>
  );
}
