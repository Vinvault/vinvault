'use client';

export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#080F1A', color: '#E2EEF7', fontFamily: 'Verdana, sans-serif' }}>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <header style={{ background: '#0A1828', borderBottom: '1px solid #1E3A5A', padding: '20px 40px' }}>
            <a href="/" style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: '24px', fontWeight: 'bold' }}>
                <span style={{ color: '#4A90B8' }}>Vin</span>
                <span style={{ color: '#E2EEF7' }}>Vault</span>
              </span>
              <span style={{ color: '#4A90B8', fontSize: '10px', letterSpacing: '4px', marginLeft: '10px' }}>REGISTRY</span>
            </a>
          </header>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 40px' }}>
            <div style={{ textAlign: 'center', maxWidth: '540px' }}>
              <p style={{ color: '#1E3A5A', fontSize: '120px', fontWeight: 'bold', lineHeight: 1, marginBottom: '0', letterSpacing: '-4px' }}>500</p>
              <p style={{ color: '#E07070', letterSpacing: '4px', fontSize: '11px', marginBottom: '24px', marginTop: '-8px' }}>SERVER ERROR</p>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' }}>
                Something went wrong
              </h1>
              <p style={{ color: '#8BA5B8', fontSize: '16px', lineHeight: '1.7', marginBottom: '48px' }}>
                An unexpected error occurred on our end. This has been logged. You can try again, or return to the homepage while we look into it.
              </p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={unstable_retry}
                  style={{ background: '#4A90B8', color: '#fff', padding: '13px 32px', border: 'none', fontSize: '13px', letterSpacing: '2px', cursor: 'pointer', fontFamily: 'Verdana, sans-serif' }}
                >
                  TRY AGAIN
                </button>
                <a
                  href="/"
                  style={{ border: '1px solid #4A90B8', color: '#4A90B8', padding: '13px 32px', textDecoration: 'none', fontSize: '13px', letterSpacing: '2px' }}
                >
                  HOME
                </a>
              </div>
            </div>
          </div>

          <footer style={{ borderTop: '1px solid #1E3A5A', padding: '28px 40px', textAlign: 'center', color: '#4A6A8A', fontSize: '13px' }}>
            © 2026 <span style={{ color: '#4A90B8' }}>Vin</span>Vault — Curated Automotive Registry
          </footer>
        </div>
      </body>
    </html>
  );
}
