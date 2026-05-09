"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const F = "Verdana, sans-serif";
const ROLES = ["super_admin","assistant_admin","registry_moderator","forum_moderator","spotter_moderator","trusted_spotter","registry_contributor","paid_basic","paid_pro","paid_elite","regular","probation","banned"] as const;
const ROLE_COLORS: Record<string, string> = {
  super_admin:"#E07070", assistant_admin:"#E0B87A", registry_moderator:"#4AB87A",
  forum_moderator:"#7AB8E0", spotter_moderator:"#B87AE0", trusted_spotter:"#4A90B8",
  registry_contributor:"#4AB8A0", paid_elite:"#F0C040", paid_pro:"#C8A000",
  paid_basic:"#A0B0C0", regular:"#8BA5B8", probation:"#E0C060", banned:"#E07070",
};
const ACTION_COLORS: Record<string, string> = {
  USER_BANNED:"#E07070", USER_UNBANNED:"#4AB87A", ROLE_CHANGED:"#4A90B8",
  POINTS_AWARDED:"#B8944A", POINTS_REMOVED:"#E08040", SUBMISSION_APPROVED:"#4AB87A",
  SUBMISSION_REJECTED:"#E07070", MODEL_CREATED:"#4A90B8", MODEL_DELETED:"#E07070",
  SPOTTING_APPROVED:"#4AB87A", SPOTTING_REJECTED:"#E07070", USER_UPDATED:"#8BA5B8",
};

const inp: React.CSSProperties = { background: "#0D1E36", border: "1px solid #1E3A5A", color: "#E2EEF7", padding: "9px 14px", fontSize: "13px", fontFamily: F, outline: "none", width: "100%", boxSizing: "border-box" };
const label: React.CSSProperties = { display: "block", color: "#8BA5B8", fontSize: "10px", letterSpacing: "2px", marginBottom: "6px" };
const th: React.CSSProperties = { padding: "10px 12px", color: "#4A90B8", letterSpacing: "2px", fontSize: "10px", textAlign: "left", borderBottom: "1px solid #1E3A5A" };
const td: React.CSSProperties = { padding: "10px 12px", borderBottom: "1px solid #0D1E36", verticalAlign: "middle", fontSize: "12px" };

interface UserProfile {
  id: string; email: string; username: string | null; role: string; is_protected: boolean;
  trust_level: number; total_points: number; verified_spottings: number; country: string | null;
  bio: string | null; avatar_url: string | null; is_banned: boolean; ban_reason: string | null;
  ban_expires_at: string | null; subscription_tier: string | null; subscription_expires_at: string | null;
  is_verified_identity: boolean; is_known_collector: boolean; is_industry_professional: boolean;
  internal_notes: string | null; created_at: string; last_login: string | null;
}
interface Spotting { id: string; chassis_number: string; status: string; spotted_at: string; location_name: string; country: string; }
interface Submission { id: string; chassis_number: string; status: string; created_at: string; }
interface AuditEntry { id: string; admin_email: string; action: string; details: Record<string, unknown> | null; created_at: string; }
interface PointsEntry { id: string; action: string; points: number; awarded_by: string; created_at: string; }

