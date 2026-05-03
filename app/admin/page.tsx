import Link from "next/link";

async function getSubmissions() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) return [];
  const res = await fetch(`${supabaseUrl}/rest/v1/submissions?order=created_at.desc`, {
    headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
    cache: 'no-store'
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function AdminPage() {
  const submissions = await getSubmissions();
  return (
    <main style={{background: '#080F1A', color: '#E2EEF7', fontFamily: 'Georgia, serif', minHeight: '100vh'}}>
      <header style={{background: '#0A1828', borderBottom: '1px solid #1E3A5A', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <Link href="/" style={{textDecoration: 'none'}}>
          <span style={{fontSize: '24px', fontWeight: 'bold'}}><span style={{color: '#4A90B8'}}>Vin</span><span style={{color: '#E2EEF7'}}>Vault</span></span>
          <span style={{color: '#4A90B8', fontSize: '10px', letterSpacing: '4px', marginLeft: '10px'}}>REGISTRY</span>
        </Link>
        <div style={{color: '#E07070', fontSize: '13px', letterSpacing: '2px'}}>ADMIN PANEL</div>
      </header>
      <div style={{maxWidth: '1200px', margin: '0 auto', padding: '40px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px'}}>
          <div>
            <p style={{color: '#4A90B8', letterSpacing: '3px', fontSize: '11px', marginBottom: '8px'}}>FERRARI 288 GTO · WORLD REGISTRY</p>
            <h1 style={{fontSize: '32px', fontWeight: 'bold'}}>Submissions</h1>
          </div>
          <div style={{display: 'flex', gap: '16px'}}>
            {[
              {label: 'Total', value: submissions.length, color: '#4A90B8'},
              {label: 'Pending', value: submissions.filter((s: any) => s.status === 'pending').length, color: '#B8944A'},
              {label: 'Approved', value: submissions.filter((s: any) => s.status === 'approved').length, color: '#4AB87A'},
            ].map(stat => (
              <div key={stat.label} style={{background: '#0A1828', border: '1px solid #1E3A5A', padding: '16px 24px', textAlign: 'center'}}>
                <div style={{fontSize: '28px', fontWeight: 'bold', color: stat.color}}>{stat.value}</div>
                <div style={{color: '#8BA5B8', fontSize: '11px', letterSpacing: '2px', marginTop: '4px'}}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        {submissions.length === 0 ? (
          <div style={{textAlign: 'center', padding: '80px', color: '#4A6A8A'}}><p>No submissions yet.</p></div>
        ) : (
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{borderBottom: '1px solid #1E3A5A', color: '#4A90B8', fontSize: '11px', letterSpacing: '2px', textAlign: 'left'}}>
                <th style={{padding: '16px 12px'}}>CHASSIS</th>
                <th style={{padding: '16px 12px'}}>COLOR</th>
                <th style={{padding: '16px 12px'}}>MARKET</th>
                <th style={{padding: '16px 12px'}}>SUBMITTED</th>
                <th style={{padding: '16px 12px'}}>STATUS</th>
                <th style={{padding: '16px 12px'}}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s: any) => (
                <tr key={s.id} style={{borderBottom: '1px solid #0D1E36'}}>
                  <td style={{padding: '16px 12px', fontFamily: 'monospace', fontSize: '13px'}}>{s.chassis_number}</td>
                  <td style={{padding: '16px 12px', color: '#8BA5B8', fontSize: '13px'}}>{s.exterior_color || '—'}</td>
                  <td style={{padding: '16px 12px', color: '#8BA5B8', fontSize: '13px'}}>{s.original_market || '—'}</td>
                  <td style={{padding: '16px 12px', color: '#8BA5B8', fontSize: '13px'}}>{new Date(s.created_at).toLocaleDateString()}</td>
                  <td style={{padding: '16px 12px'}}>
                    <span style={{
                      background: s.status === 'approved' ? '#0D2A1A' : s.status === 'rejected' ? '#2A0D0D' : '#2A1A0D',
                      color: s.status === 'approved' ? '#4AB87A' : s.status === 'rejected' ? '#E07070' : '#B8944A',
                      padding: '4px 10px', fontSize: '11px', letterSpacing: '1px'
                    }}>{s.status?.toUpperCase()}</span>
                  </td>
                  <td style={{padding: '16px 12px'}}>
                    <Link href={`/admin/submission/${s.id}`} style={{color: '#4A90B8', fontSize: '12px', textDecoration: 'none', border: '1px solid #1E3A5A', padding: '4px 10px'}}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <footer style={{borderTop: '1px solid #1E3A5A', padding: '32px 40px', textAlign: 'center', color: '#4A6A8A', fontSize: '13px'}}>
        <span style={{color: '#4A90B8'}}>Vin</span>Vault Registry © 2026 · Admin
      </footer>
    </main>
  );
}
