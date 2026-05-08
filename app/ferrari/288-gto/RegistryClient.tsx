"use client";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
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
  approved:  { bg: '#0D2A1A', color: '#4AB87A' },
  pending:   { bg: '#2A1A0D', color: '#B8944A' },
  rejected:  { bg: '#2A0D0D', color: '#E07070' },
};

type FlagFilter = "all" | "one_off" | "prototype" | "film_car" | "music_video";

export default function RegistryClient({ cars, ownedChassis = new Set<string>() }: { cars: Submission[]; ownedChassis?: Set<string> }) {
  const [query, setQuery] = useState('');
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/chassis-thumbnails')
      .then(r => r.ok ? r.json() : {})
      .then(setThumbnails)
      .catch(() => {});
  }, []);
  const [market, setMarket] = useState('');
  const [status, setStatus] = useState('');
  const [flagFilter, setFlagFilter] = useState<FlagFilter>('all');

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
    <main style={{ background: '#080F1A', color: '#E2EEF7', fontFamily: 'Verdana, sans-serif', minHeight: '100vh' }}>
      <section className="vv-registry-header">
        <p style={{ color: '#4A90B8', letterSpacing: '3px', fontSize: '11px', marginBottom: '16px' }}>WORLD REGISTRY</p>
        <h1 style={{ fontSize: '42px', fontWeight: 'bold', marginBottom: '16px' }}>Ferrari 288 GTO</h1>
        <p style={{ color: '#8BA5B8', fontSize: '16px', maxWidth: '600px', lineHeight: '1.7' }}>
          {TOTAL_PRODUCED} cars were produced between 1984 and 1985. This registry aims to document every single chassis — its history, ownership, and current status.{' '}
          <Link href="/ferrari/288-gto/info" style={{ color: '#4A90B8', textDecoration: 'none' }}>Full specifications →</Link>
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
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#4A90B8' }}>{s.n}</div>
              <div style={{ color: '#8BA5B8', fontSize: '12px', letterSpacing: '1px', marginTop: '4px' }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: '28px', maxWidth: '600px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: '#8BA5B8', fontSize: '12px', letterSpacing: '1px' }}>REGISTRY COMPLETION</span>
            <span style={{ color: '#4A90B8', fontSize: '12px', fontWeight: 'bold' }}>{documented} of {TOTAL_PRODUCED} documented</span>
          </div>
          <div style={{ background: '#0D1E36', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              background: 'linear-gradient(90deg, #2A6A9A, #4A90B8)',
              height: '8px',
              width: `${pctBar}%`,
              borderRadius: '4px',
              transition: 'width 0.5s ease',
              minWidth: pctBar > 0 ? '4px' : '0',
            }} />
          </div>
          <p style={{ color: '#4A6A8A', fontSize: '11px', marginTop: '6px' }}>
            {TOTAL_PRODUCED - documented} chassis still to be documented — <Link href="/submit" style={{ color: '#4A90B8', textDecoration: 'none' }}>submit a car</Link> to help complete the record.
          </p>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
          <Link href="/submit"
            style={{ background: '#4A90B8', color: '#fff', padding: '10px 24px', textDecoration: 'none', fontSize: '13px', letterSpacing: '2px' }}>
            SUBMIT TO REGISTRY
          </Link>
          <Link href="/spot"
            style={{ border: '1px solid #4A90B8', color: '#4A90B8', padding: '10px 24px', textDecoration: 'none', fontSize: '13px', letterSpacing: '2px' }}>
            SUBMIT A SPOTTING
          </Link>
          <a href="https://forum.vinvault.net/c/ferrari-288-gto" target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#8BA5B8', textDecoration: 'none', fontSize: '13px', border: '1px solid #1E3A5A', padding: '10px 16px', background: '#0A1828' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#4A90B8" strokeWidth="1.5"/><path d="M4 5h6M4 7.5h4" stroke="#4A90B8" strokeWidth="1.2" strokeLinecap="round"/></svg>
            Forum →
          </a>
        </div>
      </section>

      <section className="vv-registry-filters">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search chassis number..."
          style={{ background: '#0D1E36', border: '1px solid #1E3A5A', color: '#E2EEF7', padding: '10px 16px', fontSize: '14px', width: '240px', maxWidth: '100%', fontFamily: 'Verdana, sans-serif', outline: 'none' }}
        />
        <select
          value={market}
          onChange={e => setMarket(e.target.value)}
          style={{ background: '#0D1E36', border: '1px solid #1E3A5A', color: '#8BA5B8', padding: '10px 16px', fontSize: '14px', fontFamily: 'Verdana, sans-serif' }}
        >
          <option value="">All Markets</option>
          {markets.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          style={{ background: '#0D1E36', border: '1px solid #1E3A5A', color: '#8BA5B8', padding: '10px 16px', fontSize: '14px', fontFamily: 'Verdana, sans-serif' }}
        >
          <option value="">All Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
        <Link href="/submit" style={{ marginLeft: 'auto', background: '#4A90B8', color: '#fff', padding: '10px 24px', textDecoration: 'none', fontSize: '14px', whiteSpace: 'nowrap' }}>
          + Submit a Car
        </Link>
      </section>

      {/* Flag filters */}
      <section style={{ padding: '12px 40px', borderBottom: '1px solid #0D1E36', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ color: '#4A6A8A', fontSize: '11px', letterSpacing: '2px', marginRight: '4px' }}>FILTER:</span>
        {([
          { key: 'all', label: 'All Cars' },
          { key: 'one_off', label: 'One-Off', color: '#B87AE0' },
          { key: 'prototype', label: 'Prototypes', color: '#E0B87A' },
          { key: 'film_car', label: 'Film Cars', color: '#7AB8E0' },
          { key: 'music_video', label: 'Music Video', color: '#E07AB8' },
        ] as { key: FlagFilter; label: string; color?: string }[]).map(f => (
          <button
            key={f.key}
            onClick={() => setFlagFilter(f.key)}
            style={{
              background: flagFilter === f.key ? (f.color ? `${f.color}22` : '#1E3A5A') : 'none',
              border: `1px solid ${flagFilter === f.key ? (f.color || '#4A90B8') : '#1E3A5A'}`,
              color: flagFilter === f.key ? (f.color || '#4A90B8') : '#4A6A8A',
              padding: '5px 14px',
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: 'Verdana, sans-serif',
              letterSpacing: '1px',
            }}
          >
            {f.label}
          </button>
        ))}
      </section>

      <section className="vv-registry-body">
        <div className="vv-table-scroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '24px', minWidth: '560px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1E3A5A', color: '#4A90B8', fontSize: '11px', letterSpacing: '2px', textAlign: 'left' }}>
                <th style={{ padding: '16px 12px' }}>#</th>
                <th style={{ padding: '16px 8px', width: '44px' }}></th>
                <th style={{ padding: '16px 12px' }}>CHASSIS NUMBER</th>
                <th style={{ padding: '16px 12px' }}>COLOR</th>
                <th style={{ padding: '16px 12px' }}>MARKET</th>
                <th style={{ padding: '16px 12px' }}>STATUS</th>
                <th style={{ padding: '16px 12px' }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#4A6A8A' }}>No entries match your filters.</td></tr>
              ) : filtered.map((car, i) => {
                const st = STATUS_STYLE[car.status] ?? STATUS_STYLE.pending;
                return (
                  <tr key={car.id} style={{ borderBottom: '1px solid #0D1E36' }}>
                    <td style={{ padding: '18px 12px', color: '#4A6A8A', fontSize: '13px' }}>{i + 1}</td>
                    <td style={{ padding: '8px 8px', width: '44px' }}>
                      {thumbnails[car.chassis_number] ? (
                        <div style={{ width: '36px', height: '28px', overflow: 'hidden', background: '#0A1828', border: '1px solid #1E3A5A' }}>
                          <img
                            src={thumbnails[car.chassis_number]}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div style={{ width: '36px', height: '28px', background: '#0A1828', border: '1px solid #0D1E36' }} />
                      )}
                    </td>
                    <td style={{ padding: '18px 12px', fontFamily: 'monospace', fontSize: '14px', letterSpacing: '1px' }}>
                      {car.chassis_number}
                      {ownedChassis.has(car.chassis_number) && (
                        <span style={{ marginLeft: '8px', background: '#0D1E36', color: '#4A90B8', padding: '2px 8px', fontSize: '10px', letterSpacing: '1px', verticalAlign: 'middle' }}>
                          OWNER
                        </span>
                      )}
                      {car.is_one_off && (
                        <span title="One-Off" style={{ marginLeft: '6px', background: '#1A0D2A', color: '#B87AE0', padding: '2px 6px', fontSize: '9px', letterSpacing: '1px', verticalAlign: 'middle', border: '1px solid #5A2A8A' }}>1-OFF</span>
                      )}
                      {car.is_prototype && (
                        <span title="Prototype" style={{ marginLeft: '6px', background: '#2A1A0D', color: '#E0B87A', padding: '2px 6px', fontSize: '9px', letterSpacing: '1px', verticalAlign: 'middle', border: '1px solid #8A5A2A' }}>PROTO</span>
                      )}
                      {car.is_film_car && (
                        <span title="Film Car" style={{ marginLeft: '6px', background: '#0D1A2A', color: '#7AB8E0', padding: '2px 6px', fontSize: '9px', letterSpacing: '1px', verticalAlign: 'middle', border: '1px solid #2A5A8A' }}>FILM</span>
                      )}
                      {car.is_music_video_car && (
                        <span title="Music Video Car" style={{ marginLeft: '6px', background: '#1A0D1A', color: '#E07AB8', padding: '2px 6px', fontSize: '9px', letterSpacing: '1px', verticalAlign: 'middle', border: '1px solid #8A2A5A' }}>MV</span>
                      )}
                    </td>
                    <td style={{ padding: '18px 12px', color: '#8BA5B8' }}>{car.exterior_color || '—'}</td>
                    <td style={{ padding: '18px 12px', color: '#8BA5B8' }}>{car.original_market || '—'}</td>
                    <td style={{ padding: '18px 12px' }}>
                      <span style={{ background: st.bg, color: st.color, padding: '4px 12px', fontSize: '11px', letterSpacing: '1px' }}>
                        {car.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '18px 12px' }}>
                      <Link href={`/ferrari/288-gto/${car.chassis_number}`} style={{ color: '#4A90B8', fontSize: '13px', textDecoration: 'none' }}>
                        View →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p style={{ color: '#4A6A8A', fontSize: '13px', marginTop: '32px', textAlign: 'center' }}>
          Showing {filtered.length} of {cars.length} submitted chassis.{' '}
          Help us complete the registry — <Link href="/submit" style={{ color: '#4A90B8' }}>submit a car</Link>.
        </p>
      </section>

    </main>
  );
}
