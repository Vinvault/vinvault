import Link from "next/link";

export const dynamic = 'force-dynamic';

async function getSubmission(id: string) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) return null;
  const res = await fetch(`${supabaseUrl}/rest/v1/submissions?id=eq.${id}`, {
    headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
    cache: 'no-store'
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data[0] || null;
}

export default async function SubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await getSubmission(id);
  if (!s) return (
    <main style={{background: '#080F1A', color: '#E2EEF7', fontFamily: 'Georgia, serif', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{textAlign: 'center'}}>
        <h1 style={{fontSize: '28px', marginBottom: '16px'}}>Not found</h1>
        <Link href="/admin" style={{color: '#4A90B8'}}>Back to Admin</Link>
      </div>
    </main>
  );

  return (
    <main style={{background: '#080F1A', color: '#E2EEF7', fontFamily: 'Georgia, serif', minHeight: '100vh'}}>
      <header style={{background: '#0A1828', borderBottom: '1px solid #1E3A5A', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <Link href="/" style={{textDecoration: 'none'}}>
          <span style={{fontSize: '24px', fontWeight: 'bold'}}><span style={{color: '#4A90B8'}}>Vin</span><span style={{color: '#E2EEF7'}}>Vault</span></span>
          <span style={{color: '#4A90B8', fontSize: '10px', letterSpacing: '4px', marginLeft: '10px'}}>REGISTRY</span>
        </Link>
        <Link href="/admin" style={{color: '#4A90B8', fontSize: '13px', textDecoration: 'none'}}>← Back to Admin</Link>
      </header>
      <div style={{maxWidth: '900px', margin: '0 auto', padding: '40px'}}>
        <p style={{color: '#4A90B8', letterSpacing: '3px', fontSize: '11px', marginBottom: '16px'}}>SUBMISSION REVIEW</p>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px'}}>
          <h1 style={{fontSize: '32px', fontWeight: 'bold', fontFamily: 'monospace'}}>{s.chassis_number}</h1>
          <span style={{
            background: s.status === 'approved' ? '#0D2A1A' : s.status === 'rejected' ? '#2A0D0D' : '#2A1A0D',
            color: s.status === 'approved' ? '#4AB87A' : s.status === 'rejected' ? '#E07070' : '#B8944A',
            padding: '8px 20px', fontSize: '12px', letterSpacing: '2px'
          }}>{s.status?.toUpperCase()}</span>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px'}}>
          <div>
            <h2 style={{color: '#4A90B8', fontSize: '11px', letterSpacing: '3px', marginBottom: '20px'}}>IDENTITY</h2>
            {[['Chassis', s.chassis_number], ['Engine', s.engine_number], ['Gearbox', s.gearbox_number], ['Production', s.production_date], ['Market', s.original_market], ['Matching Numbers', s.matching_numbers]].map(([l, v]) => v && (
              <div key={l} style={{display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #0D1E36'}}>
                <span style={{color: '#8BA5B8', fontSize: '13px'}}>{l}</span>
                <span style={{fontSize: '13px'}}>{v}</span>
              </div>
            ))}
          </div>
          <div>
            <h2 style={{color: '#4A90B8', fontSize: '11px', letterSpacing: '3px', marginBottom: '20px'}}>CONDITION</h2>
            {[['Exterior', s.exterior_color], ['Interior', s.interior_color], ['Condition', s.condition_score], ['Service History', s.has_service_history], ['Books', s.has_books], ['Toolkit', s.has_toolkit]].map(([l, v]) => v && (
              <div key={l} style={{display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #0D1E36'}}>
                <span style={{color: '#8BA5B8', fontSize: '13px'}}>{l}</span>
                <span style={{fontSize: '13px'}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        {s.provenance && <div style={{marginBottom: '32px'}}><h2 style={{color: '#4A90B8', fontSize: '11px', letterSpacing: '3px', marginBottom: '16px'}}>PROVENANCE</h2><p style={{color: '#8BA5B8', lineHeight: '1.7', background: '#0A1828', padding: '20px', border: '1px solid #1E3A5A'}}>{s.provenance}</p></div>}
        {s.source && <div style={{marginBottom: '32px'}}><h2 style={{color: '#4A90B8', fontSize: '11px', letterSpacing: '3px', marginBottom: '16px'}}>SOURCE</h2><p style={{color: '#8BA5B8', background: '#0A1828', padding: '20px', border: '1px solid #1E3A5A'}}>{s.source}</p></div>}
        <div style={{marginBottom: '40px'}}>
          <h2 style={{color: '#4A90B8', fontSize: '11px', letterSpacing: '3px', marginBottom: '16px'}}>SUBMITTER</h2>
          <p style={{color: '#8BA5B8'}}>{s.submitter_email || 'Anonymous'}</p>
          <p style={{color: '#4A6A8A', fontSize: '12px', marginTop: '8px'}}>Submitted: {new Date(s.created_at).toLocaleString()}</p>
        </div>
        <div style={{display: 'flex', gap: '16px'}}>
          <form action="/api/admin/approve" method="POST">
            <input type="hidden" name="id" value={s.id} />
            <button type="submit" style={{background: '#0D2A1A', color: '#4AB87A', border: '1px solid #4AB87A', padding: '14px 32px', fontSize: '13px', letterSpacing: '2px', cursor: 'pointer', fontFamily: 'Georgia, serif'}}>✓ APPROVE</button>
          </form>
          <form action="/api/admin/reject" method="POST">
            <input type="hidden" name="id" value={s.id} />
            <button type="submit" style={{background: '#2A0D0D', color: '#E07070', border: '1px solid #E07070', padding: '14px 32px', fontSize: '13px', letterSpacing: '2px', cursor: 'pointer', fontFamily: 'Georgia, serif'}}>✗ REJECT</button>
          </form>
        </div>
      </div>
      <footer style={{borderTop: '1px solid #1E3A5A', padding: '32px 40px', textAlign: 'center', color: '#4A6A8A', fontSize: '13px'}}>
        <span style={{color: '#4A90B8'}}>Vin</span>Vault Registry © 2026 · Admin
      </footer>
    </main>
  );
}
