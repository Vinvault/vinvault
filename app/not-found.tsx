import Link from 'next/link';

export default function NotFound() {
  return (
    <main style={{ background: '#080F1A', color: '#E2EEF7', fontFamily: 'Verdana, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="vv-header">
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
          <span style={{ fontSize: '24px', fontWeight: 'bold' }}>
            <span style={{ color: '#4A90B8' }}>Vin</span>
            <span style={{ color: '#E2EEF7' }}>Vault</span>
          </span>
          <span style={{ color: '#4A90B8', fontSize: '10px', letterSpacing: '4px' }}>REGISTRY</span>
        </Link>
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }}>
        <div style={{ textAlign: 'center', maxWidth: '540px', width: '100%' }}>
          <p style={{ color: '#1E3A5A', fontSize: 'clamp(60px, 20vw, 120px)', fontWeight: 'bold', lineHeight: 1, marginBottom: '0', fontFamily: 'Verdana, sans-serif', letterSpacing: '-4px' }}>404</p>
          <p style={{ color: '#4A90B8', letterSpacing: '4px', fontSize: '11px', marginBottom: '24px', marginTop: '-8px' }}>PAGE NOT FOUND</p>
          <h1 style={{ fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 'bold', marginBottom: '16px' }}>
            Page Not Found
          </h1>
          <p style={{ color: '#8BA5B8', fontSize: '16px', lineHeight: '1.7', marginBottom: '48px' }}>
            The page you're looking for doesn't exist or may have moved.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/"
              style={{ background: '#4A90B8', color: '#fff', padding: '13px 32px', textDecoration: 'none', fontSize: '13px', letterSpacing: '2px' }}
            >
              HOME
            </Link>
            <Link
              href="/ferrari/288-gto"
              style={{ border: '1px solid #4A90B8', color: '#4A90B8', padding: '13px 32px', textDecoration: 'none', fontSize: '13px', letterSpacing: '2px' }}
            >
              REGISTRY
            </Link>
            <Link
              href="/submit"
              style={{ border: '1px solid #1E3A5A', color: '#8BA5B8', padding: '13px 32px', textDecoration: 'none', fontSize: '13px', letterSpacing: '2px' }}
            >
              SUBMIT A CAR
            </Link>
          </div>
        </div>
      </div>

      <footer style={{ borderTop: '1px solid #1E3A5A', padding: '28px 40px', textAlign: 'center', color: '#4A6A8A', fontSize: '13px' }}>
        <span style={{ color: '#4A90B8' }}>Vin</span>Vault Registry © 2026 · vinvault.net
      </footer>
    </main>
  );
}
