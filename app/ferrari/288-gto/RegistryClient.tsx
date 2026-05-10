"use client";
import Link from "next/link";
import { useState, useMemo, useEffect, useRef } from "react";
import { SkeletonRow } from "@/app/components/ui/Skeleton";
import { colors } from "@/app/components/ui/tokens";
import PullToRefresh from "@/app/components/PullToRefresh";

const TOTAL_PRODUCED = 272;

interface Submission {
  id: string;
  chassis_number: string;
  exterior_color: string;
  original_market: string;
  status: string;
  created_at: string;
  is_one_off?: boolean;
  is_prototype?: boolean;
  is_film_car?: boolean;
  is_music_video_car?: boolean;
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  approved: { bg: '#E8F4EC', color: colors.success },
  pending:  { bg: '#FBF3E0', color: '#8A6A1A' },
  rejected: { bg: '#F4E8E8', color: colors.error },
};

type FlagFilter = "all" | "one_off" | "prototype" | "film_car" | "music_video";

const inputStyle: React.CSSProperties = {
  background: colors.surface,
  border: `1px solid ${colors.border}`,
  color: colors.textPrimary,
  padding: "10px 16px",
  fontSize: "14px",
  fontFamily: "Georgia, serif",
  outline: "none",
  borderRadius: "2px",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  color: colors.textSecondary,
};

