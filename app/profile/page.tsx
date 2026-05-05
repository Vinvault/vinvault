"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import AppHeader from "@/app/components/AppHeader";

interface Submission {
  id: string;
  chassis_number: string;
  exterior_color: string;
  original_market: string;
  status: string;
  created_at: string;
}

interface Claim {
  id: string;
  chassis_number: string;
  status: string;
  message: string;
  created_at: string;
}

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  approved:  { bg: '#0D2A1A', color: '#4AB87A', label: 'Approved' },
  pending:   { bg: '#2A1A0D', color: '#B8944A', label: 'Pending Review' },
  rejected:  { bg: '#2A0D0D', color: '#E07070', label: 'Rejected' },
};

const CLAIM_STATUS: Record<string, { bg: string; color: string; label: string }> = {
  approved: { bg: '#0D2A1A', color: '#4AB87A', label: 'Approved — Owner Verified' },
  pending:  { bg: '#2A1A0D', color: '#B8944A', label: 'Pending Review' },
  rejected: { bg: '#2A0D0D', color: '#E07070', label: 'Rejected' },
};

const PROFILE_NAV = [
  { href: "/ferrari/288-gto", label: "Registry" },
  { href: "/submit", label: "Submit", highlight: true as const },
];

export default function ProfilePage() {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseBrowserClient();

  function computePoints(subs: Submission[]) {
    const approved = subs.filter(s => s.status === "approved").length;
    const rejected = subs.filter(s => s.status === "rejected").length;
    return subs.length * 10 + approved * 50 - rejected * 5;
  }

  function getBadge(pts: number) {
    if (pts >= 1000) return { label: "Expert", color: "#F0C040", bg: "#2A1F00" };
    if (pts >= 500) return { label: "Gold", color: "#C8A000", bg: "#1A1400" };
    if (pts >= 100) return { label: "Silver", color: "#A0B0C0", bg: "#141820" };
    return { label: "Bronze", color: "#C87840", bg: "#1A1000" };
  }

  useEffect(() => {
    async function load() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { setLoading(false); return; }
      setUser({ email: authUser.email ?? '' });

      const [subsData, claimsRes] = await Promise.all([
        supabase
          .from('submissions')
          .select('id,chassis_number,exterior_color,original_market,status,created_at')
          .eq('submitter_email', authUser.email)
          .order('created_at', { ascending: false }),
        fetch(`/api/car-claims?user=1`),
      ]);

      setSubmissions(subsData.data ?? []);

      if (claimsRes.ok) {
        const claimsData = await claimsRes.json();
        setClaims(Array.isArray(claimsData) ? claimsData : []);
      }

      setLoading(false);
    }
    load();
  }, []);

  return (
    <main style={{ background: '#080F1A', color: '#E2EEF7', fontFamily: 'Verdana, sans-serif', minHeight: '100vh' }}>
      <AppHeader nav={PROFILE_NAV} />

      <nav aria-label="Breadcrumb" style={{ padding: '14px 40px', background: '#0A1828', borderBottom: '1px solid #1E3A5A', fontSize: '12px', color: '#4A6A8A', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <Link href="/" style={{ color: '#4A6A8A', textDecoration: 'none' }}>Home</Link>
        <span style={{ color: '#1E3A5A' }}>/</span>
        <span style={{ color: '#8BA5B8' }}>Profile</span>
      </nav>

      <div className="vv-page-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#4A6A8A' }}>
            <p>Loading...</p>
          </div>
        ) : !user ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <p style={{ color: '#4A90B8', letterSpacing: '3px', fontSize: '11px', marginBottom: '16px' }}>PROFILE</p>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' }}>Sign in to view your profile</h1>
            <p style={{ color: '#8BA5B8', fontSize: '15px', marginBottom: '36px', lineHeight: '1.7' }}>
              Track your submitted cars, ownership claims, and registry contributions.
            </p>
            <Link href="/login" style={{ background: '#4A90B8', color: '#fff', padding: '13px 32px', textDecoration: 'none', fontSize: '13px', letterSpacing: '2px' }}>
              SIGN IN
            </Link>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <p style={{ color: '#4A90B8', letterSpacing: '3px', fontSize: '11px', marginBottom: '16px' }}>YOUR ACCOUNT</p>
                <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>Profile</h1>
                <p style={{ color: '#8BA5B8', fontSize: '14px' }}>{user.email}</p>
              </div>
              {(() => {
                const pts = computePoints(submissions);
                const b = getBadge(pts);
                return (
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ background: b.bg, color: b.color, padding: '4px 14px', fontSize: '12px', letterSpacing: '2px', border: `1px solid ${b.color}40`, display: 'inline-block', marginBottom: '8px' }}>
                      {b.label.toUpperCase()}
                    </span>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#4A90B8', lineHeight: 1 }}>{pts}</p>
                    <p style={{ color: '#4A6A8A', fontSize: '11px', letterSpacing: '1px', marginTop: '4px' }}>POINTS</p>
                    <Link href="/leaderboard" style={{ color: '#4A90B8', fontSize: '12px', textDecoration: 'none' }}>View leaderboard →</Link>
                  </div>
                );
              })()}
            </div>

            {/* Summary stats */}
            <div style={{ display: 'flex', gap: '24px', marginBottom: '48px', flexWrap: 'wrap' }}>
              {[
                { n: submissions.length, l: 'Total Submitted', color: '#4A90B8' },
                { n: submissions.filter(s => s.status === 'approved').length, l: 'Approved', color: '#4AB87A' },
                { n: submissions.filter(s => s.status === 'pending').length, l: 'Pending', color: '#B8944A' },
                { n: claims.filter(c => c.status === 'approved').length, l: 'Cars Claimed', color: '#4A90B8' },
              ].map(stat => (
                <div key={stat.l} style={{ background: '#0A1828', border: '1px solid #1E3A5A', padding: '20px 28px', textAlign: 'center', flex: '1', minWidth: '120px' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: stat.color }}>{stat.n}</div>
                  <div style={{ color: '#8BA5B8', fontSize: '11px', letterSpacing: '2px', marginTop: '6px' }}>{stat.l}</div>
                </div>
              ))}
            </div>

            {/* Ownership Claims */}
            {claims.length > 0 && (
              <div style={{ marginBottom: '48px' }}>
                <p style={{ color: '#4A90B8', letterSpacing: '3px', fontSize: '11px', marginBottom: '16px' }}>OWNERSHIP CLAIMS</p>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Your Claims</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {claims.map(c => {
                    const cs = CLAIM_STATUS[c.status] ?? CLAIM_STATUS.pending;
                    return (
                      <Link key={c.id} href={`/ferrari/288-gto/${c.chassis_number}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div
                          style={{ background: '#0A1828', border: '1px solid #1E3A5A', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}
                          onMouseEnter={e => (e.currentTarget.style.borderColor = '#4A90B8')}
                          onMouseLeave={e => (e.currentTarget.style.borderColor = '#1E3A5A')}
                        >
                          <div>
                            <p style={{ fontFamily: 'monospace', fontSize: '15px', letterSpacing: '1px', marginBottom: '4px' }}>{c.chassis_number}</p>
                            <p style={{ color: '#4A6A8A', fontSize: '12px' }}>Ferrari 288 GTO</p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span style={{ background: cs.bg, color: cs.color, padding: '4px 12px', fontSize: '11px', letterSpacing: '1px' }}>
                              {cs.label.toUpperCase()}
                            </span>
                            <span style={{ color: '#4A6A8A', fontSize: '12px' }}>
                              {new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Submissions */}
            <div>
              <p style={{ color: '#4A90B8', letterSpacing: '3px', fontSize: '11px', marginBottom: '16px' }}>YOUR SUBMISSIONS</p>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' }}>Submitted Cars</h2>

              {submissions.length === 0 ? (
                <div style={{ border: '1px solid #1E3A5A', padding: '48px', textAlign: 'center' }}>
                  <p style={{ color: '#4A6A8A', fontSize: '15px', marginBottom: '20px' }}>You haven't submitted any cars yet.</p>
                  <Link href="/submit" style={{ background: '#4A90B8', color: '#fff', padding: '12px 28px', textDecoration: 'none', fontSize: '13px', letterSpacing: '2px' }}>
                    SUBMIT A CAR
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {submissions.map(s => {
                    const st = STATUS_STYLE[s.status] ?? STATUS_STYLE.pending;
                    return (
                      <Link key={s.id} href={`/ferrari/288-gto/${s.chassis_number}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div
                          style={{ background: '#0A1828', border: '1px solid #1E3A5A', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}
                          onMouseEnter={e => (e.currentTarget.style.borderColor = '#4A90B8')}
                          onMouseLeave={e => (e.currentTarget.style.borderColor = '#1E3A5A')}
                        >
                          <div>
                            <p style={{ fontFamily: 'monospace', fontSize: '15px', letterSpacing: '1px', marginBottom: '4px' }}>{s.chassis_number}</p>
                            <p style={{ color: '#4A6A8A', fontSize: '12px' }}>
                              Ferrari 288 GTO
                              {s.exterior_color ? ` · ${s.exterior_color}` : ''}
                              {s.original_market ? ` · ${s.original_market}` : ''}
                            </p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span style={{ background: st.bg, color: st.color, padding: '4px 12px', fontSize: '11px', letterSpacing: '1px' }}>
                              {st.label.toUpperCase()}
                            </span>
                            <span style={{ color: '#4A6A8A', fontSize: '12px' }}>
                              {new Date(s.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ marginTop: '48px', padding: '24px', background: '#0A1828', border: '1px solid #1E3A5A' }}>
              <p style={{ color: '#4A90B8', fontSize: '11px', letterSpacing: '2px', marginBottom: '8px' }}>CONTRIBUTE</p>
              <p style={{ color: '#8BA5B8', fontSize: '14px', lineHeight: '1.7', marginBottom: '16px' }}>
                Help complete the Ferrari 288 GTO world registry. Every chassis documented brings us closer to a complete historical record.
              </p>
              <Link href="/submit" style={{ color: '#4A90B8', textDecoration: 'none', fontSize: '13px', letterSpacing: '1px' }}>
                Submit another car →
              </Link>
            </div>
          </>
        )}
      </div>

      <footer style={{ borderTop: '1px solid #1E3A5A', padding: '28px 40px', textAlign: 'center', color: '#4A6A8A', fontSize: '13px' }}>
        <span style={{ color: '#4A90B8' }}>Vin</span>Vault Registry © 2026 · vinvault.net
      </footer>
    </main>
  );
}
