"use client";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function Login() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">(
    searchParams.get("tab") === "register" ? "register" : "login"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createSupabaseBrowserClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      window.location.href = "/ferrari/288-gto";
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // autoconfirm is on — log them straight in
      const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password });
      if (loginErr) {
        setMessage("Account created. Please sign in.");
        setMode("login");
        setLoading(false);
      } else {
        window.location.href = "/ferrari/288-gto";
      }
    }
  };

  const inputStyle = {
    width: '100%',
    background: '#0D1E36',
    border: '1px solid #1E3A5A',
    color: '#E2EEF7',
    padding: '12px 16px',
    fontSize: '14px',
    fontFamily: 'Verdana, sans-serif',
    boxSizing: 'border-box' as const,
    marginBottom: '16px',
    outline: 'none',
  };

  const labelStyle = {
    display: 'block',
    color: '#8BA5B8',
    fontSize: '11px',
    letterSpacing: '2px',
    marginBottom: '8px',
  };

  return (
    <main style={{ background: '#080F1A', color: '#E2EEF7', fontFamily: 'Verdana, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: '#0A1828', borderBottom: '1px solid #1E3A5A', padding: '20px 40px' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '24px', fontWeight: 'bold' }}>
            <span style={{ color: '#4A90B8' }}>Vin</span><span style={{ color: '#E2EEF7' }}>Vault</span>
          </span>
          <span style={{ color: '#4A90B8', fontSize: '10px', letterSpacing: '4px', marginLeft: '10px' }}>REGISTRY</span>
        </Link>
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <div style={{ display: 'flex', marginBottom: '40px', borderBottom: '1px solid #1E3A5A' }}>
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); setMessage(""); }}
                style={{
                  flex: 1, padding: '14px', background: 'none', border: 'none',
                  borderBottom: mode === m ? '2px solid #4A90B8' : '2px solid transparent',
                  color: mode === m ? '#E2EEF7' : '#4A6A8A',
                  fontSize: '11px', letterSpacing: '3px', cursor: 'pointer', fontFamily: 'Verdana, sans-serif',
                }}
              >
                {m === 'login' ? 'SIGN IN' : 'REGISTER'}
              </button>
            ))}
          </div>

          <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>
            {mode === 'login' ? 'Welcome back' : 'Join the Registry'}
          </h1>
          <p style={{ color: '#8BA5B8', fontSize: '14px', marginBottom: '32px' }}>
            {mode === 'login' ? 'Sign in to your VinVault account' : 'Create an account to contribute to the registry'}
          </p>

          {error && (
            <div style={{ background: '#2A0D0D', border: '1px solid #8A2A2A', color: '#E07070', padding: '12px 16px', fontSize: '13px', marginBottom: '20px' }}>
              {error}
            </div>
          )}
          {message && (
            <div style={{ background: '#0D2A1A', border: '1px solid #2A8A4A', color: '#70E0A0', padding: '12px 16px', fontSize: '13px', marginBottom: '20px' }}>
              {message}
            </div>
          )}

          <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>
            <div>
              <label style={labelStyle}>EMAIL</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>PASSWORD</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={inputStyle} />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', background: loading ? '#2A4A6A' : '#4A90B8', color: '#fff',
                padding: '14px', fontSize: '13px', letterSpacing: '2px', border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Verdana, sans-serif', marginTop: '8px',
              }}
            >
              {loading ? 'PLEASE WAIT...' : mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '24px', color: '#4A6A8A', fontSize: '13px' }}>
            {mode === 'login' ? 'No account? ' : 'Already registered? '}
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              style={{ background: 'none', border: 'none', color: '#4A90B8', cursor: 'pointer', fontFamily: 'Verdana, sans-serif', fontSize: '13px' }}
            >
              {mode === 'login' ? 'Register here' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>

      <footer style={{ borderTop: '1px solid #1E3A5A', padding: '24px 40px', textAlign: 'center', color: '#4A6A8A', fontSize: '13px' }}>
        <span style={{ color: '#4A90B8' }}>Vin</span>Vault Registry © 2026 · vinvault.net
      </footer>
    </main>
  );
}
