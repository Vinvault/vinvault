import Link from 'next/link';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <main style={{ background: '#080F1A', color: '#E2EEF7', fontFamily: 'Verdana, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: '#0A1828', borderBottom: '1px solid #1E3A5A', padding: '20px 40px' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '24px', fontWeight: 'bold' }}>
            <span style={{ color: '#4A90B8' }}>Vin</span>
            <span style={{ color: '#E2EEF7' }}>Vault</span>
          </span>
          <span style={{ color: '#4A90B8', fontSize: '10px', letterSpacing: '4px', marginLeft: '10px' }}>REGISTRY</span>
        </Link>
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '400px', padding: '0 24px' }}>
          <p style={{ color: '#4A90B8', letterSpacing: '3px', fontSize: '11px', marginBottom: '12px', textAlign: 'center' }}>ADMIN ACCESS</p>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '40px', textAlign: 'center' }}>Sign In</h1>

          {error && (
            <div style={{ background: '#2A0D0D', border: '1px solid #E07070', color: '#E07070', padding: '12px 16px', fontSize: '13px', marginBottom: '24px', letterSpacing: '1px' }}>
              Incorrect password.
            </div>
          )}

          <form action="/api/admin/login" method="POST">
            {next && <input type="hidden" name="next" value={next} />}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: '#8BA5B8', fontSize: '11px', letterSpacing: '2px', marginBottom: '8px' }}>
                PASSWORD
              </label>
              <input
                type="password"
                name="password"
                autoFocus
                required
                style={{
                  width: '100%',
                  background: '#0A1828',
                  border: '1px solid #1E3A5A',
                  color: '#E2EEF7',
                  padding: '12px 16px',
                  fontSize: '15px',
                  fontFamily: 'Verdana, sans-serif',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                width: '100%',
                background: '#0A1828',
                color: '#4A90B8',
                border: '1px solid #4A90B8',
                padding: '14px',
                fontSize: '13px',
                letterSpacing: '3px',
                cursor: 'pointer',
                fontFamily: 'Verdana, sans-serif',
              }}
            >
              ENTER
            </button>
          </form>
        </div>
      </div>

      <footer style={{ borderTop: '1px solid #1E3A5A', padding: '32px 40px', textAlign: 'center', color: '#4A6A8A', fontSize: '13px' }}>
        <span style={{ color: '#4A90B8' }}>Vin</span>Vault Registry © 2026 · Admin
      </footer>
    </main>
  );
}
