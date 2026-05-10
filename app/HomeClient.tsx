"use client";
import Link from "next/link";
import { useState, useMemo } from "react";
import CountUp from "./components/CountUp";
import NewsletterForm from "./components/NewsletterForm";
import { colors } from "./components/ui/tokens";

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
    <main style={{ background: colors.bg, color: colors.textPrimary, fontFamily: 'Georgia, serif', minHeight: '100vh' }}>

      {/* Hero */}
      <section className="vv-hero" style={{ background: colors.surface }}>
        <p style={{ color: colors.accent, letterSpacing: '4px', fontSize: '11px', marginBottom: '20px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>
          The Definitive Registry
        </p>
        <h1 className="vv-h1-hero" style={{ color: colors.textPrimary }}>
          Curated Automotive Registry
        </h1>
        <p style={{ color: colors.textSecondary, fontSize: '17px', maxWidth: '560px', margin: '0 auto 44px', lineHeight: '1.75', fontFamily: 'Georgia, serif' }}>
          The definitive record of the world's most special, limited, and collectible automobiles.
          Every chassis documented. Every history preserved.
        </p>

        {/* Search */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0', maxWidth: '520px', margin: '0 auto', width: '100%' }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search registries…"
            style={{
              flex: 1,
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRight: 'none',
              color: colors.textPrimary,
              padding: '13px 18px',
              fontSize: '14px',
              fontFamily: 'Georgia, serif',
              outline: 'none',
              minWidth: 0,
              borderRadius: '2px 0 0 2px',
            }}
          />
          <div style={{ background: colors.accentNavy, padding: '13px 20px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="5" stroke="#FFFDF8" strokeWidth="1.5" />
              <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="#FFFDF8" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Hero CTAs */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '32px' }}>
          <Link href="/submit" style={{
            background: colors.accentNavy,
            color: '#FFFDF8',
            padding: '12px 28px',
            textDecoration: 'none',
            fontSize: '11px',
            letterSpacing: '2px',
            fontFamily: 'Verdana, sans-serif',
            textTransform: 'uppercase',
          }}>
            Submit to Registry
          </Link>
          <Link href="/spot" style={{
            border: `1px solid ${colors.accentNavy}`,
            color: colors.textPrimary,
            padding: '12px 28px',
            textDecoration: 'none',
            fontSize: '11px',
            letterSpacing: '2px',
            fontFamily: 'Verdana, sans-serif',
            textTransform: 'uppercase',
          }}>
            Submit a Spotting
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <section className="vv-stats-bar">
        {[
          { n: recentCount, l: 'Cars in Registry' },
          { n: modelCount, l: 'Models Tracked' },
          { n: verifiedCount, l: 'Verified Entries' },
        ].map((s) => (
          <div key={s.l} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: colors.accent, fontFamily: 'Georgia, serif' }}>
              <CountUp target={s.n} />
            </div>
            <div style={{ color: colors.textMuted, fontSize: '11px', letterSpacing: '2px', marginTop: '6px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>{s.l}</div>
          </div>
        ))}
      </section>

      {/* Registries grid */}
      <section className="vv-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '36px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <p style={{ color: colors.accent, letterSpacing: '3px', fontSize: '11px', marginBottom: '8px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>Browse</p>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', fontFamily: 'Georgia, serif', color: colors.textPrimary }}>Registries</h2>
          </div>
          {query && (
            <span style={{ color: colors.textMuted, fontSize: '13px', fontFamily: 'Georgia, serif' }}>
              {filtered.length === 0 ? 'No results' : `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`} for "{query}"
            </span>
          )}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: colors.textMuted, border: `1px solid ${colors.border}` }}>
            <p style={{ fontSize: '15px', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>No registries match "{query}"</p>
            <button onClick={() => setQuery('')} style={{ marginTop: '16px', background: 'none', border: `1px solid ${colors.border}`, color: colors.accentBlue, padding: '8px 20px', cursor: 'pointer', fontFamily: 'Verdana, sans-serif', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Clear Search
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {filtered.map((r) => {
              const p = pct(r.documented, r.total);
              return (
                <Link key={r.slug} href={r.slug} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div
                    className="vv-card"
                    style={{ background: colors.surface, border: `1px solid ${colors.border}`, padding: '28px', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                      <div>
                        <p style={{ color: colors.accent, fontSize: '10px', letterSpacing: '3px', marginBottom: '6px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>{r.make}</p>
                        <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px', fontFamily: 'Georgia, serif', color: colors.textPrimary }}>{r.model}</h3>
                        <p style={{ color: colors.textMuted, fontSize: '12px', fontFamily: 'Verdana, sans-serif' }}>{r.years} · {r.era}</p>
                      </div>
                      <span style={{ background: colors.surfaceAlt, border: `1px solid ${colors.border}`, color: colors.accent, padding: '4px 10px', fontSize: '10px', letterSpacing: '1px', whiteSpace: 'nowrap', fontFamily: 'Verdana, sans-serif' }}>
                        {p}% DONE
                      </span>
                    </div>

                    <div style={{ background: colors.surfaceAlt, height: '3px', borderRadius: '2px', marginBottom: '16px' }}>
                      <div style={{ background: `linear-gradient(90deg, ${colors.accentDark}, ${colors.accent})`, height: '3px', width: `${p}%`, borderRadius: '2px' }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: colors.textSecondary, fontFamily: 'Georgia, serif' }}>
                        <span style={{ color: colors.textPrimary, fontWeight: 'bold' }}>{r.documented.toLocaleString()}</span> documented
                      </span>
                      <span style={{ color: colors.textMuted, fontFamily: 'Verdana, sans-serif', fontSize: '12px' }}>{r.total.toLocaleString()} produced</span>
                    </div>
                  </div>
                </Link>
              );
            })}

            {filtered.length === REGISTRIES.length && (
              <div style={{ background: colors.surface, border: `1px dashed ${colors.border}`, padding: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '160px' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: colors.border, fontSize: '28px', marginBottom: '8px' }}>+</p>
                  <p style={{ color: colors.textMuted, fontSize: '13px', letterSpacing: '1px', fontFamily: 'Verdana, sans-serif' }}>More registries coming</p>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Recently Added */}
      {recent.length > 0 && (
        <section className="vv-section-full" style={{ background: colors.surface }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <p style={{ color: colors.accent, letterSpacing: '3px', fontSize: '11px', marginBottom: '8px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>Latest</p>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '36px', fontFamily: 'Georgia, serif', color: colors.textPrimary }}>Recently Added</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
              {recent.map((s) => (
                <Link key={s.id} href={`/ferrari/288-gto/${s.chassis_number}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div
                    className="vv-card"
                    style={{ background: colors.bg, border: `1px solid ${colors.border}`, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div>
                      <p style={{ fontFamily: 'monospace', fontSize: '14px', letterSpacing: '1px', marginBottom: '4px', color: colors.textPrimary }}>{s.chassis_number}</p>
                      <p style={{ color: colors.textMuted, fontSize: '12px', fontFamily: 'Verdana, sans-serif' }}>{s.original_market || 'Registry Entry'}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ color: colors.accent, fontSize: '11px', fontFamily: 'Verdana, sans-serif' }}>
                        {new Date(s.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why VinVault */}
      <section className="vv-section-full" style={{ background: colors.bg }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="vv-features-grid">
            {[
              { title: 'Community Verified', desc: 'Every entry validated by trusted contributors with deep expertise in each model.' },
              { title: 'Complete History', desc: 'Chassis numbers, production dates, provenance, ownership history, and auction records.' },
              { title: 'Global Registry', desc: 'Cars tracked across dozens of countries. Submit a car to help complete the record.' },
            ].map((item) => (
              <div key={item.title} style={{ borderTop: `2px solid ${colors.accent}`, paddingTop: '20px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '12px', fontFamily: 'Georgia, serif', fontWeight: 'bold', color: colors.textPrimary }}>{item.title}</h3>
                <p style={{ color: colors.textSecondary, fontSize: '14px', lineHeight: '1.7', fontFamily: 'Georgia, serif' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="vv-section-full" style={{ background: colors.surface }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ color: colors.accent, letterSpacing: '3px', fontSize: '11px', marginBottom: '8px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>Process</p>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '40px', fontFamily: 'Georgia, serif', color: colors.textPrimary }}>How It Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0', position: 'relative' }}>
            {[
              { step: '01', title: 'Submit', desc: 'Fill in the chassis details you know — number, color, market, history. Partial info is welcome.' },
              { step: '02', title: 'Review', desc: 'Our validators cross-reference your submission against factory records, auction catalogs, and known documentation.' },
              { step: '03', title: 'Verify', desc: 'If the information checks out, the record is approved and added to the permanent registry.' },
              { step: '04', title: 'Publish', desc: 'The chassis gets its own permanent page, publicly accessible and searchable forever.' },
            ].map((item, i) => (
              <div key={item.step} style={{ padding: '24px 28px', borderLeft: i > 0 ? `1px solid ${colors.border}` : 'none', borderTop: `3px solid ${colors.accent}` }}>
                <p style={{ color: colors.accent, fontSize: '28px', fontWeight: 'bold', marginBottom: '12px', lineHeight: 1, fontFamily: 'Georgia, serif' }}>{item.step}</p>
                <h3 style={{ fontSize: '17px', fontWeight: 'bold', marginBottom: '10px', fontFamily: 'Georgia, serif', color: colors.textPrimary }}>{item.title}</h3>
                <p style={{ color: colors.textSecondary, fontSize: '14px', lineHeight: '1.7', fontFamily: 'Georgia, serif' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ borderTop: `1px solid ${colors.border}`, padding: '72px 40px', textAlign: 'center', background: colors.bg }}>
        <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px', fontFamily: 'Georgia, serif', color: colors.textPrimary }}>Know a car that's not listed?</h2>
        <p style={{ color: colors.textSecondary, fontSize: '16px', marginBottom: '36px', maxWidth: '480px', margin: '0 auto 36px', lineHeight: '1.7', fontFamily: 'Georgia, serif' }}>
          Help make the registry more complete. Submit chassis details and we'll verify and publish the record.
        </p>
        <Link href="/submit" style={{
          background: colors.accentNavy,
          color: '#FFFDF8',
          padding: '14px 36px',
          textDecoration: 'none',
          fontSize: '11px',
          letterSpacing: '2px',
          fontFamily: 'Verdana, sans-serif',
          textTransform: 'uppercase',
        }}>
          Submit a Car
        </Link>
      </section>

      {/* Newsletter */}
      <section style={{ borderTop: `1px solid ${colors.border}`, padding: '64px 40px', background: colors.surfaceAlt }}>
        <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: colors.accent, letterSpacing: '3px', fontSize: '11px', marginBottom: '12px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>Stay Updated</p>
          <h2 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '12px', fontFamily: 'Georgia, serif', color: colors.textPrimary }}>Registry Updates</h2>
          <p style={{ color: colors.textSecondary, fontSize: '15px', lineHeight: '1.7', marginBottom: '28px', fontFamily: 'Georgia, serif' }}>
            Get notified when new chassis records are added and when new registries launch.
          </p>
          <NewsletterForm />
        </div>
      </section>

    </main>
  );
}
