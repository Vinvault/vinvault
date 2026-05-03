export const dynamic = 'force-dynamic';
import Link from 'next/link';

async function getSubmission(chassis: string) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) return null;
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/submissions?chassis_number=eq.${encodeURIComponent(chassis)}&status=eq.approved&limit=1`,
      {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
        cache: 'no-store',
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data[0] ?? null;
  } catch {
    return null;
  }
}

export default async function CarPage({ params }: { params: Promise<{ chassis: string }> }) {
  const { chassis } = await params;
  const car = await getSubmission(chassis);

  if (!car) {
    return (
      <main style={{ background: '#080F1A', color: '#E2EEF7', fontFamily: 'Georgia, serif', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#4A90B8', letterSpacing: '3px', fontSize: '11px', marginBottom: '16px' }}>CHASSIS NOT FOUND</p>
          <h1 style={{ fontSize: '32px', marginBottom: '24px', fontFamily: 'monospace' }}>{chassis.toUpperCase()}</h1>
          <p style={{ color: '#8BA5B8', marginBottom: '32px' }}>This chassis has not been documented yet.</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link href="/submit" style={{ background: '#4A90B8', color: '#fff', padding: '12px 28px', textDecoration: 'none' }}>Submit This Car</Link>
            <Link href="/ferrari/288-gto" style={{ border: '1px solid #4A90B8', color: '#4A90B8', padding: '12px 28px', textDecoration: 'none' }}>Back to Registry</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: '#080F1A', color: '#E2EEF7', fontFamily: 'Georgia, serif', minHeight: '100vh' }}>
      <header style={{ background: '#0A1828', borderBottom: '1px solid #1E3A5A', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '24px', fontWeight: 'bold' }}>
            <span style={{ color: '#4A90B8' }}>Vin</span><span style={{ color: '#E2EEF7' }}>Vault</span>
          </span>
          <span style={{ color: '#4A90B8', fontSize: '10px', letterSpacing: '4px', marginLeft: '10px' }}>REGISTRY</span>
        </Link>
        <div style={{ color: '#8BA5B8', fontSize: '13px' }}>
          <Link href="/ferrari/288-gto" style={{ color: '#4A90B8', textDecoration: 'none' }}>Ferrari 288 GTO</Link>
          {' → '}{car.chassis_number}
        </div>
      </header>

      <section style={{ padding: '60px 40px 40px', borderBottom: '1px solid #1E3A5A' }}>
        <p style={{ color: '#4A90B8', letterSpacing: '3px', fontSize: '11px', marginBottom: '16px' }}>FERRARI 288 GTO · CHASSIS RECORD</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px', fontFamily: 'monospace', letterSpacing: '2px' }}>{car.chassis_number}</h1>
            <p style={{ color: '#8BA5B8' }}>
              {car.production_date ? `Produced ${car.production_date} · ` : ''}
              {car.original_market ? `Original market: ${car.original_market}` : ''}
            </p>
          </div>
          <span style={{ background: '#0D2A1A', color: '#4AB87A', padding: '8px 20px', fontSize: '12px', letterSpacing: '2px' }}>APPROVED</span>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          <div>
            <h2 style={{ color: '#4A90B8', fontSize: '11px', letterSpacing: '3px', marginBottom: '20px' }}>IDENTITY</h2>
            {[
              ['Chassis Number', car.chassis_number],
              ['Engine Number', car.engine_number],
              ['Gearbox Number', car.gearbox_number],
              ['Production Date', car.production_date],
              ['Original Market', car.original_market],
              ['Matching Numbers', car.matching_numbers],
            ].filter(([, v]) => v).map(([l, v]) => (
              <div key={l as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #0D1E36' }}>
                <span style={{ color: '#8BA5B8', fontSize: '14px' }}>{l}</span>
                <span style={{ fontSize: '14px', fontFamily: String(l).includes('Number') ? 'monospace' : 'Georgia' }}>{String(v)}</span>
              </div>
            ))}
          </div>
          <div>
            <h2 style={{ color: '#4A90B8', fontSize: '11px', letterSpacing: '3px', marginBottom: '20px' }}>CONDITION</h2>
            {[
              ['Exterior Color', car.exterior_color],
              ['Interior Color', car.interior_color],
              ['Condition Score', car.condition_score],
              ['Service History', car.has_service_history],
              ['Books', car.has_books],
              ['Toolkit', car.has_toolkit],
            ].filter(([, v]) => v).map(([l, v]) => (
              <div key={l as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #0D1E36' }}>
                <span style={{ color: '#8BA5B8', fontSize: '14px' }}>{l}</span>
                <span style={{ fontSize: '14px' }}>{String(v)}</span>
              </div>
            ))}
          </div>
        </div>

        {car.provenance && (
          <div style={{ marginTop: '40px' }}>
            <h2 style={{ color: '#4A90B8', fontSize: '11px', letterSpacing: '3px', marginBottom: '16px' }}>PROVENANCE</h2>
            <p style={{ color: '#8BA5B8', lineHeight: '1.7', background: '#0A1828', padding: '20px', border: '1px solid #1E3A5A' }}>{car.provenance}</p>
          </div>
        )}

        {car.source && (
          <div style={{ marginTop: '32px' }}>
            <h2 style={{ color: '#4A90B8', fontSize: '11px', letterSpacing: '3px', marginBottom: '16px' }}>SOURCE</h2>
            <p style={{ color: '#8BA5B8', background: '#0A1828', padding: '20px', border: '1px solid #1E3A5A' }}>{car.source}</p>
          </div>
        )}

        <div style={{ marginTop: '32px' }}>
          <p style={{ color: '#4A6A8A', fontSize: '12px' }}>
            Submitted {new Date(car.created_at).toLocaleDateString()} ·{' '}
            <Link href="/ferrari/288-gto" style={{ color: '#4A90B8' }}>← Back to Registry</Link>
          </p>
        </div>
      </div>

      <footer style={{ borderTop: '1px solid #1E3A5A', padding: '32px 40px', textAlign: 'center', color: '#4A6A8A', fontSize: '13px' }}>
        <span style={{ color: '#4A90B8' }}>Vin</span>Vault Registry © 2026 · vinvault.net
      </footer>
    </main>
  );
}
