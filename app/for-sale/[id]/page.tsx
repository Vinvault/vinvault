"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { colors } from "@/app/components/ui/tokens";

interface Listing {
  id: string; asking_price: number; currency: string; description: string | null;
  location_city: string | null; location_country: string | null; contact_via: string;
  is_active: boolean; expires_at: string; sold_at: string | null; created_at: string;
  seller_username: string | null; make_name: string; model: string; submodel: string | null;
  year: number | null; color: string | null; mileage: number | null; mileage_unit: string;
  cover_photo: string | null; photos: Array<{ photo_url: string; is_cover: boolean }>;
  vin: string | null; user_email: string;
}

function daysLeft(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

function fmtPrice(price: number, currency: string) {
  return new Intl.NumberFormat("en-EU", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
}

export default function ListingDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [igModal, setIgModal] = useState(false);
  const [igData, setIgData] = useState<{ caption: string } | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUserEmail(user?.email ?? null));
  }, []);

  const load = useCallback(async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;

    // Fetch listing
    const res = await fetch(`/api/garage/listings/public?limit=1`);
    if (!res.ok) { setLoading(false); return; }
    // Try direct fetch for single listing
    const svcRes = await fetch(`/api/garage/listing/${id}`);
    if (svcRes.ok) {
      setListing(await svcRes.json());
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    // Fetch single listing directly
    async function fetchListing() {
      const res = await fetch(`/api/garage/listing/${id}`);
      if (res.ok) setListing(await res.json());
      setLoading(false);
    }
    fetchListing();
  }, [id]);

  async function generateIg() {
    const res = await fetch(`/api/garage/instagram-caption?listing_id=${id}`);
    if (res.ok) {
      setIgData(await res.json());
      setIgModal(true);
    }
  }

  if (loading) return <main style={{ background: colors.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ fontFamily: "Georgia, serif", color: colors.textMuted, fontStyle: "italic" }}>Loading…</p></main>;
  if (!listing) return (
    <main style={{ background: colors.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontFamily: "Georgia, serif", fontSize: "20px", color: colors.textMuted, marginBottom: "16px" }}>Listing not found.</p>
        <Link href="/for-sale" style={{ color: colors.accentBlue, fontFamily: "Verdana, sans-serif", fontSize: "12px", letterSpacing: "1px" }}>← Back to For Sale</Link>
      </div>
    </main>
  );

  const days = listing.is_active ? daysLeft(listing.expires_at) : 0;
  const isOwner = userEmail === listing.user_email;
  const photos = listing.photos || [];
  const vin = listing.vin?.trim();

  return (
    <main style={{ background: colors.bg, minHeight: "100vh", color: colors.textPrimary }}>
      <nav aria-label="Breadcrumb" style={{ padding: "14px 40px", background: colors.surface, borderBottom: `1px solid ${colors.border}`, fontSize: "12px", color: colors.textMuted, display: "flex", gap: "6px", fontFamily: "Verdana, sans-serif" }}>
        <Link href="/" style={{ color: colors.textMuted, textDecoration: "none" }}>Home</Link>
        <span>/</span>
        <Link href="/for-sale" style={{ color: colors.textMuted, textDecoration: "none" }}>For Sale</Link>
        <span>/</span>
        <span style={{ color: colors.textSecondary }}>{listing.make_name} {listing.model}</span>
      </nav>

      <div className="vv-page-container" style={{ maxWidth: "900px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "48px", alignItems: "start" }}>
          {/* Left: Photos */}
          <div>
            <div style={{ aspectRatio: "4/3", background: colors.surfaceAlt, position: "relative", overflow: "hidden", marginBottom: "12px" }}>
              {photos.length > 0 ? (
                <img src={photos[photoIdx]?.photo_url || listing.cover_photo || ""} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : listing.cover_photo ? (
                <img src={listing.cover_photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  <span style={{ fontSize: "72px" }}>🚗</span>
                </div>
              )}
              {!listing.is_active && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#fff", fontFamily: "Georgia, serif", fontSize: "32px", fontWeight: "bold" }}>SOLD</span>
                </div>
              )}
            </div>
            {photos.length > 1 && (
              <div style={{ display: "flex", gap: "8px", overflowX: "auto" }}>
                {photos.map((p, i) => (
                  <button key={i} onClick={() => setPhotoIdx(i)} style={{ width: "72px", height: "54px", overflow: "hidden", border: i === photoIdx ? `2px solid ${colors.accent}` : `2px solid transparent`, padding: 0, cursor: "pointer", flexShrink: 0 }}>
                    <img src={p.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div>
            <p style={{ color: colors.accent, letterSpacing: "3px", fontSize: "11px", marginBottom: "8px", fontFamily: "Verdana, sans-serif", textTransform: "uppercase" }}>For Sale</p>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: "28px", fontWeight: "bold", marginBottom: "4px", lineHeight: 1.2 }}>
              {listing.year && `${listing.year} `}{listing.make_name} {listing.model}
            </h1>
            {listing.submodel && <p style={{ fontFamily: "Georgia, serif", fontSize: "15px", color: colors.textSecondary, marginBottom: "16px" }}>{listing.submodel}</p>}

            <p style={{ fontFamily: "Georgia, serif", fontSize: "36px", fontWeight: "bold", color: colors.accent, margin: "20px 0" }}>
              {fmtPrice(listing.asking_price, listing.currency)}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
              {listing.color && <p style={{ fontFamily: "Verdana, sans-serif", fontSize: "12px", color: colors.textSecondary }}><span style={{ color: colors.textMuted }}>Color:</span> {listing.color}</p>}
              {listing.mileage && <p style={{ fontFamily: "Verdana, sans-serif", fontSize: "12px", color: colors.textSecondary }}><span style={{ color: colors.textMuted }}>Mileage:</span> {listing.mileage.toLocaleString()} {listing.mileage_unit}</p>}
              {(listing.location_city || listing.location_country) && (
                <p style={{ fontFamily: "Verdana, sans-serif", fontSize: "12px", color: colors.textSecondary }}><span style={{ color: colors.textMuted }}>Location:</span> {[listing.location_city, listing.location_country].filter(Boolean).join(", ")}</p>
              )}
              {listing.seller_username && (
                <p style={{ fontFamily: "Verdana, sans-serif", fontSize: "12px", color: colors.textSecondary }}><span style={{ color: colors.textMuted }}>Seller:</span> @{listing.seller_username}</p>
              )}
            </div>

            {listing.is_active && (
              <div style={{ background: days < 7 ? "#FBF3E0" : colors.surface, border: `1px solid ${days < 7 ? colors.accent : colors.border}`, padding: "8px 14px", marginBottom: "20px", display: "inline-block" }}>
                <span style={{ fontFamily: "Verdana, sans-serif", fontSize: "10px", color: days < 7 ? "#8A6A1A" : colors.textMuted, letterSpacing: "1px" }}>
                  {days === 0 ? "EXPIRES TODAY" : `${days} DAYS REMAINING`}
                </span>
              </div>
            )}

            {listing.is_active ? (
              <div style={{ marginBottom: "16px" }}>
                {userEmail ? (
                  <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, padding: "20px" }}>
                    <p style={{ fontFamily: "Verdana, sans-serif", fontSize: "11px", color: colors.textMuted, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>Contact Seller</p>
                    {listing.contact_via === "email" ? (
                      <a href={`mailto:${listing.user_email}`} style={{ color: colors.accentBlue, fontFamily: "Verdana, sans-serif", fontSize: "13px" }}>Send Email →</a>
                    ) : (
                      <p style={{ fontFamily: "Georgia, serif", fontSize: "14px", color: colors.textSecondary }}>Contact via VinVault — message feature coming soon.</p>
                    )}
                  </div>
                ) : (
                  <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, padding: "20px", textAlign: "center" }}>
                    <p style={{ fontFamily: "Georgia, serif", fontSize: "14px", color: colors.textSecondary, marginBottom: "12px" }}>Sign in to contact the seller</p>
                    <Link href="/login" style={{ background: colors.accent, color: "#1A1A1A", padding: "10px 24px", textDecoration: "none", fontFamily: "Verdana, sans-serif", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase" }}>Sign In</Link>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ background: colors.surfaceAlt, border: `1px solid ${colors.border}`, padding: "16px", marginBottom: "16px" }}>
                <p style={{ fontFamily: "Verdana, sans-serif", fontSize: "11px", color: colors.textMuted, textTransform: "uppercase", letterSpacing: "1px" }}>
                  {listing.sold_at ? `Sold ${new Date(listing.sold_at).toLocaleDateString("en-GB")}` : "Listing Expired"}
                </p>
              </div>
            )}

            {isOwner && listing.is_active && (
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "12px" }}>
                <button onClick={generateIg} style={{ border: `1px solid ${colors.border}`, background: "none", color: colors.textSecondary, padding: "8px 16px", cursor: "pointer", fontFamily: "Verdana, sans-serif", fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase" }}>
                  Generate Instagram Post
                </button>
                <button onClick={() => fetch(`/api/garage/listings/${id}/renew`, { method: "POST" }).then(() => window.location.reload())}
                  style={{ border: `1px solid ${colors.accent}`, background: "none", color: colors.accent, padding: "8px 16px", cursor: "pointer", fontFamily: "Verdana, sans-serif", fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase" }}>
                  Renew Listing
                </button>
                <button onClick={() => { if (confirm("Mark as sold?")) fetch(`/api/garage/listings/${id}/sold`, { method: "POST" }).then(() => window.location.reload()); }}
                  style={{ border: `1px solid ${colors.success}`, background: "none", color: colors.success, padding: "8px 16px", cursor: "pointer", fontFamily: "Verdana, sans-serif", fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase" }}>
                  Mark Sold
                </button>
              </div>
            )}

            {/* Vehicle History */}
            {vin && (
              <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: `1px solid ${colors.border}` }}>
                <p style={{ color: colors.accent, letterSpacing: "3px", fontSize: "9px", marginBottom: "12px", fontFamily: "Verdana, sans-serif", textTransform: "uppercase" }}>Vehicle History Reports</p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {[
                    { label: "CarVertical →", url: `https://www.carvertical.com/en/check?vin=${vin}` },
                    { label: "Carfax →", url: `https://www.carfax.com/VehicleHistory/ar20/select.cfx?vin=${vin}` },
                    { label: "NHTSA →", url: `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json` },
                  ].map(link => (
                    <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" style={{ border: `1px solid ${colors.border}`, color: colors.accentBlue, fontFamily: "Verdana, sans-serif", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", padding: "8px 16px", textDecoration: "none" }}>
                      {link.label}
                    </a>
                  ))}
                </div>
                <p style={{ color: colors.textMuted, fontSize: "10px", fontFamily: "Verdana, sans-serif", marginTop: "6px" }}>External services — VinVault is not affiliated with these providers</p>
              </div>
            )}

            <p style={{ marginTop: "24px" }}>
              <a href={`/for-sale?report=${id}`} style={{ color: colors.textMuted, fontFamily: "Verdana, sans-serif", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", textDecoration: "underline" }}>Report listing</a>
            </p>
          </div>
        </div>

        {/* Description */}
        {listing.description && (
          <div style={{ marginTop: "48px", paddingTop: "40px", borderTop: `1px solid ${colors.border}` }}>
            <p style={{ color: colors.accent, letterSpacing: "3px", fontSize: "11px", marginBottom: "16px", fontFamily: "Verdana, sans-serif", textTransform: "uppercase" }}>Description</p>
            <p style={{ fontFamily: "Georgia, serif", fontSize: "15px", lineHeight: "1.8", color: colors.textSecondary, whiteSpace: "pre-wrap" }}>{listing.description}</p>
          </div>
        )}
      </div>

      {/* Instagram modal */}
      {igModal && igData && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: colors.surface, maxWidth: "560px", width: "100%", padding: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "20px", margin: 0 }}>Instagram Post</h2>
              <button onClick={() => setIgModal(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: colors.textMuted }}>✕</button>
            </div>
            <div style={{ background: colors.surfaceAlt, padding: "16px", marginBottom: "20px" }}>
              <img src={`/api/garage/instagram-card?listing_id=${id}`} alt="Instagram card" style={{ width: "100%", aspectRatio: "1", objectFit: "cover" }} />
            </div>
            <p style={{ fontFamily: "Verdana, sans-serif", fontSize: "10px", color: colors.textMuted, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>Caption</p>
            <textarea readOnly value={igData.caption} style={{ width: "100%", minHeight: "160px", padding: "12px", fontFamily: "Verdana, sans-serif", fontSize: "12px", border: `1px solid ${colors.border}`, background: "#FFFDF8", color: colors.textPrimary, resize: "none", boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
              <a href={`/api/garage/instagram-card?listing_id=${id}`} download={`vinvault-${id}.png`} style={{ background: colors.accent, color: "#1A1A1A", padding: "10px 20px", textDecoration: "none", fontFamily: "Verdana, sans-serif", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase" }}>Download Image</a>
              <button onClick={() => navigator.clipboard.writeText(igData.caption)} style={{ border: `1px solid ${colors.border}`, background: "none", color: colors.textSecondary, padding: "10px 20px", cursor: "pointer", fontFamily: "Verdana, sans-serif", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase" }}>Copy Caption</button>
            </div>
            <p style={{ color: colors.textMuted, fontSize: "11px", fontFamily: "Verdana, sans-serif", marginTop: "16px", lineHeight: "1.6" }}>Download the image and copy the caption, then post to Instagram.</p>
          </div>
        </div>
      )}
    </main>
  );
}