/* ── Per-row component so hooks can be called legally ── */
function RegistryRow({
  car, index, thumbnails, ownedChassis, onSave, saved,
}: {
  car: Submission;
  index: number;
  thumbnails: Record<string, string>;
  ownedChassis: Set<string>;
  onSave: (c: string) => void;
  saved: boolean;
}) {
  const [swipeOpen, setSwipeOpen] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const st = STATUS_STYLE[car.status] ?? STATUS_STYLE.pending;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    const dy = Math.abs(touchStartY.current - e.changedTouches[0].clientY);
    if (dx > 60 && dy < 40) setSwipeOpen(true);
    else if (dx < -20) setSwipeOpen(false);
  };

  return (
    <>
      <tr
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          borderBottom: swipeOpen ? 'none' : `1px solid ${colors.borderLight}`,
          borderLeft: swipeOpen ? `3px solid ${colors.accent}` : '3px solid transparent',
          transition: 'background 150ms ease, border-color 150ms ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = colors.surface)}
        onMouseLeave={e => (e.currentTarget.style.background = '')}
      >
        <td style={{ padding: '18px 12px', color: colors.textMuted, fontSize: '13px', fontFamily: 'Verdana, sans-serif' }}>{index + 1}</td>
        <td style={{ padding: '8px 8px', width: '44px' }}>
          {thumbnails[car.chassis_number] ? (
            <div style={{ width: '36px', height: '28px', overflow: 'hidden', background: colors.surfaceAlt, border: `1px solid ${colors.border}` }}>
              <img
                src={thumbnails[car.chassis_number]}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                loading="lazy"
              />
            </div>
          ) : (
            <div style={{ width: '36px', height: '28px', background: colors.surfaceAlt, border: `1px solid ${colors.border}` }} />
          )}
        </td>
        <td style={{ padding: '18px 12px', fontFamily: 'monospace', fontSize: '14px', letterSpacing: '1px', color: colors.textPrimary }}>
          {car.chassis_number}
          {ownedChassis.has(car.chassis_number) && (
            <span style={{ marginLeft: '8px', background: colors.surfaceAlt, color: colors.accentBlue, padding: '2px 8px', fontSize: '9px', letterSpacing: '1px', verticalAlign: 'middle', fontFamily: 'Verdana, sans-serif', border: `1px solid ${colors.border}` }}>
              OWNER
            </span>
          )}
          {car.is_one_off && (
            <span title="One-Off" style={{ marginLeft: '6px', background: '#F0E8FA', color: '#7A4AB8', padding: '2px 6px', fontSize: '9px', letterSpacing: '1px', verticalAlign: 'middle', border: '1px solid #C8A8E8', fontFamily: 'Verdana, sans-serif' }}>1-OFF</span>
          )}
          {car.is_prototype && (
            <span title="Prototype" style={{ marginLeft: '6px', background: '#FBF3E0', color: '#8A6A1A', padding: '2px 6px', fontSize: '9px', letterSpacing: '1px', verticalAlign: 'middle', border: '1px solid #E8C878', fontFamily: 'Verdana, sans-serif' }}>PROTO</span>
          )}
          {car.is_film_car && (
            <span title="Film Car" style={{ marginLeft: '6px', background: '#E8F0FA', color: '#1A5A8A', padding: '2px 6px', fontSize: '9px', letterSpacing: '1px', verticalAlign: 'middle', border: '1px solid #A8C8E8', fontFamily: 'Verdana, sans-serif' }}>FILM</span>
          )}
          {car.is_music_video_car && (
            <span title="Music Video Car" style={{ marginLeft: '6px', background: '#FAE8F0', color: '#8A1A5A', padding: '2px 6px', fontSize: '9px', letterSpacing: '1px', verticalAlign: 'middle', border: '1px solid #E8A8C8', fontFamily: 'Verdana, sans-serif' }}>MV</span>
          )}
        </td>
        <td style={{ padding: '18px 12px', color: colors.textSecondary, fontFamily: 'Georgia, serif' }}>{car.exterior_color || '—'}</td>
        <td style={{ padding: '18px 12px', color: colors.textSecondary, fontFamily: 'Georgia, serif' }}>{car.original_market || '—'}</td>
        <td style={{ padding: '18px 12px' }}>
          <span style={{ background: st.bg, color: st.color, padding: '4px 12px', fontSize: '10px', letterSpacing: '1px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>
            {car.status.toUpperCase()}
          </span>
        </td>
        <td style={{ padding: '18px 12px' }}>
          <Link href={`/ferrari/288-gto/${car.chassis_number}`} style={{ color: colors.accentBlue, fontSize: '12px', textDecoration: 'none', fontFamily: 'Verdana, sans-serif', letterSpacing: '0.5px' }}>
            View →
          </Link>
        </td>
      </tr>
      {swipeOpen && (
        <tr style={{ borderBottom: `1px solid ${colors.borderLight}`, borderLeft: `3px solid ${colors.accent}` }}>
          <td colSpan={7} style={{ padding: '0', background: colors.surface }}>
            <div className="vv-swipe-actions" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { onSave(car.chassis_number); setSwipeOpen(false); }}
                style={{
                  background: saved ? colors.accentDark : colors.accent,
                  color: colors.accentNavy,
                  padding: '14px 24px',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'Verdana, sans-serif',
                  fontSize: '11px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  fontWeight: 'bold',
                }}
              >
                {saved ? '✓ Saved' : '♥ Save'}
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://www.vinvault.net/ferrari/288-gto/${car.chassis_number}`).catch(() => {});
                  setSwipeOpen(false);
                }}
                style={{
                  background: '#2A2A2A',
                  color: '#FFFDF8',
                  padding: '14px 24px',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'Verdana, sans-serif',
                  fontSize: '11px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}
              >
                Share
              </button>
              <a
                href={`/spot?make=Ferrari&model=288GTO&chassis=${encodeURIComponent(car.chassis_number)}`}
                style={{
                  background: colors.accent,
                  color: colors.accentNavy,
                  padding: '14px 24px',
                  textDecoration: 'none',
                  fontFamily: 'Verdana, sans-serif',
                  fontSize: '11px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  fontWeight: 'bold',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                Spot
              </a>
              <button
                onClick={() => setSwipeOpen(false)}
                style={{
                  background: colors.surfaceAlt,
                  color: colors.textMuted,
                  padding: '14px 16px',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'Verdana, sans-serif',
                  fontSize: '13px',
                }}
              >
                ✕
              </button>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function RegistryClient({ cars, ownedChassis = new Set<string>() }: { cars: Submission[]; ownedChassis?: Set<string> }) {
  const [query, setQuery] = useState('');
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [market, setMarket] = useState('');
  const [status, setStatus] = useState('');
  const [flagFilter, setFlagFilter] = useState<FlagFilter>('all');
  const [savedCars, setSavedCars] = useState<Set<string>>(new Set());
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const handleSave = (chassis: string) => {
    setSavedCars(prev => {
      const next = new Set(prev);
      next.add(chassis);
      return next;
    });
    setSaveNotice(chassis);
    setTimeout(() => setSaveNotice(null), 2000);
  };

  useEffect(() => {
    fetch('/api/chassis-thumbnails')
      .then(r => r.ok ? r.json() : {})
      .then((data) => { setThumbnails(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const markets = useMemo(() => {
    const s = new Set(cars.map(c => c.original_market).filter(Boolean));
    return Array.from(s).sort();
  }, [cars]);

  const filtered = useMemo(() => {
    return cars.filter(c => {
      if (query && !c.chassis_number.toLowerCase().includes(query.toLowerCase())) return false;
      if (market && c.original_market !== market) return false;
      if (status && c.status !== status) return false;
      if (flagFilter === 'one_off' && !c.is_one_off) return false;
      if (flagFilter === 'prototype' && !c.is_prototype) return false;
      if (flagFilter === 'film_car' && !c.is_film_car) return false;
      if (flagFilter === 'music_video' && !c.is_music_video_car) return false;
      return true;
    });
  }, [cars, query, market, status, flagFilter]);

  const documented = cars.filter(c => c.status === 'approved').length;
  const pct = Math.round((documented / TOTAL_PRODUCED) * 1000) / 10;
  const pctBar = Math.min(100, (documented / TOTAL_PRODUCED) * 100);

  return (
    <main style={{ background: colors.bg, color: colors.textPrimary, fontFamily: 'Georgia, serif', minHeight: '100vh' }}>
      <PullToRefresh />
      {/* Save notice toast */}
      {saveNotice && (
        <div style={{
          position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
          background: colors.accentNavy, color: '#FFFDF8',
          padding: '12px 24px', fontSize: '12px', letterSpacing: '1px',
          fontFamily: 'Verdana, sans-serif', zIndex: 200,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}>
          ✓ {saveNotice} saved
        </div>
      )}

      {/* Registry header */}
      <section className="vv-registry-header" style={{ background: colors.surface }}>
        <p style={{ color: colors.accent, letterSpacing: '3px', fontSize: '11px', marginBottom: '16px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>
          World Registry
        </p>
        <h1 style={{ fontSize: '42px', fontWeight: 'bold', marginBottom: '16px', fontFamily: 'Georgia, serif', color: colors.textPrimary }}>
          Ferrari 288 GTO
        </h1>
        <p style={{ color: colors.textSecondary, fontSize: '16px', maxWidth: '600px', lineHeight: '1.7', fontFamily: 'Georgia, serif' }}>
          {TOTAL_PRODUCED} cars were produced between 1984 and 1985. This registry aims to document every single chassis — its history, ownership, and current status.{' '}
          <Link href="/ferrari/288-gto/info" style={{ color: colors.accentBlue, textDecoration: 'none' }}>Full specifications →</Link>
        </p>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '40px', marginTop: '36px', flexWrap: 'wrap' }}>
          {[
            { n: String(TOTAL_PRODUCED), l: 'Total Produced' },
            { n: String(documented), l: 'Documented' },
            { n: String(TOTAL_PRODUCED - documented), l: 'Undocumented' },
            { n: `${pct}%`, l: 'Complete' },
          ].map(s => (
            <div key={s.l}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: colors.accent, fontFamily: 'Georgia, serif' }}>{s.n}</div>
              <div style={{ color: colors.textMuted, fontSize: '11px', letterSpacing: '1px', marginTop: '4px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: '28px', maxWidth: '600px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: colors.textMuted, fontSize: '11px', letterSpacing: '1px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>Registry Completion</span>
            <span style={{ color: colors.accent, fontSize: '12px', fontWeight: 'bold', fontFamily: 'Verdana, sans-serif' }}>{documented} of {TOTAL_PRODUCED}</span>
          </div>
          <div style={{ background: colors.surfaceAlt, height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              background: `linear-gradient(90deg, ${colors.accentDark}, ${colors.accent})`,
              height: '6px',
              width: `${pctBar}%`,
              borderRadius: '3px',
              transition: 'width 0.5s ease',
              minWidth: pctBar > 0 ? '4px' : '0',
            }} />
          </div>
          <p style={{ color: colors.textMuted, fontSize: '11px', marginTop: '6px', fontFamily: 'Verdana, sans-serif' }}>
            {TOTAL_PRODUCED - documented} chassis still to be documented — <Link href="/submit" style={{ color: colors.accentBlue, textDecoration: 'none' }}>submit a car</Link> to help complete the record.
          </p>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
          <Link href="/submit" style={{
            background: colors.accentNavy,
            color: '#FFFDF8',
            padding: '10px 24px',
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
            padding: '10px 24px',
            textDecoration: 'none',
            fontSize: '11px',
            letterSpacing: '2px',
            fontFamily: 'Verdana, sans-serif',
            textTransform: 'uppercase',
          }}>
            Submit a Spotting
          </Link>
          <a href="https://forum.vinvault.net/c/ferrari-288-gto" target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: colors.textSecondary,
              textDecoration: 'none',
              fontSize: '11px',
              border: `1px solid ${colors.border}`,
              padding: '10px 16px',
              background: colors.surfaceAlt,
              fontFamily: 'Verdana, sans-serif',
              letterSpacing: '1px',
            }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke={colors.accent} strokeWidth="1.5"/>
              <path d="M4 5h6M4 7.5h4" stroke={colors.accent} strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            Forum →
          </a>
        </div>
      </section>

      {/* Filters */}
      <section className="vv-registry-filters" style={{ background: colors.bg }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search chassis number..."
          style={{ ...inputStyle, width: '240px', maxWidth: '100%' }}
        />
        <select value={market} onChange={e => setMarket(e.target.value)} style={{ ...selectStyle }}>
          <option value="">All Markets</option>
          {markets.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)} style={{ ...selectStyle }}>
          <option value="">All Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
        <Link href="/submit" style={{
          marginLeft: 'auto',
          background: colors.accent,
          color: colors.accentNavy,
          padding: '10px 24px',
          textDecoration: 'none',
          fontSize: '11px',
          whiteSpace: 'nowrap',
          fontFamily: 'Verdana, sans-serif',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          fontWeight: 'bold',
        }}>
          + Submit a Car
        </Link>
      </section>

      {/* Flag filters */}
      <section style={{ padding: '12px 40px', borderBottom: `1px solid ${colors.border}`, display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', background: colors.bg }}>
        <span style={{ color: colors.textMuted, fontSize: '11px', letterSpacing: '2px', marginRight: '4px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>Filter:</span>
        {([
          { key: 'all', label: 'All Cars' },
          { key: 'one_off', label: 'One-Off', color: '#7A4AB8' },
          { key: 'prototype', label: 'Prototypes', color: '#8A6A1A' },
          { key: 'film_car', label: 'Film Cars', color: '#1A5A8A' },
          { key: 'music_video', label: 'Music Video', color: '#8A1A5A' },
        ] as { key: FlagFilter; label: string; color?: string }[]).map(f => (
          <button
            key={f.key}
            onClick={() => setFlagFilter(f.key)}
            style={{
              background: flagFilter === f.key ? (f.color ? `${f.color}18` : colors.surfaceAlt) : 'none',
              border: `1px solid ${flagFilter === f.key ? (f.color || colors.accent) : colors.border}`,
              color: flagFilter === f.key ? (f.color || colors.accent) : colors.textMuted,
              padding: '5px 14px',
              fontSize: '11px',
              cursor: 'pointer',
              fontFamily: 'Verdana, sans-serif',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              borderRadius: '2px',
              transition: 'all 150ms ease',
            }}
          >
            {f.label}
          </button>
        ))}
      </section>

      {/* Registry table */}
      <section className="vv-registry-body" style={{ background: colors.bg }}>
        {/* Mobile swipe hint — only shown on touch devices */}
        <p style={{
          display: 'none',
          color: colors.textMuted,
          fontSize: '11px',
          letterSpacing: '1px',
          fontFamily: 'Verdana, sans-serif',
          marginTop: '16px',
          marginBottom: '4px',
          textAlign: 'right',
        }} className="vv-swipe-hint">
          ← swipe row for actions
        </p>
        <div className="vv-table-scroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '24px', minWidth: '560px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${colors.border}`, color: colors.textMuted, fontSize: '11px', letterSpacing: '2px', textAlign: 'left' }}>
                <th style={{ padding: '16px 12px', fontFamily: 'Verdana, sans-serif', fontWeight: 'normal', textTransform: 'uppercase' }}>#</th>
                <th style={{ padding: '16px 8px', width: '44px' }}></th>
                <th style={{ padding: '16px 12px', fontFamily: 'Verdana, sans-serif', fontWeight: 'normal', textTransform: 'uppercase' }}>Chassis Number</th>
                <th style={{ padding: '16px 12px', fontFamily: 'Verdana, sans-serif', fontWeight: 'normal', textTransform: 'uppercase' }}>Color</th>
                <th style={{ padding: '16px 12px', fontFamily: 'Verdana, sans-serif', fontWeight: 'normal', textTransform: 'uppercase' }}>Market</th>
                <th style={{ padding: '16px 12px', fontFamily: 'Verdana, sans-serif', fontWeight: 'normal', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '16px 12px' }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} style={{ padding: '0' }}>
                      <SkeletonRow />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: colors.textMuted, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                    No entries match your filters.
                  </td>
                </tr>
              ) : filtered.map((car, i) => (
                <RegistryRow
                  key={car.id}
                  car={car}
                  index={i}
                  thumbnails={thumbnails}
                  ownedChassis={ownedChassis}
                  onSave={handleSave}
                  saved={savedCars.has(car.chassis_number)}
                />
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ color: colors.textMuted, fontSize: '13px', marginTop: '32px', textAlign: 'center', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
          Showing {filtered.length} of {cars.length} submitted chassis.{' '}
          Help us complete the registry — <Link href="/submit" style={{ color: colors.accentBlue }}>submit a car</Link>.
        </p>
      </section>
    </main>
  );
}
