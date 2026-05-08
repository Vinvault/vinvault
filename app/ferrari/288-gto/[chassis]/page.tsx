export const dynamic = "force-dynamic";
import Link from "next/link";
import type { Metadata } from "next";
import { ShareButton, PrintButton } from "./ChassisActions";
import ChassisComments from "./ChassisComments";
import ChassisPhotos from "./ChassisPhotos";
import ClaimButton from "./ClaimButton";
import WatchButton from "./WatchButton";
import SightingsSection from "./SightingsSection";
import RegistryEnrichForm from "./RegistryEnrichForm";

const BASE = "https://www.vinvault.net";

async function getSubmission(chassis: string) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) return null;
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/submissions?chassis_number=eq.${encodeURIComponent(chassis)}&status=eq.approved&limit=1`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }, cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data[0] ?? null;
  } catch { return null; }
}

async function getOwnerClaim(chassis: string) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) return null;
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/car_claims?chassis_number=eq.${encodeURIComponent(chassis)}&status=eq.approved&limit=1`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }, cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data[0] ?? null;
  } catch { return null; }
}

async function getSightings(chassis: string) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) return [];
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/sightings?chassis_number=eq.${encodeURIComponent(chassis)}&status=in.(approved,pending_community)&order=spotted_at.desc&limit=50`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }, cache: "no-store" }
    );
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

async function getSimilarCars(excludeChassis: string) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) return [];
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/submissions?status=eq.approved&chassis_number=neq.${encodeURIComponent(excludeChassis)}&limit=4&order=created_at.desc`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }, cache: "no-store" }
    );
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export async function generateMetadata({ params }: { params: Promise<{ chassis: string }> }): Promise<Metadata> {
  const { chassis } = await params;
  const car = await getSubmission(chassis);
  const title = car
    ? `Ferrari 288 GTO ${chassis} — VinVault Registry`
    : `${chassis} — VinVault Registry`;
  const description = car
    ? `Ferrari 288 GTO chassis ${chassis}${car.exterior_color ? `, ${car.exterior_color}` : ""}${car.original_market ? `, ${car.original_market} market` : ""}. Verified chassis record on VinVault.`
    : `Chassis ${chassis} — not yet documented in the VinVault Ferrari 288 GTO registry.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE}/ferrari/288-gto/${chassis}`,
      siteName: "VinVault Registry",
      type: "article",
    },
    twitter: { card: "summary", title, description },
  };
}

