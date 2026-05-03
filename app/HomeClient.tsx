"use client";
import Link from "next/link";
import { useState, useMemo } from "react";

interface Registry {
  make: string;
  model: string;
  slug: string;
  documented: number;
  total: number;
  years: string;
  era: string;
}

const REGISTRIES: Registry[] = [
  {
    make: "Ferrari",
    model: "288 GTO",
    slug: "/ferrari/288-gto",
    documented: 1,
    total: 272,
    years: "1984–1985",
    era: "Supercar",
  },
];

function pct(doc: number, total: number) {
  return total > 0 ? Math.min(100, Math.round((doc / total) * 100)) : 0;
}

export default function HomeClient({
  recentCount,
  modelCount,
  verifiedCount,
  recent,
}: {
  recentCount: number;
  modelCount: number;
  verifiedCount: number;
  recent: { id: string; chassis_number: string; original_market: string; created_at: string }[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return REGISTRIES;
    return REGISTRIES.filter(
      (r) =>
        r.make.toLowerCase().includes(q) ||
        r.model.toLowerCase().includes(q) ||
        r.era.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <main style={{ background: "#080F1A", color: "#E2EEF7", fontFamily: "Georgia, serif", minHeight: "100vh" }}>

      {/* ── Header ── */}
      <header style={{ background: "#0A1828", borderBottom: "1px solid #1E3A5A", padding: "18px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "baseline", gap: "10px" }}>
          <span style={{ fontSize: "26px", fontWeight: "bold" }}>
            <span style={{ color: "#4A90B8" }}>Vin</span>
            <span style={{ color: "#E2EEF7" }}>Vault</span>
          </span>
          <span style={{ color: "#4A90B8", fontSize: "10px", letterSpacing: "4px" }}>REGISTRY</span>
        </Link>
        <nav style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Link href="/ferrari/288-gto" style={{ color: "#8BA5B8", textDecoration: "none", padding: "8px 16px", fontSize: "13px" }}>Registry</Link>
          <Link href="/submit" style={{ color: "#8BA5B8", textDecoration: "none", padding: "8px 16px", fontSize: "13px" }}>Submit</Link>
          <Link href="/login" style={{ color: "#4A90B8", textDecoration: "none", border: "1px solid #4A90B8", padding: "7px 18px", fontSize: "13px", marginLeft: "8px" }}>Sign In</Link>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section style={{ textAlign: "center", padding: "90px 40px 72px", borderBottom: "1px solid #1E3A5A" }}>
        <p style={{ color: "#4A90B8", letterSpacing: "4px", fontSize: "11px", marginBottom: "20px" }}>THE DEFINITIVE REGISTRY</p>
        <h1 style={{ fontSize: "52px", fontWeight: "bold", lineHeight: "1.1", marginBottom: "20px", maxWidth: "760px", margin: "0 auto 20px" }}>
          The World's Most Complete<br />
          <span style={{ color: "#4A90B8" }}>Classic Car Registry</span>
        </h1>
        <p style={{ color: "#8BA5B8", fontSize: "17px", maxWidth: "560px", margin: "0 auto 44px", lineHeight: "1.75" }}>
          Community-verified chassis records for the rarest cars ever built.
          Every VIN documented. Every history preserved.
        </p>

        {/* Search */}
        <div style={{ display: "flex", justifyContent: "center", gap: "0", maxWidth: "520px", margin: "0 auto" }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search by make or model — "Ferrari", "288 GTO", "Lamborghini"…'
            style={{
              flex: 1,
              background: "#0D1E36",
              border: "1px solid #1E3A5A",
              borderRight: "none",
              color: "#E2EEF7",
              padding: "13px 18px",
              fontSize: "14px",
              fontFamily: "Georgia, serif",
              outline: "none",
            }}
          />
          <div style={{ background: "#4A90B8", padding: "13px 20px", display: "flex", alignItems: "center" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="5" stroke="#fff" strokeWidth="1.5" />
              <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section style={{ background: "#0A1828", borderBottom: "1px solid #1E3A5A", padding: "28px 40px", display: "flex", justifyContent: "center", gap: "80px" }}>
        {[
          { n: String(recentCount), l: "Cars in Registry" },
          { n: String(modelCount), l: "Models Tracked" },
          { n: String(verifiedCount), l: "Verified Entries" },
        ].map((s) => (
          <div key={s.l} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: "#4A90B8" }}>{s.n}</div>
            <div style={{ color: "#8BA5B8", fontSize: "11px", letterSpacing: "2px", marginTop: "6px" }}>{s.l}</div>
          </div>
        ))}
      </section>

      {/* ── Registries grid ── */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "64px 40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "36px" }}>
          <div>
            <p style={{ color: "#4A90B8", letterSpacing: "3px", fontSize: "11px", marginBottom: "8px" }}>BROWSE</p>
            <h2 style={{ fontSize: "28px", fontWeight: "bold" }}>Registries</h2>
          </div>
          {query && (
            <span style={{ color: "#4A6A8A", fontSize: "13px" }}>
              {filtered.length === 0 ? "No results" : `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`} for "{query}"
            </span>
          )}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#4A6A8A", border: "1px solid #1E3A5A" }}>
            <p style={{ fontSize: "15px" }}>No registries match "{query}"</p>
            <button onClick={() => setQuery("")} style={{ marginTop: "16px", background: "none", border: "1px solid #1E3A5A", color: "#4A90B8", padding: "8px 20px", cursor: "pointer", fontFamily: "Georgia, serif", fontSize: "13px" }}>
              Clear search
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
            {filtered.map((r) => {
              const p = pct(r.documented, r.total);
              return (
                <Link key={r.slug} href={r.slug} style={{ textDecoration: "none", color: "inherit" }}>
                  <div style={{ background: "#0A1828", border: "1px solid #1E3A5A", padding: "28px", transition: "border-color 0.2s", cursor: "pointer" }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#4A90B8")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1E3A5A")}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                      <div>
                        <p style={{ color: "#4A90B8", fontSize: "10px", letterSpacing: "3px", marginBottom: "6px" }}>{r.make.toUpperCase()}</p>
                        <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "4px" }}>{r.model}</h3>
                        <p style={{ color: "#4A6A8A", fontSize: "12px" }}>{r.years} · {r.era}</p>
                      </div>
                      <span style={{ background: "#0D1E36", border: "1px solid #1E3A5A", color: "#4A90B8", padding: "4px 10px", fontSize: "11px", letterSpacing: "1px", whiteSpace: "nowrap" }}>
                        {p}% COMPLETE
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div style={{ background: "#0D1E36", height: "3px", borderRadius: "2px", marginBottom: "16px" }}>
                      <div style={{ background: "#4A90B8", height: "3px", width: `${p}%`, borderRadius: "2px" }} />
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span style={{ color: "#8BA5B8" }}>
                        <span style={{ color: "#E2EEF7", fontWeight: "bold" }}>{r.documented.toLocaleString()}</span> documented
                      </span>
                      <span style={{ color: "#4A6A8A" }}>{r.total.toLocaleString()} produced</span>
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* "Coming soon" placeholder when only one registry exists */}
            {filtered.length === REGISTRIES.length && (
              <div style={{ background: "#080F1A", border: "1px dashed #1E3A5A", padding: "28px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "160px" }}>
                <div style={{ textAlign: "center" }}>
                  <p style={{ color: "#1E3A5A", fontSize: "28px", marginBottom: "8px" }}>+</p>
                  <p style={{ color: "#4A6A8A", fontSize: "13px", letterSpacing: "1px" }}>More registries coming</p>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── Recently Added ── */}
      {recent.length > 0 && (
        <section style={{ borderTop: "1px solid #1E3A5A", padding: "64px 40px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <p style={{ color: "#4A90B8", letterSpacing: "3px", fontSize: "11px", marginBottom: "8px" }}>LATEST</p>
            <h2 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "36px" }}>Recently Added</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
              {recent.map((s) => (
                <Link key={s.id} href={`/ferrari/288-gto/${s.chassis_number}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div style={{ background: "#0A1828", border: "1px solid #1E3A5A", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#4A90B8")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1E3A5A")}>
                    <div>
                      <p style={{ fontFamily: "monospace", fontSize: "14px", letterSpacing: "1px", marginBottom: "4px" }}>{s.chassis_number}</p>
                      <p style={{ color: "#4A6A8A", fontSize: "12px" }}>Ferrari 288 GTO{s.original_market ? ` · ${s.original_market}` : ""}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ color: "#4A90B8", fontSize: "11px" }}>
                        {new Date(s.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Why VinVault ── */}
      <section style={{ borderTop: "1px solid #1E3A5A", padding: "64px 40px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "40px" }}>
          {[
            { title: "Community Verified", desc: "Every entry validated by trusted contributors with deep expertise in each model." },
            { title: "Complete History", desc: "Chassis numbers, production dates, provenance, ownership history, and auction records." },
            { title: "Global Registry", desc: "Cars tracked across dozens of countries. Submit a car to help complete the record." },
          ].map((item) => (
            <div key={item.title} style={{ borderTop: "2px solid #4A90B8", paddingTop: "20px" }}>
              <h3 style={{ fontSize: "16px", marginBottom: "12px" }}>{item.title}</h3>
              <p style={{ color: "#8BA5B8", fontSize: "14px", lineHeight: "1.7" }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ borderTop: "1px solid #1E3A5A", padding: "72px 40px", textAlign: "center" }}>
        <h2 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "16px" }}>Know a car that's not listed?</h2>
        <p style={{ color: "#8BA5B8", fontSize: "16px", marginBottom: "36px", maxWidth: "480px", margin: "0 auto 36px" }}>
          Help make the registry more complete. Submit chassis details and we'll verify and publish the record.
        </p>
        <Link href="/submit" style={{ background: "#4A90B8", color: "#fff", padding: "14px 36px", textDecoration: "none", fontSize: "14px", letterSpacing: "2px" }}>
          SUBMIT A CAR
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: "1px solid #1E3A5A", padding: "28px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#4A6A8A", fontSize: "13px" }}>
        <span><span style={{ color: "#4A90B8" }}>Vin</span>Vault Registry © 2026</span>
        <div style={{ display: "flex", gap: "24px" }}>
          <Link href="/ferrari/288-gto" style={{ color: "#4A6A8A", textDecoration: "none" }}>Registry</Link>
          <Link href="/submit" style={{ color: "#4A6A8A", textDecoration: "none" }}>Submit</Link>
          <Link href="/login" style={{ color: "#4A6A8A", textDecoration: "none" }}>Sign In</Link>
        </div>
      </footer>
    </main>
  );
}
