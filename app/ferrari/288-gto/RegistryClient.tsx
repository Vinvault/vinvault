"use client";
import Link from "next/link";
import { useState, useMemo } from "react";

const TOTAL_PRODUCED = 272;

interface Submission {
  id: string;
  chassis_number: string;
  exterior_color: string;
  original_market: string;
  status: string;
  created_at: string;
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  approved:  { bg: '#0D2A1A', color: '#4AB87A' },
  pending:   { bg: '#2A1A0D', color: '#B8944A' },
  rejected:  { bg: '#2A0D0D', color: '#E07070' },
};

export default function RegistryClient({ cars }: { cars: Submission[] }) {
  const [query, setQuery] = useState('');
  const [market, setMarket] = useState('');
  const [status, setStatus] = useState('');

  const markets = useMemo(() => {
    const s = new Set(cars.map(c => c.original_market).filter(Boolean));
    return Array.from(s).sort();
  }, [cars]);

  const filtered = useMemo(() => {
    return cars.filter(c => {
      if (query && !c.chassis_number.toLowerCase().includes(query.toLowerCase())) return false;
      if (market && c.original_market !== market) return false;
      if (status && c.status !== status) return false;
      return true;
    });
  }, [cars, query, market, status]);

  const documented = cars.filter(c => c.status === 'approved').length;
  const pct = Math.round((documented / TOTAL_PRODUCED) * 1000) / 10;
  const pctBar = Math.min(100, (documented / TOTAL_PRODUCED) * 100);

  return (
    <main style={{ background: '#080F1A', color: '#E2EEF7', fontFamily: 'Georgia, serif', minHeight: '100vh' }}>
      <header className="vv-header">
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '24px', fontWeight: 'bold' }}>
            <span style={{ color: '#4A90B8' }}>Vin</span><span style={{ color: '#E2EEF7' }}>Vault</span>
          </span>
          <span style={{ color: '#4A90B8', fontSize: '10px', letterSpacing: '4px', marginLeft: '10px' }}>REGISTRY</span>
        </Link>
        <nav className="vv-nav" style={{ fontSize: '13px' }}>
          <Link href="/" style={{ color: '#8BA5B8', textDecoration: 'none', padding: '6px 12px' }}>Home</Link>
          <Link href="/about" style={{ color: '#8BA5B8', textDecoration: 'none', padding: '6px 12px' }}>About</Link>
          <Link href="/submit" style={{ color: '#4A90B8', textDecoration: 'none', border: '1px solid #4A90B8', padding: '6px 16px' }}>Submit</Link>
          <Link href="/login" style={{ color: '#8BA5B8', textDecoration: 'none', padding: '6px 12px' }}>Sign In</Link>
        </nav>
      </header>

      <section className="vv-registry-header">
        <p style={{ color: '#4A90B8', letterSpacing: '3px', fontSize: '11px', marginBottom: '16px' }}>WORLD REGISTRY</p>
        <h1 style={{ fontSize: '42px', fontWeight: 'bold', marginBottom: '16px' }}>Ferrari 288 GTO</h1>
        <p style={{ color: '#8BA5B8', fontSize: '16px', maxWidth: '600px', lineHeight: '1.7' }}>
          {TOTAL_PRODUCED} cars were produced between 1984 and 1985. This registry aims to document every single chassis — its history, ownership, and current status.
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
      </section>

      <section className="vv-registry-filters">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search chassis number..."
          style={{ background: '#0D1E36', border: '1px solid #1E3A5A', color: '#E2EEF7', padding: '10px 16px', fontSize: '14px', width: '240px', maxWidth: '100%', fontFamily: 'Georgia, serif', outline: 'none' }}
        />
        <select
          value={market}
          onChange={e => setMarket(e.target.value)}
          style={{ background: '#0D1E36', border: '1px solid #1E3A5A', color: '#8BA5B8', padding: '10px 16px', fontSize: '14px', fontFamily: 'Georgia, serif' }}
        >
          <option value="">All Markets</option>
          {markets.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          style={{ background: '#0D1E36', border: '1px solid #1E3A5A', color: '#8BA5B8', padding: '10px 16px', fontSize: '14px', fontFamily: 'Georgia, serif' }}
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

      <section className="vv-registry-body">
        <div className="vv-table-scroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '24px', minWidth: '560px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1E3A5A', color: '#4A90B8', fontSize: '11px', letterSpacing: '2px', textAlign: 'left' }}>
                <th style={{ padding: '16px 12px' }}>#</th>
                <th style={{ padding: '16px 12px' }}>CHASSIS NUMBER</th>
                <th style={{ padding: '16px 12px' }}>COLOR</th>
                <th style={{ padding: '16px 12px' }}>MARKET</th>
                <th style={{ padding: '16px 12px' }}>STATUS</th>
                <th style={{ padding: '16px 12px' }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#4A6A8A' }}>No entries match your filters.</td></tr>
              ) : filtered.map((car, i) => {
                const st = STATUS_STYLE[car.status] ?? STATUS_STYLE.pending;
                return (
                  <tr key={car.id} style={{ borderBottom: '1px solid #0D1E36' }}>
                    <td style={{ padding: '18px 12px', color: '#4A6A8A', fontSize: '13px' }}>{i + 1}</td>
                    <td style={{ padding: '18px 12px', fontFamily: 'monospace', fontSize: '14px', letterSpacing: '1px' }}>{car.chassis_number}</td>
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

      <footer style={{ borderTop: '1px solid #1E3A5A', padding: '32px 40px', textAlign: 'center', color: '#4A6A8A', fontSize: '13px' }}>
        <span style={{ color: '#4A90B8' }}>Vin</span>Vault Registry © 2026 · vinvault.net
      </footer>
    </main>
  );
}
