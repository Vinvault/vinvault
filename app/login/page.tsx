"use client";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { colors } from "@/app/components/ui/tokens";

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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    color: colors.textPrimary,
    padding: '12px 16px',
    fontSize: '14px',
    fontFamily: 'Georgia, serif',
    boxSizing: 'border-box',
    marginBottom: '16px',
    outline: 'none',
    borderRadius: '2px',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    color: colors.textMuted,
    fontSize: '11px',
    letterSpacing: '2px',
    marginBottom: '8px',
    fontFamily: 'Verdana, sans-serif',
    textTransform: 'uppercase',
  };

  return (
    <main style={{ background: colors.bg, color: colors.textPrimary, fontFamily: 'Georgia, serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
        <div style={{ width: '100%', maxWidth: '440px', background: colors.surface, border: `1px solid ${colors.border}`, padding: '48px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: 'bold' }}>
              <span style={{ color: colors.accent }}>Vin</span>
              <span style={{ color: colors.textPrimary }}>Vault</span>
            </span>
          </div>

          <div style={{ display: 'flex', marginBottom: '40px', borderBottom: `1px solid ${colors.border}` }}>
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); setMessage(""); }}
                style={{
                  flex: 1, padding: '14px', background: 'none', border: 'none',
                  borderBottom: mode === m ? `2px solid ${colors.accent}` : '2px solid transparent',
                  color: mode === m ? colors.textPrimary : colors.textMuted,
                  fontSize: '11px', letterSpacing: '3px', cursor: 'pointer', fontFamily: 'Verdana, sans-serif',
                  textTransform: 'uppercase',
                  transition: 'all 150ms ease',
                }}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <h1 style={{ fontSize: '24px', marginBottom: '8px', fontFamily: 'Georgia, serif', color: colors.textPrimary }}>
            {mode === 'login' ? 'Welcome back' : 'Join the Registry'}
          </h1>
          <p style={{ color: colors.textSecondary, fontSize: '14px', marginBottom: '32px', fontFamily: 'Georgia, serif' }}>
            {mode === 'login' ? 'Sign in to your VinVault account' : 'Create an account to contribute to the registry'}
          </p>

          {error && (
            <div style={{ background: '#F4E8E8', border: `1px solid ${colors.error}`, color: colors.error, padding: '12px 16px', fontSize: '13px', marginBottom: '20px', fontFamily: 'Georgia, serif' }}>
              {error}
            </div>
          )}
          {message && (
            <div style={{ background: '#E8F4EC', border: `1px solid ${colors.success}`, color: colors.success, padding: '12px 16px', fontSize: '13px', marginBottom: '20px', fontFamily: 'Georgia, serif' }}>
              {message}
            </div>
          )}

          <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={inputStyle} />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', background: loading ? colors.surfaceAlt : colors.accentNavy, color: loading ? colors.textMuted : '#FFFDF8',
                padding: '14px', fontSize: '11px', letterSpacing: '2px', border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Verdana, sans-serif', marginTop: '8px',
                textTransform: 'uppercase', transition: 'all 150ms ease',
              }}
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '24px', color: colors.textMuted, fontSize: '13px', fontFamily: 'Georgia, serif' }}>
            {mode === 'login' ? 'No account? ' : 'Already registered? '}
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              style={{ background: 'none', border: 'none', color: colors.accentBlue, cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '13px', textDecoration: 'underline' }}
            >
              {mode === 'login' ? 'Register here' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
