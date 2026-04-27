import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen" style={{background: '#080F1A', color: '#E2EEF7', fontFamily: 'Georgia, serif'}}>
      
      {/* Header */}
      <header style={{background: '#0A1828', borderBottom: '1px solid #1E3A5A', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          <span style={{fontSize: '28px', fontWeight: 'bold'}}>
            <span style={{color: '#4A90B8'}}>Vin</span>
            <span style={{color: '#E2EEF7'}}>Vault</span>
          </span>
          <span style={{color: '#4A90B8', fontSize: '11px', letterSpacing: '4px', marginLeft: '12px'}}>REGISTRY</span>
        </div>
        <nav style={{display: 'flex', gap: '24px', fontSize: '14px'}}>
          <Link href="/registry/ferrari-288-gto" style={{color: '#8BA5B8', textDecoration: 'none'}}>Registry</Link>
          <Link href="/about" style={{color: '#8BA5B8', textDecoration: 'none'}}>About</Link>
          <Link href="/login" style={{color: '#4A90B8', textDecoration: 'none', border: '1px solid #4A90B8', padding: '6px 16px'}}>Sign In</Link>
        </nav>
      </header>

      {/* Hero */}
      <section style={{textAlign: 'center', padding: '100px 40px 80px'}}>
        <p style={{color: '#4A90B8', letterSpacing: '4px', fontSize: '12px', marginBottom: '24px'}}>THE DEFINITIVE REGISTRY</p>
        <h1 style={{fontSize: '56px', fontWeight: 'bold', marginBottom: '24px', lineHeight: '1.1'}}>
          Ferrari 288 GTO<br/>
          <span style={{color: '#4A90B8'}}>World Registry</span>
        </h1>
        <p style={{color: '#8BA5B8', fontSize: '18px', maxWidth: '600px', margin: '0 auto 40px', lineHeight: '1.7'}}>
          The most complete documentation of all 272 Ferrari 288 GTO chassis ever produced. 
          Community-verified. Historically accurate.
        </p>
        <div style={{display: 'flex', gap: '16px', justifyContent: 'center'}}>
          <Link href="/registry/ferrari-288-gto" style={{background: '#4A90B8', color: '#fff', padding: '14px 32px', textDecoration: 'none', fontSize: '15px'}}>
            Browse Registry
          </Link>
          <Link href="/submit" style={{border: '1px solid #4A90B8', color: '#4A90B8', padding: '14px 32px', textDecoration: 'none', fontSize: '15px'}}>
            Submit a Car
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section style={{display: 'flex', justifyContent: 'center', gap: '80px', padding: '60px 40px', borderTop: '1px solid #1E3A5A', borderBottom: '1px solid #1E3A5A'}}>
        {[
          {number: '272', label: 'Cars Produced'},
          {number: '0', label: 'Cars Documented'},
          {number: '0', label: 'Verified Owners'},
          {number: '1984', label: 'First Produced'},
        ].map((stat) => (
          <div key={stat.label} style={{textAlign: 'center'}}>
            <div style={{fontSize: '42px', fontWeight: 'bold', color: '#4A90B8'}}>{stat.number}</div>
            <div style={{color: '#8BA5B8', fontSize: '13px', letterSpacing: '2px', marginTop: '8px'}}>{stat.label}</div>
          </div>
        ))}
      </section>

      {/* About section */}
      <section style={{maxWidth: '800px', margin: '0 auto', padding: '80px 40px', textAlign: 'center'}}>
        <h2 style={{fontSize: '32px', marginBottom: '24px'}}>Why VinVault?</h2>
        <p style={{color: '#8BA5B8', lineHeight: '1.8', fontSize: '16px', marginBottom: '40px'}}>
          The Ferrari 288 GTO is one of the most significant supercars ever built — 
          only 272 were produced. VinVault exists to document every single one. 
          Each chassis number, its history, its current status, verified by a global community of experts and owners.
        </p>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '32px', textAlign: 'left'}}>
          {[
            {title: 'Community Verified', desc: 'Every entry validated by trusted community members with deep expertise.'},
            {title: 'Complete History', desc: 'Chassis numbers, production dates, ownership history, auction records.'},
            {title: 'Global Registry', desc: 'Cars tracked across 30+ countries. The most complete record anywhere.'},
          ].map((item) => (
            <div key={item.title} style={{borderTop: '2px solid #4A90B8', paddingTop: '20px'}}>
              <h3 style={{fontSize: '16px', marginBottom: '12px'}}>{item.title}</h3>
              <p style={{color: '#8BA5B8', fontSize: '14px', lineHeight: '1.7'}}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{borderTop: '1px solid #1E3A5A', padding: '32px 40px', textAlign: 'center', color: '#4A6A8A', fontSize: '13px'}}>
        <span style={{color: '#4A90B8'}}>Vin</span>Vault Registry © 2026 · vinvault.net
      </footer>

    </main>
  );
}