export default async function CarPage({ params }: { params: Promise<{ chassis: string }> }) {
  const { chassis } = await params;
  const [car, similar, ownerClaim, sightings] = await Promise.all([
    getSubmission(chassis),
    getSimilarCars(chassis),
    getOwnerClaim(chassis),
    getSightings(chassis),
  ]);

  const jsonLd = car ? {
    "@context": "https://schema.org",
    "@type": "ItemPage",
    "name": `Ferrari 288 GTO — ${car.chassis_number}`,
    "description": `Chassis record for Ferrari 288 GTO ${car.chassis_number}${car.exterior_color ? `, ${car.exterior_color}` : ""}`,
    "url": `${BASE}/ferrari/288-gto/${car.chassis_number}`,
    "mainEntity": {
      "@type": "Product",
      "name": "Ferrari 288 GTO",
      "brand": { "@type": "Brand", "name": "Ferrari" },
      "model": "288 GTO",
      "productID": car.chassis_number,
      "color": car.exterior_color || undefined,
      "description": car.provenance || "Verified Ferrari 288 GTO chassis record",
    },
  } : null;

  if (!car) {
    return (
      <main style={{ background: "#080F1A", color: "#E2EEF7", fontFamily: "Verdana, sans-serif", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Breadcrumb */}
        <div style={{ padding: "16px 40px", background: "#0A1828", borderBottom: "1px solid #1E3A5A", fontSize: "12px", color: "#4A6A8A" }}>
          <Link href="/" style={{ color: "#4A6A8A", textDecoration: "none" }}>Home</Link>
          {" / "}
          <Link href="/ferrari/288-gto" style={{ color: "#4A6A8A", textDecoration: "none" }}>Ferrari 288 GTO</Link>
          {" / "}
          <span style={{ color: "#8BA5B8", fontFamily: "monospace" }}>{chassis}</span>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 20px" }}>
          <div style={{ textAlign: "center", maxWidth: "520px" }}>
            <p style={{ color: "#4A90B8", letterSpacing: "3px", fontSize: "11px", marginBottom: "16px" }}>NOT YET DOCUMENTED</p>
            <h1 style={{ fontSize: "28px", marginBottom: "8px", fontFamily: "monospace", letterSpacing: "2px" }}>{chassis.toUpperCase()}</h1>
            <p style={{ color: "#8BA5B8", fontSize: "15px", lineHeight: "1.7", marginBottom: "32px" }}>
              This Ferrari 288 GTO chassis has not yet been documented in the registry. If you have information about this car, please submit it and help complete the historical record.
            </p>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href={`/submit?chassis=${encodeURIComponent(chassis)}`} style={{ background: "#4A90B8", color: "#fff", padding: "12px 28px", textDecoration: "none", fontSize: "13px", letterSpacing: "2px" }}>
                SUBMIT THIS CAR
              </Link>
              <Link href="/ferrari/288-gto" style={{ border: "1px solid #4A90B8", color: "#4A90B8", padding: "12px 28px", textDecoration: "none", fontSize: "13px" }}>
                Back to Registry
              </Link>
            </div>
          </div>
        </div>

      </main>
    );
  }

  return (
    <main style={{ background: "#080F1A", color: "#E2EEF7", fontFamily: "Verdana, sans-serif", minHeight: "100vh" }}>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      {/* Breadcrumb */}
      <div style={{ padding: "14px 40px", background: "#0A1828", borderBottom: "1px solid #1E3A5A", fontSize: "12px", color: "#4A6A8A", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
        <Link href="/" style={{ color: "#4A6A8A", textDecoration: "none" }}>Home</Link>
        <span>/</span>
        <Link href="/ferrari/288-gto" style={{ color: "#4A6A8A", textDecoration: "none" }}>Ferrari 288 GTO</Link>
        <span>/</span>
        <span style={{ color: "#8BA5B8", fontFamily: "monospace" }}>{car.chassis_number}</span>
      </div>

      {/* Hero */}
      <section className="vv-chassis-hero" style={{ padding: "48px 40px 36px", borderBottom: "1px solid #1E3A5A" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <p style={{ color: "#4A90B8", letterSpacing: "3px", fontSize: "11px", marginBottom: "16px" }}>FERRARI 288 GTO · CHASSIS RECORD</p>
            <h1 style={{ fontSize: "clamp(24px, 5vw, 36px)", fontWeight: "bold", marginBottom: "8px", fontFamily: "monospace", letterSpacing: "2px" }}>{car.chassis_number}</h1>
            <p style={{ color: "#8BA5B8" }}>
              {car.production_date ? `Produced ${car.production_date}` : ""}
              {car.production_date && car.original_market ? " · " : ""}
              {car.original_market ? `${car.original_market} market` : ""}
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", flexWrap: "wrap" }}>
            <span style={{ background: "#0D2A1A", color: "#4AB87A", padding: "8px 20px", fontSize: "12px", letterSpacing: "2px" }}>APPROVED</span>
            {ownerClaim && (
              <span style={{ background: "#0D1E36", color: "#4A90B8", padding: "8px 20px", fontSize: "12px", letterSpacing: "2px", border: "1px solid #4A90B8" }}>OWNER VERIFIED</span>
            )}
            {car.is_one_off && (
              <span style={{ background: "#1A0D2A", color: "#B87AE0", padding: "8px 20px", fontSize: "12px", letterSpacing: "2px", border: "1px solid #5A2A8A" }}>ONE-OFF</span>
            )}
            {car.is_prototype && (
              <span style={{ background: "#2A1A0D", color: "#E0B87A", padding: "8px 20px", fontSize: "12px", letterSpacing: "2px", border: "1px solid #8A5A2A" }}>PROTOTYPE</span>
            )}
            {car.is_film_car && (
              <span style={{ background: "#0D1A2A", color: "#7AB8E0", padding: "8px 20px", fontSize: "12px", letterSpacing: "2px", border: "1px solid #2A5A8A" }}>FILM CAR</span>
            )}
            {car.is_music_video_car && (
              <span style={{ background: "#1A0D1A", color: "#E07AB8", padding: "8px 20px", fontSize: "12px", letterSpacing: "2px", border: "1px solid #8A2A5A" }}>MUSIC VIDEO</span>
            )}
            <WatchButton chassis={car.chassis_number} />
            <ClaimButton chassis={car.chassis_number} />
            <ShareButton chassis={car.chassis_number} />
            <PrintButton />
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="vv-car-detail" style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "40px", marginBottom: "40px" }}>
          {/* Identity */}
          <div>
            <h2 style={{ color: "#4A90B8", fontSize: "11px", letterSpacing: "3px", marginBottom: "20px" }}>IDENTITY</h2>
            {[
              ["Chassis Number", car.chassis_number, true],
              ["Engine Number", car.engine_number, true],
              ["Gearbox Number", car.gearbox_number, true],
              ["Production Date", car.production_date, false],
              ["Original Market", car.original_market, false],
              ["Matching Numbers", car.matching_numbers, false],
            ].filter(([, v]) => v).map(([l, v, mono]) => (
              <div key={l as string} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #0D1E36", gap: "12px" }}>
                <span style={{ color: "#8BA5B8", fontSize: "14px", flexShrink: 0 }}>{l}</span>
                <span style={{ fontSize: "14px", fontFamily: mono ? "monospace" : "Verdana", textAlign: "right" }}>{String(v)}</span>
              </div>
            ))}
          </div>

          {/* Condition */}
          <div>
            <h2 style={{ color: "#4A90B8", fontSize: "11px", letterSpacing: "3px", marginBottom: "20px" }}>CONDITION & SPEC</h2>
            {[
              ["Exterior Color", car.exterior_color],
              ["Interior Color", car.interior_color],
              ["Condition Score", car.condition_score],
              ["Service History", car.has_service_history],
              ["Books Present", car.has_books],
              ["Toolkit Present", car.has_toolkit],
            ].filter(([, v]) => v).map(([l, v]) => (
              <div key={l as string} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #0D1E36", gap: "12px" }}>
                <span style={{ color: "#8BA5B8", fontSize: "14px", flexShrink: 0 }}>{l}</span>
                <span style={{ fontSize: "14px", textAlign: "right" }}>{String(v)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Registry enrichment */}
        {(() => {
          const emptyFields = (["exterior_color","interior_color","original_market","production_date","engine_number","provenance"] as const).filter(f => !car[f]);
          return emptyFields.length > 0 ? (
            <div style={{ marginBottom: "32px" }}>
              <RegistryEnrichForm chassis={car.chassis_number} emptyFields={emptyFields} />
            </div>
          ) : null;
        })()}

        {/* Provenance */}
        {car.provenance && (
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ color: "#4A90B8", fontSize: "11px", letterSpacing: "3px", marginBottom: "16px" }}>PROVENANCE & HISTORY</h2>
            <p style={{ color: "#8BA5B8", lineHeight: "1.8", background: "#0A1828", padding: "20px 24px", border: "1px solid #1E3A5A", fontSize: "15px" }}>{car.provenance}</p>
          </div>
        )}

        {/* Source */}
        {car.source && (
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ color: "#4A90B8", fontSize: "11px", letterSpacing: "3px", marginBottom: "16px" }}>SOURCE</h2>
            <p style={{ color: "#8BA5B8", background: "#0A1828", padding: "20px 24px", border: "1px solid #1E3A5A" }}>{car.source}</p>
          </div>
        )}

        {/* Special designations */}
        {(car.is_film_car || car.is_music_video_car) && (
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ color: "#4A90B8", fontSize: "11px", letterSpacing: "3px", marginBottom: "16px" }}>SPECIAL DESIGNATIONS</h2>
            {car.is_film_car && car.film_details && (
              <div style={{ background: "#0A1828", border: "1px solid #2A5A8A", padding: "20px 24px", marginBottom: "12px" }}>
                <p style={{ color: "#7AB8E0", fontSize: "11px", letterSpacing: "2px", marginBottom: "8px" }}>FILM CAR</p>
                <p style={{ color: "#8BA5B8", lineHeight: "1.7" }}>{car.film_details}</p>
              </div>
            )}
            {car.is_music_video_car && car.music_video_details && (
              <div style={{ background: "#0A1828", border: "1px solid #8A2A5A", padding: "20px 24px" }}>
                <p style={{ color: "#E07AB8", fontSize: "11px", letterSpacing: "2px", marginBottom: "8px" }}>MUSIC VIDEO CAR</p>
                <p style={{ color: "#8BA5B8", lineHeight: "1.7" }}>{car.music_video_details}</p>
              </div>
            )}
          </div>
        )}

        {/* Auction History placeholder */}
        <div style={{ marginBottom: "32px" }}>
          <h2 style={{ color: "#4A90B8", fontSize: "11px", letterSpacing: "3px", marginBottom: "16px" }}>AUCTION HISTORY</h2>
          <div style={{ background: "#0A1828", border: "1px solid #1E3A5A", padding: "24px", color: "#4A6A8A", fontSize: "14px" }}>
            <p>No auction records on file. If you know of auction appearances for this chassis, <Link href="/submit" style={{ color: "#4A90B8", textDecoration: "none" }}>submit an update</Link>.</p>
          </div>
        </div>

        {/* Meta */}
        <div style={{ marginTop: "24px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
          <p style={{ color: "#4A6A8A", fontSize: "12px" }}>
            Submitted {new Date(car.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          <Link href="/ferrari/288-gto" style={{ color: "#4A90B8", fontSize: "13px", textDecoration: "none" }}>← Back to Registry</Link>
        </div>

        {/* Photos */}
        <div style={{ marginTop: "48px", borderTop: "1px solid #1E3A5A", paddingTop: "40px" }}>
          <ChassisPhotos chassis={car.chassis_number} />
        </div>

        {/* Comments */}
        <div style={{ borderTop: "1px solid #1E3A5A", paddingTop: "40px" }}>
          <ChassisComments chassis={car.chassis_number} />
        </div>

        {/* Forum / Discussions */}
        <div style={{ borderTop: "1px solid #1E3A5A", paddingTop: "40px", marginTop: "8px" }}>
          <h2 style={{ color: "#4A90B8", fontSize: "11px", letterSpacing: "3px", marginBottom: "16px" }}>DISCUSSIONS</h2>
          <div style={{ background: "#0A1828", border: "1px solid #1E3A5A", padding: "24px" }}>
            <p style={{ color: "#8BA5B8", fontSize: "14px", lineHeight: "1.7", marginBottom: "16px" }}>
              Join the discussion about chassis {car.chassis_number} on the VinVault Forum.
            </p>
            <a
              href={`https://forum.vinvault.net/t/ferrari-288-gto-${encodeURIComponent(car.chassis_number.toLowerCase())}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#4A90B8", textDecoration: "none", fontSize: "13px", border: "1px solid #1E3A5A", padding: "10px 20px", background: "#080F1A" }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#4A90B8" strokeWidth="1.5"/><path d="M4 5h6M4 7.5h4" stroke="#4A90B8" strokeWidth="1.2" strokeLinecap="round"/></svg>
              Discuss this chassis on the forum →
            </a>
          </div>
        </div>

        {/* Sightings */}
        <div style={{ borderTop: "1px solid #1E3A5A", paddingTop: "40px", marginTop: "8px" }}>
          <SightingsSection chassis={car.chassis_number} initialSightings={sightings} />
        </div>
      </div>

      {/* Similar cars */}
      {similar.length > 0 && (
        <section style={{ borderTop: "1px solid #1E3A5A", padding: "48px 40px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <p style={{ color: "#4A90B8", letterSpacing: "3px", fontSize: "11px", marginBottom: "8px" }}>BROWSE</p>
            <h2 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "24px" }}>Other Documented 288 GTOs</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
              {similar.map((s: any) => (
                <Link key={s.id} href={`/ferrari/288-gto/${s.chassis_number}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div
                    style={{ background: "#0A1828", border: "1px solid #1E3A5A", padding: "20px 24px" }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#4A90B8")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1E3A5A")}
                  >
                    <p style={{ fontFamily: "monospace", fontSize: "14px", letterSpacing: "1px", marginBottom: "6px" }}>{s.chassis_number}</p>
                    <p style={{ color: "#4A6A8A", fontSize: "12px" }}>
                      {[s.exterior_color, s.original_market].filter(Boolean).join(" · ") || "Ferrari 288 GTO"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

    </main>
  );
}

