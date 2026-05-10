"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { colors } from "@/app/components/ui/tokens";
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
  approved:  { bg: '#E8F4EC', color: colors.success, label: 'Approved' },
  pending:   { bg: '#FBF3E0', color: '#8A6A1A', label: 'Pending Review' },
  rejected:  { bg: '#F4E8E8', color: colors.error, label: 'Rejected' },
};

const CLAIM_STATUS: Record<string, { bg: string; color: string; label: string }> = {
  approved: { bg: '#E8F4EC', color: colors.success, label: 'Approved — Owner Verified' },
  pending:  { bg: '#FBF3E0', color: '#8A6A1A', label: 'Pending Review' },
  rejected: { bg: '#F4E8E8', color: colors.error, label: 'Rejected' },
};

interface ProfileNotification { type: string; text: string; date: string }

export default function ProfilePage() {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [notifications, setNotifications] = useState<ProfileNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseBrowserClient();

  function computePoints(subs: Submission[]) {
    const approved = subs.filter(s => s.status === "approved").length;
    const rejected = subs.filter(s => s.status === "rejected").length;
    return subs.length * 10 + approved * 50 - rejected * 5;
  }

  function getBadge(pts: number) {
    if (pts >= 1000) return { label: "Expert", color: colors.accent, bg: "#FBF3E0" };
    if (pts >= 500) return { label: "Gold", color: "#8A6A1A", bg: "#FBF3E0" };
    if (pts >= 100) return { label: "Silver", color: colors.textSecondary, bg: colors.surfaceAlt };
    return { label: "Bronze", color: "#8A5A2A", bg: "#F4EDE8" };
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

      // Load pending notifications from spotter profile
      const { data: profileData } = await supabase
        .from("spotter_profiles")
        .select("pending_notifications")
        .eq("user_email", authUser.email!)
        .limit(1)
        .single();
      if (profileData?.pending_notifications && Array.isArray(profileData.pending_notifications)) {
        setNotifications(profileData.pending_notifications as ProfileNotification[]);
        // Clear them after loading
        if (profileData.pending_notifications.length > 0) {
          await supabase
            .from("spotter_profiles")
            .update({ pending_notifications: [] })
            .eq("user_email", authUser.email!);
        }
      }

      setLoading(false);
    }
    load();
  }, []);

  return (
    <main style={{ background: colors.bg, color: colors.textPrimary, fontFamily: 'Georgia, serif', minHeight: '100vh' }}>
      <nav aria-label="Breadcrumb" style={{ padding: '14px 40px', background: colors.surface, borderBottom: `1px solid ${colors.border}`, fontSize: '12px', color: colors.textMuted, display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', fontFamily: 'Verdana, sans-serif' }}>
        <Link href="/" style={{ color: colors.textMuted, textDecoration: 'none' }}>Home</Link>
        <span style={{ color: colors.border }}>/</span>
        <span style={{ color: colors.textSecondary }}>Profile</span>
      </nav>

      <div className="vv-page-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: colors.textMuted }}>
            <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>Loading...</p>
          </div>
        ) : !user ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <p style={{ color: colors.accent, letterSpacing: '3px', fontSize: '11px', marginBottom: '16px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>Profile</p>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px', fontFamily: 'Georgia, serif' }}>Sign in to view your profile</h1>
            <p style={{ color: colors.textSecondary, fontSize: '15px', marginBottom: '36px', lineHeight: '1.7', fontFamily: 'Georgia, serif' }}>
              Track your submitted cars, ownership claims, and registry contributions.
            </p>
            <Link href="/login" style={{ background: colors.accentNavy, color: '#FFFDF8', padding: '13px 32px', textDecoration: 'none', fontSize: '11px', letterSpacing: '2px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>
              Sign In
            </Link>
          </div>
        ) : (
          <>
            {/* Pending notifications */}
            {notifications.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                {notifications.map((n, i) => (
                  <div key={i} style={{ background: '#E8F4EC', border: `1px solid ${colors.success}`, padding: '14px 20px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: colors.success, fontSize: '18px' }}>★</span>
                    <p style={{ color: colors.success, fontSize: '13px', lineHeight: '1.5', fontFamily: 'Georgia, serif' }}>{n.text}</p>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <p style={{ color: colors.accent, letterSpacing: '3px', fontSize: '11px', marginBottom: '16px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>Your Account</p>
                <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', fontFamily: 'Georgia, serif', color: colors.textPrimary }}>Profile</h1>
                <p style={{ color: colors.textMuted, fontSize: '14px', fontFamily: 'Verdana, sans-serif' }}>{user.email}</p>
              </div>
              {(() => {
                const pts = computePoints(submissions);
                const b = getBadge(pts);
                return (
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ background: b.bg, color: b.color, padding: '4px 14px', fontSize: '11px', letterSpacing: '2px', border: `1px solid ${b.color}40`, display: 'inline-block', marginBottom: '8px', fontFamily: 'Verdana, sans-serif' }}>
                      {b.label.toUpperCase()}
                    </span>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', color: colors.accent, lineHeight: 1, fontFamily: 'Georgia, serif' }}>{pts}</p>
                    <p style={{ color: colors.textMuted, fontSize: '11px', letterSpacing: '1px', marginTop: '4px', fontFamily: 'Verdana, sans-serif' }}>POINTS</p>
                    <Link href="/leaderboard" style={{ color: colors.accentBlue, fontSize: '12px', textDecoration: 'none', fontFamily: 'Verdana, sans-serif' }}>View leaderboard →</Link>
                  </div>
                );
              })()}
            </div>

            {/* Summary stats */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '48px', flexWrap: 'wrap' }}>
              {[
                { n: submissions.length, l: 'Total Submitted', color: colors.accentBlue },
                { n: submissions.filter(s => s.status === 'approved').length, l: 'Approved', color: colors.success },
                { n: submissions.filter(s => s.status === 'pending').length, l: 'Pending', color: '#8A6A1A' },
                { n: claims.filter(c => c.status === 'approved').length, l: 'Cars Claimed', color: colors.accent },
              ].map(stat => (
                <div key={stat.l} style={{ background: colors.surface, border: `1px solid ${colors.border}`, padding: '20px 28px', textAlign: 'center', flex: '1', minWidth: '120px' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: stat.color, fontFamily: 'Georgia, serif' }}>{stat.n}</div>
                  <div style={{ color: colors.textMuted, fontSize: '11px', letterSpacing: '2px', marginTop: '6px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>{stat.l}</div>
                </div>
              ))}
            </div>

            {/* Ownership Claims */}
            {claims.length > 0 && (
              <div style={{ marginBottom: '48px' }}>
                <p style={{ color: colors.accent, letterSpacing: '3px', fontSize: '11px', marginBottom: '16px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>Ownership Claims</p>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', fontFamily: 'Georgia, serif', color: colors.textPrimary }}>Your Claims</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {claims.map(c => {
                    const cs = CLAIM_STATUS[c.status] ?? CLAIM_STATUS.pending;
                    return (
                      <Link key={c.id} href={`/ferrari/288-gto/${c.chassis_number}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="vv-card" style={{ background: colors.surface, border: `1px solid ${colors.border}`, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                          <div>
                            <p style={{ fontFamily: 'monospace', fontSize: '15px', letterSpacing: '1px', marginBottom: '4px', color: colors.textPrimary }}>{c.chassis_number}</p>
                            <p style={{ color: colors.textMuted, fontSize: '12px', fontFamily: 'Verdana, sans-serif' }}>Ferrari 288 GTO</p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span style={{ background: cs.bg, color: cs.color, padding: '4px 12px', fontSize: '10px', letterSpacing: '1px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>
                              {cs.label}
                            </span>
                            <span style={{ color: colors.textMuted, fontSize: '12px', fontFamily: 'Verdana, sans-serif' }}>
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
              <p style={{ color: colors.accent, letterSpacing: '3px', fontSize: '11px', marginBottom: '16px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>Your Submissions</p>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', fontFamily: 'Georgia, serif', color: colors.textPrimary }}>Submitted Cars</h2>

              {submissions.length === 0 ? (
                <div style={{ border: `1px solid ${colors.border}`, padding: '48px', textAlign: 'center' }}>
                  <p style={{ color: colors.textMuted, fontSize: '15px', marginBottom: '20px', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>You haven't submitted any cars yet.</p>
                  <Link href="/submit" style={{ background: colors.accentNavy, color: '#FFFDF8', padding: '12px 28px', textDecoration: 'none', fontSize: '11px', letterSpacing: '2px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>
                    Submit a Car
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {submissions.map(s => {
                    const st = STATUS_STYLE[s.status] ?? STATUS_STYLE.pending;
                    return (
                      <Link key={s.id} href={`/ferrari/288-gto/${s.chassis_number}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="vv-card" style={{ background: colors.surface, border: `1px solid ${colors.border}`, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                          <div>
                            <p style={{ fontFamily: 'monospace', fontSize: '15px', letterSpacing: '1px', marginBottom: '4px', color: colors.textPrimary }}>{s.chassis_number}</p>
                            <p style={{ color: colors.textMuted, fontSize: '12px', fontFamily: 'Verdana, sans-serif' }}>
                              Ferrari 288 GTO
                              {s.exterior_color ? ` · ${s.exterior_color}` : ''}
                              {s.original_market ? ` · ${s.original_market}` : ''}
                            </p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span style={{ background: st.bg, color: st.color, padding: '4px 12px', fontSize: '10px', letterSpacing: '1px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>
                              {st.label}
                            </span>
                            <span style={{ color: colors.textMuted, fontSize: '12px', fontFamily: 'Verdana, sans-serif' }}>
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

            <div style={{ marginTop: '48px', padding: '24px', background: colors.surface, border: `1px solid ${colors.border}` }}>
              <p style={{ color: colors.accent, fontSize: '11px', letterSpacing: '2px', marginBottom: '8px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>Contribute</p>
              <p style={{ color: colors.textSecondary, fontSize: '14px', lineHeight: '1.7', marginBottom: '16px', fontFamily: 'Georgia, serif' }}>
                Help complete the Ferrari 288 GTO world registry. Every chassis documented brings us closer to a complete historical record.
              </p>
              <Link href="/submit" style={{ color: colors.accentBlue, textDecoration: 'none', fontSize: '13px', letterSpacing: '1px', fontFamily: 'Verdana, sans-serif' }}>
                Submit another car →
              </Link>
            </div>
          </>
        )}
      </div>

    </main>
  );
}