export default function UserEditClient({ id }: { id: string }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [spottings, setSpottings] = useState<Spotting[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [pointsHistory, setPointsHistory] = useState<PointsEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [msgColor, setMsgColor] = useState("#4AB87A");

  // Edit form state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState("");
  const [trustLevel, setTrustLevel] = useState(1);
  const [subTier, setSubTier] = useState("");
  const [subExpiry, setSubExpiry] = useState("");

  // Ban state
  const [banDuration, setBanDuration] = useState("permanent");
  const [banReason, setBanReason] = useState("");

  // Points state
  const [ptAmount, setPtAmount] = useState("");
  const [ptReason, setPtReason] = useState("");

  // Flags
  const [isVerifiedIdentity, setIsVerifiedIdentity] = useState(false);
  const [isKnownCollector, setIsKnownCollector] = useState(false);
  const [isIndustryPro, setIsIndustryPro] = useState(false);
  const [internalNotes, setInternalNotes] = useState("");

  const [activeTab, setActiveTab] = useState<"profile"|"spottings"|"submissions"|"points"|"audit">("profile");

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/users/${id}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/admin/users/${id}/points`).then(r => r.ok ? r.json() : []),
    ]).then(([data, pts]) => {
      if (data) {
        setUser(data.user);
        setSpottings(data.spottings || []);
        setSubmissions(data.submissions || []);
        setAuditLog(data.auditLog || []);
        const u = data.user as UserProfile;
        setUsername(u.username || "");
        setEmail(u.email || "");
        setCountry(u.country || "");
        setBio(u.bio || "");
        setRole(u.role || "regular");
        setTrustLevel(u.trust_level || 1);
        setSubTier(u.subscription_tier || "");
        setSubExpiry(u.subscription_expires_at ? u.subscription_expires_at.slice(0, 10) : "");
        setIsVerifiedIdentity(u.is_verified_identity || false);
        setIsKnownCollector(u.is_known_collector || false);
        setIsIndustryPro(u.is_industry_professional || false);
        setInternalNotes(u.internal_notes || "");
      }
      setPointsHistory(pts);
      setLoading(false);
    });
  }, [id]);

  function notify(text: string, color = "#4AB87A") { setMsg(text); setMsgColor(color); setTimeout(() => setMsg(""), 4000); }

  async function saveProfile() {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username || null, email, country: country || null, bio: bio || null, role, trust_level: trustLevel, subscription_tier: subTier || null, subscription_expires_at: subExpiry || null, is_verified_identity: isVerifiedIdentity, is_known_collector: isKnownCollector, is_industry_professional: isIndustryPro, internal_notes: internalNotes || null, action: "USER_UPDATED", admin_email: "admin" }),
    });
    if (res.ok) { notify("Profile saved."); const d = await res.json(); setUser(d.user); }
    else notify("Save failed.", "#E07070");
  }

  async function changeRole() {
    if (user?.is_protected) { notify("Cannot change role on protected user.", "#E07070"); return; }
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, action: "ROLE_CHANGED", admin_email: "admin" }),
    });
    if (res.ok) notify("Role updated.");
    else notify("Failed.", "#E07070");
  }

  async function banUser() {
    if (user?.is_protected) { notify("Cannot ban protected user.", "#E07070"); return; }
    let banExpires: string | null = null;
    if (banDuration !== "permanent") {
      const days = banDuration === "1d" ? 1 : banDuration === "7d" ? 7 : 30;
      const d = new Date(); d.setDate(d.getDate() + days);
      banExpires = d.toISOString();
    }
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_banned: true, ban_reason: banReason, ban_expires_at: banExpires, action: "USER_BANNED", admin_email: "admin" }),
    });
    if (res.ok) { notify("User banned.", "#E07070"); const d = await res.json(); setUser(d.user); }
    else notify("Failed.", "#E07070");
  }

  async function unbanUser() {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_banned: false, ban_reason: null, ban_expires_at: null, action: "USER_UNBANNED", admin_email: "admin" }),
    });
    if (res.ok) { notify("User unbanned."); const d = await res.json(); setUser(d.user); }
    else notify("Failed.", "#E07070");
  }

  async function adjustPoints(subtract: boolean) {
    const pts = parseInt(ptAmount);
    if (!pts || !ptReason) { notify("Amount and reason required.", "#E0B87A"); return; }
    const res = await fetch(`/api/admin/users/${id}/points`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ points: subtract ? -pts : pts, reason: ptReason, admin_email: "admin" }),
    });
    if (res.ok) {
      const d = await res.json();
      notify(`${subtract ? "Removed" : "Awarded"} ${pts} pts. New total: ${d.new_total}`);
      setPtAmount(""); setPtReason("");
      setUser(prev => prev ? { ...prev, total_points: d.new_total } : prev);
      // Refresh points history
      fetch(`/api/admin/users/${id}/points`).then(r => r.ok ? r.json() : []).then(setPointsHistory);
    } else notify("Failed.", "#E07070");
  }

  async function handleSpotting(sid: string, status: "approved" | "rejected") {
    await fetch("/api/sightings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: sid, status }) });
    setSpottings(prev => prev.map(s => s.id === sid ? { ...s, status } : s));
  }

  if (loading) return <div style={{ padding: "48px", color: "#4A6A8A", fontFamily: F }}>Loading…</div>;
  if (!user) return <div style={{ padding: "48px", color: "#E07070", fontFamily: F }}>User not found.</div>;

  const roleColor = ROLE_COLORS[user.role] || "#8BA5B8";
  const tabs: { id: typeof activeTab; label: string }[] = [
    { id: "profile", label: "Profile" },
    { id: "spottings", label: `Spottings (${spottings.length})` },
    { id: "submissions", label: `Registry (${submissions.length})` },
    { id: "points", label: `Points History (${pointsHistory.length})` },
    { id: "audit", label: `Audit Log (${auditLog.length})` },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#060D18", fontFamily: F, color: "#E2EEF7" }}>
      {/* top bar */}
      <header style={{ background: "#04080F", borderBottom: "1px solid #1E2A0D", padding: "12px 32px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <Link href="/admin" style={{ color: "#4A6A8A", fontSize: "11px", textDecoration: "none" }}>← Admin Panel</Link>
        <span style={{ color: "#4A6A8A" }}>/</span>
        <Link href="/admin" onClick={() => {}} style={{ color: "#4A6A8A", fontSize: "11px", textDecoration: "none" }}>Users</Link>
        <span style={{ color: "#4A6A8A" }}>/</span>
        <span style={{ color: "#E2EEF7", fontSize: "11px" }}>{user.username || user.email}</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: "12px" }}>
          <Link href="/" style={{ color: "#4A6A8A", fontSize: "11px", textDecoration: "none" }}>← Site</Link>
          <form action="/api/admin/logout" method="POST">
            <button type="submit" style={{ background: "none", border: "1px solid #1E3A5A", color: "#4A6A8A", padding: "4px 12px", fontSize: "11px", cursor: "pointer", fontFamily: F }}>Sign out</button>
          </form>
        </div>
      </header>

      <div style={{ padding: "32px", maxWidth: "1200px" }}>
        {/* User header */}
        <div style={{ display: "flex", gap: "24px", alignItems: "flex-start", marginBottom: "32px", flexWrap: "wrap" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: roleColor + "33", border: `2px solid ${roleColor}66`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", color: roleColor, flexShrink: 0 }}>
            {(user.username || user.email)[0].toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "6px" }}>
              <h1 style={{ fontSize: "22px", fontWeight: "bold", margin: 0 }}>{user.username || "(no username)"}</h1>
              <span style={{ background: roleColor + "22", color: roleColor, border: `1px solid ${roleColor}44`, padding: "2px 8px", fontSize: "10px", letterSpacing: "1px" }}>{user.role.replace(/_/g, " ").toUpperCase()}</span>
              {user.is_protected && <span style={{ background: "#E0707022", color: "#E07070", border: "1px solid #E0707044", padding: "2px 8px", fontSize: "10px" }}>🔒 PROTECTED</span>}
              {user.is_banned && <span style={{ background: "#E0707033", color: "#E07070", border: "1px solid #E0707066", padding: "2px 8px", fontSize: "10px" }}>BANNED</span>}
            </div>
            <p style={{ color: "#8BA5B8", fontSize: "13px", margin: "0 0 4px" }}>{user.email}</p>
            <p style={{ color: "#4A6A8A", fontSize: "11px", margin: 0 }}>
              {user.country && `${user.country} · `}
              Joined {new Date(user.created_at).toLocaleDateString()} ·
              {user.last_login ? ` Last seen ${new Date(user.last_login).toLocaleDateString()}` : " Never logged in"}
            </p>
          </div>
          <div style={{ display: "flex", gap: "24px", textAlign: "center" }}>
            {([["total_points","POINTS","#4A90B8"],["trust_level","TRUST LVL","#4AB87A"],["verified_spottings","SPOTTINGS","#B87AE0"]] as [keyof UserProfile, string, string][]).map(([k, lbl, c]) => (
              <div key={k} style={{ background: "#0A1828", border: "1px solid #1E3A5A", padding: "12px 20px" }}>
                <div style={{ fontSize: "24px", fontWeight: "bold", color: c }}>{user[k] as number}</div>
                <div style={{ color: "#4A6A8A", fontSize: "10px", letterSpacing: "1px", marginTop: "4px" }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {user.is_protected && (
          <div style={{ background: "#2A0808", border: "2px solid #E07070", color: "#E07070", padding: "12px 20px", marginBottom: "24px", fontSize: "13px", letterSpacing: "1px" }}>
            ⚠ THIS USER IS PROTECTED — Cannot be deleted or demoted. Role change and ban controls are disabled.
          </div>
        )}

        {msg && <div style={{ background: msgColor + "22", border: `1px solid ${msgColor}66`, color: msgColor, padding: "10px 16px", marginBottom: "20px", fontSize: "12px" }}>{msg}</div>}

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0", borderBottom: "1px solid #1E3A5A", marginBottom: "28px", flexWrap: "wrap" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ padding: "10px 20px", background: "none", border: "none", borderBottom: activeTab === t.id ? "2px solid #4A90B8" : "2px solid transparent", color: activeTab === t.id ? "#E2EEF7" : "#4A6A8A", cursor: "pointer", fontFamily: F, fontSize: "12px", letterSpacing: "0.5px" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── PROFILE TAB ── */}
        {activeTab === "profile" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            {/* Left: Profile edit */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ background: "#0A1828", border: "1px solid #1E3A5A", padding: "24px" }}>
                <p style={{ color: "#4A90B8", fontSize: "10px", letterSpacing: "3px", marginBottom: "20px" }}>PROFILE</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div><label style={label}>USERNAME</label><input value={username} onChange={e => setUsername(e.target.value)} style={inp} /></div>
                  <div><label style={label}>EMAIL</label><input value={email} onChange={e => setEmail(e.target.value)} style={inp} /></div>
                  <div><label style={label}>COUNTRY</label><input value={country} onChange={e => setCountry(e.target.value)} placeholder="e.g. Italy" style={inp} /></div>
                  <div><label style={label}>BIO</label><textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} style={{ ...inp, resize: "vertical" }} /></div>
                </div>
              </div>

              <div style={{ background: "#0A1828", border: "1px solid #1E3A5A", padding: "24px" }}>
                <p style={{ color: "#4A90B8", fontSize: "10px", letterSpacing: "3px", marginBottom: "20px" }}>ROLE & ACCESS</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <label style={label}>ROLE</label>
                    <select value={role} onChange={e => setRole(e.target.value)} style={inp} disabled={user.is_protected}>
                      {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={label}>TRUST LEVEL: {trustLevel}</label>
                    <input type="range" min={1} max={5} value={trustLevel} onChange={e => setTrustLevel(parseInt(e.target.value))} style={{ width: "100%", accentColor: "#4A90B8" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#4A6A8A", fontSize: "10px" }}>
                      {[1,2,3,4,5].map(n => <span key={n}>{n}</span>)}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: "#0A1828", border: "1px solid #1E3A5A", padding: "24px" }}>
                <p style={{ color: "#4A90B8", fontSize: "10px", letterSpacing: "3px", marginBottom: "20px" }}>SUBSCRIPTION</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <label style={label}>TIER</label>
                    <select value={subTier} onChange={e => setSubTier(e.target.value)} style={inp}>
                      <option value="">None</option>
                      <option value="paid_basic">Basic</option>
                      <option value="paid_pro">Pro</option>
                      <option value="paid_elite">Elite</option>
                    </select>
                  </div>
                  <div>
                    <label style={label}>EXPIRES AT</label>
                    <input type="date" value={subExpiry} onChange={e => setSubExpiry(e.target.value)} style={inp} />
                  </div>
                </div>
              </div>

              <button onClick={saveProfile} style={{ background: "#4A90B8", color: "#fff", border: "none", padding: "12px", fontSize: "13px", cursor: "pointer", fontFamily: F, letterSpacing: "1px" }}>
                Save All Changes
              </button>
            </div>

            {/* Right: Ban + Flags */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ background: "#0A1828", border: "1px solid #1E3A5A", padding: "24px" }}>
                <p style={{ color: "#4A90B8", fontSize: "10px", letterSpacing: "3px", marginBottom: "20px" }}>POINTS ADJUSTMENT</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <div style={{ background: "#060D18", border: "1px solid #1E3A5A", padding: "12px 20px", textAlign: "center" }}>
                      <div style={{ fontSize: "20px", fontWeight: "bold", color: "#4A90B8" }}>{user.total_points?.toLocaleString()}</div>
                      <div style={{ color: "#4A6A8A", fontSize: "10px", marginTop: "4px" }}>CURRENT TOTAL</div>
                    </div>
                  </div>
                  <input value={ptAmount} onChange={e => setPtAmount(e.target.value)} type="number" placeholder="Amount" style={inp} />
                  <input value={ptReason} onChange={e => setPtReason(e.target.value)} placeholder="Reason (required)" style={inp} />
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={() => adjustPoints(false)} style={{ flex: 1, background: "#0D2A1A", color: "#4AB87A", border: "1px solid #4AB87A", padding: "10px", fontSize: "12px", cursor: "pointer", fontFamily: F }}>+ Award</button>
                    <button onClick={() => adjustPoints(true)} style={{ flex: 1, background: "#2A0D0D", color: "#E07070", border: "1px solid #8A2A2A", padding: "10px", fontSize: "12px", cursor: "pointer", fontFamily: F }}>− Remove</button>
                  </div>
                </div>
              </div>

              <div style={{ background: user.is_banned ? "#1A0808" : "#0A1828", border: `1px solid ${user.is_banned ? "#8A2A2A" : "#1E3A5A"}`, padding: "24px" }}>
                <p style={{ color: user.is_banned ? "#E07070" : "#4A90B8", fontSize: "10px", letterSpacing: "3px", marginBottom: "20px" }}>
                  BAN CONTROLS {user.is_banned && `· CURRENTLY BANNED`}
                </p>
                {user.is_banned ? (
                  <div>
                    {user.ban_reason && <p style={{ color: "#8BA5B8", fontSize: "12px", marginBottom: "12px" }}>Reason: {user.ban_reason}</p>}
                    {user.ban_expires_at && <p style={{ color: "#4A6A8A", fontSize: "11px", marginBottom: "12px" }}>Expires: {new Date(user.ban_expires_at).toLocaleDateString()}</p>}
                    <button onClick={unbanUser} disabled={user.is_protected} style={{ background: "#0D2A1A", color: "#4AB87A", border: "1px solid #4AB87A", padding: "10px 20px", fontSize: "12px", cursor: user.is_protected ? "not-allowed" : "pointer", fontFamily: F, opacity: user.is_protected ? 0.5 : 1 }}>Unban User</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div>
                      <label style={label}>DURATION</label>
                      <select value={banDuration} onChange={e => setBanDuration(e.target.value)} style={inp}>
                        <option value="1d">1 Day</option>
                        <option value="7d">7 Days</option>
                        <option value="30d">30 Days</option>
                        <option value="permanent">Permanent</option>
                      </select>
                    </div>
                    <div><label style={label}>REASON</label><input value={banReason} onChange={e => setBanReason(e.target.value)} placeholder="Reason for ban" style={inp} /></div>
                    <button onClick={banUser} disabled={user.is_protected} style={{ background: user.is_protected ? "#1A1A1A" : "#2A0D0D", color: "#E07070", border: "1px solid #8A2A2A", padding: "10px", fontSize: "12px", cursor: user.is_protected ? "not-allowed" : "pointer", fontFamily: F, opacity: user.is_protected ? 0.5 : 1 }}>Ban User</button>
                  </div>
                )}
              </div>

              <div style={{ background: "#0A1828", border: "1px solid #1E3A5A", padding: "24px" }}>
                <p style={{ color: "#4A90B8", fontSize: "10px", letterSpacing: "3px", marginBottom: "20px" }}>FLAGS</p>
                {[
                  ["is_verified_identity", "Verified Identity", isVerifiedIdentity, setIsVerifiedIdentity],
                  ["is_known_collector", "Known Collector", isKnownCollector, setIsKnownCollector],
                  ["is_industry_professional", "Industry Professional", isIndustryPro, setIsIndustryPro],
                ].map(([, lbl, val, setter]) => (
                  <label key={lbl as string} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", cursor: "pointer" }}>
                    <input type="checkbox" checked={val as boolean} onChange={e => (setter as (v: boolean) => void)(e.target.checked)} style={{ accentColor: "#4A90B8", width: "16px", height: "16px" }} />
                    <span style={{ fontSize: "13px" }}>{lbl as string}</span>
                  </label>
                ))}
                <div style={{ marginTop: "8px" }}>
                  <label style={label}>INTERNAL NOTES (admin only)</label>
                  <textarea value={internalNotes} onChange={e => setInternalNotes(e.target.value)} rows={3} placeholder="Notes visible only to admins…" style={{ ...inp, resize: "vertical" }} />
                </div>
                <button onClick={saveProfile} style={{ marginTop: "12px", background: "#0D1E36", color: "#4A90B8", border: "1px solid #1E3A5A", padding: "8px 16px", fontSize: "12px", cursor: "pointer", fontFamily: F }}>Save Flags & Notes</button>
              </div>
            </div>
          </div>
        )}

        {/* ── SPOTTINGS TAB ── */}
        {activeTab === "spottings" && (
          <div>
            {spottings.length === 0 ? (
              <p style={{ color: "#4A6A8A", padding: "24px 0" }}>No spottings found for this user.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead><tr>{["CHASSIS","LOCATION","DATE","STATUS",""].map(h2 => <th key={h2} style={th}>{h2}</th>)}</tr></thead>
                <tbody>
                  {spottings.map(s => (
                    <tr key={s.id} style={{ borderBottom: "1px solid #0D1E36" }}>
                      <td style={{ ...td, fontFamily: "monospace" }}>{s.chassis_number || "(none)"}</td>
                      <td style={{ ...td, color: "#8BA5B8" }}>{s.location_name}, {s.country}</td>
                      <td style={{ ...td, color: "#4A6A8A" }}>{new Date(s.spotted_at || "").toLocaleDateString()}</td>
                      <td style={td}>
                        <span style={{ background: s.status === "approved" ? "#0D2A1A" : s.status === "rejected" ? "#2A0D0D" : "#2A1A0D", color: s.status === "approved" ? "#4AB87A" : s.status === "rejected" ? "#E07070" : "#B8944A", padding: "2px 8px", fontSize: "10px", letterSpacing: "1px" }}>{s.status?.toUpperCase()}</span>
                      </td>
                      <td style={td}>
                        {s.status === "pending" && (
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button onClick={() => handleSpotting(s.id, "approved")} style={{ background: "#0D2A1A", color: "#4AB87A", border: "1px solid #4AB87A", padding: "4px 10px", fontSize: "11px", cursor: "pointer", fontFamily: F }}>✓ Approve</button>
                            <button onClick={() => handleSpotting(s.id, "rejected")} style={{ background: "#2A0D0D", color: "#E07070", border: "1px solid #8A2A2A", padding: "4px 10px", fontSize: "11px", cursor: "pointer", fontFamily: F }}>✗ Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── REGISTRY SUBMISSIONS TAB ── */}
        {activeTab === "submissions" && (
          <div>
            {submissions.length === 0 ? (
              <p style={{ color: "#4A6A8A", padding: "24px 0" }}>No registry submissions found.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead><tr>{["CHASSIS","DATE","STATUS",""].map(h2 => <th key={h2} style={th}>{h2}</th>)}</tr></thead>
                <tbody>
                  {submissions.map(s => (
                    <tr key={s.id} style={{ borderBottom: "1px solid #0D1E36" }}>
                      <td style={{ ...td, fontFamily: "monospace" }}>{s.chassis_number}</td>
                      <td style={{ ...td, color: "#4A6A8A" }}>{new Date(s.created_at).toLocaleDateString()}</td>
                      <td style={td}>
                        <span style={{ background: s.status === "approved" ? "#0D2A1A" : s.status === "rejected" ? "#2A0D0D" : "#2A1A0D", color: s.status === "approved" ? "#4AB87A" : s.status === "rejected" ? "#E07070" : "#B8944A", padding: "2px 8px", fontSize: "10px" }}>{s.status?.toUpperCase()}</span>
                      </td>
                      <td style={td}><Link href={`/admin/submission/${s.id}`} style={{ color: "#4A90B8", fontSize: "11px", textDecoration: "none", border: "1px solid #1E3A5A", padding: "4px 10px" }}>Review</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── POINTS HISTORY TAB ── */}
        {activeTab === "points" && (
          <div>
            {pointsHistory.length === 0 ? (
              <p style={{ color: "#4A6A8A", padding: "24px 0" }}>No points history found.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead><tr>{["ACTION","POINTS","AWARDED BY","DATE"].map(h2 => <th key={h2} style={th}>{h2}</th>)}</tr></thead>
                <tbody>
                  {pointsHistory.map(p => (
                    <tr key={p.id} style={{ borderBottom: "1px solid #0D1E36" }}>
                      <td style={{ ...td, fontFamily: "monospace", color: "#4A6A8A" }}>{p.action}</td>
                      <td style={{ ...td, fontWeight: "bold", color: p.points > 0 ? "#4AB87A" : "#E07070" }}>{p.points > 0 ? "+" : ""}{p.points}</td>
                      <td style={{ ...td, color: "#8BA5B8" }}>{p.awarded_by || "system"}</td>
                      <td style={{ ...td, color: "#4A6A8A" }}>{new Date(p.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── AUDIT LOG TAB ── */}
        {activeTab === "audit" && (
          <div>
            {auditLog.length === 0 ? (
              <p style={{ color: "#4A6A8A", padding: "24px 0" }}>No admin actions recorded for this user.</p>
            ) : (
              <div style={{ background: "#0A1828", border: "1px solid #1E3A5A" }}>
                {auditLog.map(e => (
                  <div key={e.id} style={{ display: "flex", gap: "16px", padding: "10px 16px", borderBottom: "1px solid #0D1E36", alignItems: "flex-start", flexWrap: "wrap" }}>
                    <span style={{ color: "#4A6A8A", fontSize: "11px", whiteSpace: "nowrap", minWidth: "140px" }}>{new Date(e.created_at).toLocaleString()}</span>
                    <span style={{ background: (ACTION_COLORS[e.action] || "#8BA5B8") + "22", color: ACTION_COLORS[e.action] || "#8BA5B8", padding: "2px 8px", fontSize: "10px", letterSpacing: "1px" }}>{e.action}</span>
                    <span style={{ color: "#4A6A8A", fontSize: "11px" }}>by {e.admin_email}</span>
                    {e.details && <span style={{ color: "#4A6A8A", fontSize: "10px", fontFamily: "monospace" }}>{JSON.stringify(e.details)}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
