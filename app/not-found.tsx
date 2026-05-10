import Link from 'next/link';

export default function NotFound() {
  return (
    <main style={{ background: '#F8F6F1', color: '#1A1A1A', fontFamily: 'Verdana, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }}>
        <div style={{ textAlign: 'center', maxWidth: '540px', width: '100%' }}>
          <p style={{ color: '#D8D0C4', fontSize: 'clamp(60px, 20vw, 120px)', fontWeight: 'bold', lineHeight: 1, marginBottom: '0', fontFamily: 'Verdana, sans-serif', letterSpacing: '-4px' }}>404</p>
          <p style={{ color: '#C9A84C', letterSpacing: '4px', fontSize: '11px', marginBottom: '24px', marginTop: '-8px' }}>PAGE NOT FOUND</p>
          <h1 style={{ fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 'bold', marginBottom: '16px' }}>
            Page Not Found
          </h1>
          <p style={{ color: '#6A5A4A', fontSize: '16px', lineHeight: '1.7', marginBottom: '48px' }}>
            The page you&apos;re looking for doesn&apos;t exist or may have moved.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/"
              style={{ background: '#1A1A1A', color: '#FFFDF8', padding: '13px 32px', textDecoration: 'none', fontSize: '13px', letterSpacing: '2px' }}
            >
              HOME
            </Link>
            <Link
              href="/ferrari/288-gto"
              style={{ border: '1px solid #C9A84C', color: '#C9A84C', padding: '13px 32px', textDecoration: 'none', fontSize: '13px', letterSpacing: '2px' }}
            >
              REGISTRY
            </Link>
            <Link
              href="/submit"
              style={{ border: '1px solid #E8E2D8', color: '#6A5A4A', padding: '13px 32px', textDecoration: 'none', fontSize: '13px', letterSpacing: '2px' }}
            >
              SUBMIT A CAR
            </Link>
          </div>
        </div>
      </div>

    </main>
  );
}
