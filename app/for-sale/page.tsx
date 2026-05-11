"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { colors } from "@/app/components/ui/tokens";

interface Listing {
  id: string; asking_price: number; currency: string; location_city: string | null;
  location_country: string | null; is_active: boolean; expires_at: string; sold_at: string | null;
  created_at: string; seller_username: string | null; make_name: string; model: string;
  submodel: string | null; year: number | null; color: string | null; mileage: number | null;
  mileage_unit: string; cover_photo: string | null;
}

function fmtPrice(price: number, currency: string) {
  return new Intl.NumberFormat("en-EU", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
}
function daysLeft(expiresAt: string) {
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000));
}

export default function ForSalePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [sold, setSold] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const carouselTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Filters
  const [filterMake, setFilterMake] = useState("");
  const [filterYearFrom, setFilterYearFrom] = useState("");
  const [filterYearTo, setFilterYearTo] = useState("");
  const [filterPriceFrom, setFilterPriceFrom] = useState("");
  const [filterPriceTo, setFilterPriceTo] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    async function load() {
      const [activeRes, soldRes] = await Promise.all([
        fetch("/api/garage/listings/public?limit=100"),
        fetch("/api/garage/listings/public?include_sold=true&limit=20"),
      ]);
      const active = activeRes.ok ? await activeRes.json() : [];
      const all = soldRes.ok ? await soldRes.json() : [];
      setListings(active.filter((l: Listing) => l.is_active));
      setSold(all.filter((l: Listing) => !l.is_active));
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (listings.length <= 1) return;
    carouselTimer.current = setInterval(() => setCarouselIdx(i => (i + 1) % Math.min(5, listings.length)), 5000);
    return () => { if (carouselTimer.current) clearInterval(carouselTimer.current); };
  }, [listings]);

  const featured = listings.slice(0, 5);

  const filtered = listings.filter(l => {
    if (filterMake && !l.make_name.toLowerCase().includes(filterMake.toLowerCase())) return false;
    if (filterYearFrom && l.year && l.year < Number(filterYearFrom)) return false;
    if (filterYearTo && l.year && l.year > Number(filterYearTo)) return false;
    if (filterPriceFrom && l.asking_price < Number(filterPriceFrom)) return false;
    if (filterPriceTo && l.asking_price > Number(filterPriceTo)) return false;
    if (filterCountry && l.location_country && !l.location_country.toLowerCase().includes(filterCountry.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === "price_asc") return a.asking_price - b.asking_price;
    if (sortBy === "price_desc") return b.asking_price - a.asking_price;
    if (sortBy === "ending_soon") return new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime();
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const makes = [...new Set(listings.map(l => l.make_name))].sort();
  const countries = [...new Set(listings.map(l => l.location_country).filter(Boolean))].sort() as string[];

  const inputStyle: React.CSSProperties = {
    padding: "8px 12px", border: `1px solid ${colors.border}`, background: "#FFFDF8",
    fontFamily: "Verdana, sans-serif", fontSize: "12px", color: colors.textPrimary, outline: "none",
  };

  return (
    <main style={{ background: colors.bg, minHeight: "100vh", color: colors.textPrimary }}>
      {/* Hero */}
      <section style={{ background: colors.surface, borderBottom: `1px solid ${colors.border}`, padding: "64px 40px", textAlign: "center" }}>
        <p style={{ color: colors.accent, letterSpacing: "4px", fontSize: "11px", marginBottom: "16px", fontFamily: "Verdana, sans-serif", textTransform: "uppercase" }}>Marketplace</p>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "40px", fontWeight: "bold", marginBottom: "12px", color: colors.textPrimary }}>Cars For Sale</h1>
        <p style={{ color: colors.textSecondary, fontFamily: "Georgia, serif", fontSize: "16px", marginBottom: "28px", maxWidth: "560px", margin: "0 auto 28px" }}>Rare and collectible cars listed by verified VinVault members</p>
        <div style={{ display: "flex", gap: "32px", justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { n: listings.length, l: "Cars Listed" },
            { n: makes.length, l: "Makes" },
            { n: countries.length, l: "Countries" },
          ].map(s => (
            <div key={s.l}>
              <span style={{ fontFamily: "Georgia, serif", fontSize: "28px", fontWeight: "bold", color: colors.accent }}>{s.n}</span>
              <span style={{ fontFamily: "Verdana, sans-serif", fontSize: "11px", color: colors.textMuted, letterSpacing: "1px", marginLeft: "8px" }}>{s.l.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Carousel */}
      {featured.length > 0 && (
        <section style={{ position: "relative", height: "400px", overflow: "hidden", background: "#1A1A1A" }}>
          {featured.map((l, i) => (
            <Link key={l.id} href={`/for-sale/${l.id}`} style={{ textDecoration: "none" }}>
              <div style={{ position: "absolute", inset: 0, opacity: i === carouselIdx ? 1 : 0, transition: "opacity 600ms ease", display: "flex" }}>
                {l.cover_photo ? (
                  <img src={l.cover_photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.6 }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: "#2A2A2A", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "96px" }}>🚗</span>
                  </div>
                )}
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "40px 48px", background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)" }}>
                  <p style={{ fontFamily: "Verdana, sans-serif", fontSize: "11px", color: colors.accent, letterSpacing: "3px", textTransform: "uppercase", marginBottom: "8px" }}>Featured</p>
                  <h2 style={{ fontFamily: "Georgia, serif", fontSize: "32px", color: "#fff", fontWeight: "bold", marginBottom: "8px" }}>{l.year && `${l.year} `}{l.make_name} {l.model}</h2>
                  <p style={{ fontFamily: "Georgia, serif", fontSize: "22px", color: colors.accent, marginBottom: "8px" }}>{fmtPrice(l.asking_price, l.currency)}</p>
                  {(l.location_city || l.location_country) && <p style={{ fontFamily: "Verdana, sans-serif", fontSize: "12px", color: "#9A9A9A" }}>{[l.location_city, l.location_country].filter(Boolean).join(", ")}</p>}
                </div>
              </div>
            </Link>
          ))}
          {featured.length > 1 && (
            <>
              <button onClick={e => { e.preventDefault(); setCarouselIdx(i => (i - 1 + featured.length) % featured.length); }} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.5)", border: "none", color: "#fff", fontSize: "20px", width: "44px", height: "44px", cursor: "pointer" }}>‹</button>
              <button onClick={e => { e.preventDefault(); setCarouselIdx(i => (i + 1) % featured.length); }} style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.5)", border: "none", color: "#fff", fontSize: "20px", width: "44px", height: "44px", cursor: "pointer" }}>›</button>
              <div style={{ position: "absolute", bottom: "16px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "8px" }}>
                {featured.map((_, i) => <button key={i} onClick={e => { e.preventDefault(); setCarouselIdx(i); }} style={{ width: "8px", height: "8px", borderRadius: "50%", background: i === carouselIdx ? colors.accent : "rgba(255,255,255,0.4)", border: "none", cursor: "pointer", padding: 0 }} />)}
              </div>
            </>
          )}
        </section>
      )}

      <div className="vv-page-container">
        {/* Filter bar */}
        <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, padding: "20px 24px", marginBottom: "32px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <select style={inputStyle} value={filterMake} onChange={e => setFilterMake(e.target.value)}>
            <option value="">All Makes</option>
            {makes.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <input style={{ ...inputStyle, width: "80px" }} type="number" placeholder="Year from" value={filterYearFrom} onChange={e => setFilterYearFrom(e.target.value)} />
          <input style={{ ...inputStyle, width: "80px" }} type="number" placeholder="Year to" value={filterYearTo} onChange={e => setFilterYearTo(e.target.value)} />
          <input style={{ ...inputStyle, width: "100px" }} type="number" placeholder="Price from" value={filterPriceFrom} onChange={e => setFilterPriceFrom(e.target.value)} />
          <input style={{ ...inputStyle, width: "100px" }} type="number" placeholder="Price to" value={filterPriceTo} onChange={e => setFilterPriceTo(e.target.value)} />
          <select style={inputStyle} value={filterCountry} onChange={e => setFilterCountry(e.target.value)}>
            <option value="">All Countries</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select style={inputStyle} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="price_asc">Price low–high</option>
            <option value="price_desc">Price high–low</option>
            <option value="ending_soon">Ending soon</option>
          </select>
        </div>

        {/* Active Listings */}
        {loading ? (
          <p style={{ fontFamily: "Georgia, serif", color: colors.textMuted, fontStyle: "italic", textAlign: "center", padding: "64px" }}>Loading listings…</p>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", border: `1px solid ${colors.border}` }}>
            <p style={{ fontFamily: "Georgia, serif", fontSize: "18px", color: colors.textMuted, fontStyle: "italic" }}>No listings match your filters.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "20px", marginBottom: "64px" }}>
            {filtered.map(l => {
              const days = daysLeft(l.expires_at);
              return (
                <Link key={l.id} href={`/for-sale/${l.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div style={{ background: "#FFFDF8", border: `1px solid ${colors.border}`, borderTop: `3px solid ${colors.accent}`, overflow: "hidden", transition: "box-shadow 150ms" }}>
                    <div style={{ aspectRatio: "4/3", background: colors.surfaceAlt, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {l.cover_photo ? <img src={l.cover_photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "48px" }}>🚗</span>}
                    </div>
                    <div style={{ padding: "16px" }}>
                      <p style={{ fontFamily: "Georgia, serif", fontSize: "16px", fontWeight: "bold", marginBottom: "4px" }}>{l.make_name} {l.model}</p>
                      {(l.year || l.color) && <p style={{ fontFamily: "Georgia, serif", fontSize: "12px", color: colors.textSecondary, marginBottom: "4px" }}>{[l.year, l.color].filter(Boolean).join(" · ")}</p>}
                      {l.mileage && <p style={{ fontFamily: "Verdana, sans-serif", fontSize: "11px", color: colors.textMuted, marginBottom: "8px" }}>{l.mileage.toLocaleString()} {l.mileage_unit}</p>}
                      <p style={{ fontFamily: "Georgia, serif", fontSize: "22px", fontWeight: "bold", color: colors.accent, marginBottom: "8px" }}>{fmtPrice(l.asking_price, l.currency)}</p>
                      {(l.location_city || l.location_country) && <p style={{ fontFamily: "Verdana, sans-serif", fontSize: "11px", color: colors.textMuted, marginBottom: "8px" }}>{[l.location_city, l.location_country].filter(Boolean).join(", ")}</p>}
                      {l.seller_username && <p style={{ fontFamily: "Verdana, sans-serif", fontSize: "11px", color: colors.textMuted, marginBottom: "12px" }}>@{l.seller_username}</p>}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontFamily: "Verdana, sans-serif", fontSize: "10px", color: "#1A3A5A", letterSpacing: "1px", textTransform: "uppercase" }}>View Listing →</span>
                        {days < 7 && <span style={{ background: "#FBF3E0", color: "#8A6A1A", fontSize: "9px", padding: "2px 8px", fontFamily: "Verdana, sans-serif", letterSpacing: "1px" }}>{days}d left</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Previously Sold */}
        {sold.length > 0 && (
          <div style={{ marginTop: "32px", paddingTop: "48px", borderTop: `1px solid ${colors.border}` }}>
            <p style={{ color: colors.textMuted, letterSpacing: "3px", fontSize: "11px", marginBottom: "8px", fontFamily: "Verdana, sans-serif", textTransform: "uppercase" }}>Recently Sold — for reference only</p>
            <p style={{ color: colors.textMuted, fontFamily: "Georgia, serif", fontSize: "14px", marginBottom: "28px", fontStyle: "italic" }}>These listings have been sold and are shown for historical reference.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "16px" }}>
              {sold.map(l => (
                <div key={l.id} style={{ background: colors.surfaceAlt, border: `1px solid ${colors.border}`, overflow: "hidden", opacity: 0.7 }}>
                  <div style={{ aspectRatio: "4/3", background: "#E8E2D8", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                    {l.cover_photo ? <img src={l.cover_photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(100%)" }} /> : <span style={{ fontSize: "40px" }}>🚗</span>}
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.3)" }}>
                      <span style={{ fontFamily: "Georgia, serif", fontSize: "20px", fontWeight: "bold", color: "#fff", letterSpacing: "3px" }}>SOLD</span>
                    </div>
                  </div>
                  <div style={{ padding: "12px" }}>
                    <p style={{ fontFamily: "Georgia, serif", fontSize: "14px", fontWeight: "bold", marginBottom: "4px", color: colors.textSecondary }}>{l.make_name} {l.model}</p>
                    {(l.year || l.color) && <p style={{ fontFamily: "Georgia, serif", fontSize: "12px", color: colors.textMuted, marginBottom: "4px" }}>{[l.year, l.color].filter(Boolean).join(" · ")}</p>}
                    {(l.location_city || l.location_country) && <p style={{ fontFamily: "Verdana, sans-serif", fontSize: "10px", color: colors.textMuted }}>{[l.location_city, l.location_country].filter(Boolean).join(", ")}</p>}
                    {l.sold_at && <p style={{ fontFamily: "Verdana, sans-serif", fontSize: "10px", color: colors.textMuted, marginTop: "4px" }}>Sold {new Date(l.sold_at).toLocaleDateString("en-GB")}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
