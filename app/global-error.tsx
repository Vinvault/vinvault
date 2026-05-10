'use client';

export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#F8F6F1', color: '#1A1A1A', fontFamily: 'Verdana, sans-serif' }}>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <header style={{ background: '#FFFDF8', borderBottom: '1px solid #E8E2D8', padding: '20px 40px' }}>
            <a href="/" style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: '24px', fontWeight: 'bold' }}>
                <span style={{ color: '#C9A84C' }}>Vin</span>
                <span style={{ color: '#1A1A1A' }}>Vault</span>
              </span>
              <span style={{ color: '#C9A84C', fontSize: '10px', letterSpacing: '4px', marginLeft: '10px' }}>REGISTRY</span>
            </a>
          </header>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 40px' }}>
            <div style={{ textAlign: 'center', maxWidth: '540px' }}>
              <p style={{ color: '#D8D0C4', fontSize: '120px', fontWeight: 'bold', lineHeight: 1, marginBottom: '0', letterSpacing: '-4px' }}>500</p>
              <p style={{ color: '#E07070', letterSpacing: '4px', fontSize: '11px', marginBottom: '24px', marginTop: '-8px' }}>SERVER ERROR</p>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' }}>
                Something went wrong
              </h1>
              <p style={{ color: '#6A5A4A', fontSize: '16px', lineHeight: '1.7', marginBottom: '48px' }}>
                An unexpected error occurred on our end. This has been logged. You can try again, or return to the homepage while we look into it.
              </p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={unstable_retry}
                  style={{ background: '#1A1A1A', color: '#FFFDF8', padding: '13px 32px', border: 'none', fontSize: '13px', letterSpacing: '2px', cursor: 'pointer', fontFamily: 'Verdana, sans-serif' }}
                >
                  TRY AGAIN
                </button>
                <a
                  href="/"
                  style={{ border: '1px solid #C9A84C', color: '#C9A84C', padding: '13px 32px', textDecoration: 'none', fontSize: '13px', letterSpacing: '2px' }}
                >
                  HOME
                </a>
              </div>
            </div>
          </div>

          <footer style={{ borderTop: '1px solid #E8E2D8', padding: '28px 40px', textAlign: 'center', color: '#9A8A7A', fontSize: '13px' }}>
            © 2026 <span style={{ color: '#C9A84C' }}>Vin</span>Vault — Curated Automotive Registry
          </footer>
        </div>
      </body>
    </html>
  );
}
