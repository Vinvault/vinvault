import Link from 'next/link';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <main style={{ background: '#080F1A', color: '#E2EEF7', fontFamily: 'Verdana, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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

    </main>
  );
}
