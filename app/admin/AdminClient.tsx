"use client";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";

interface Submission {
  id: string;
  chassis_number: string;
  exterior_color: string;
  original_market: string;
  submitter_email: string;
  status: string;
  created_at: string;
}

interface Claim {
  id: string;
  chassis_number: string;
  user_email: string;
  status: string;
  message: string;
  created_at: string;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  today: number;
  thisWeek: number;
}

function computeStats(submissions: Submission[]): Stats {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekStart = todayStart - 6 * 86400000;
  return {
    total: submissions.length,
    pending: submissions.filter(s => s.status === "pending").length,
    approved: submissions.filter(s => s.status === "approved").length,
    rejected: submissions.filter(s => s.status === "rejected").length,
    today: submissions.filter(s => new Date(s.created_at).getTime() >= todayStart).length,
    thisWeek: submissions.filter(s => new Date(s.created_at).getTime() >= weekStart).length,
  };
}

interface PendingVinService {
  id: string;
  service_name: string;
  country_name: string;
  country_code: string;
  service_url: string;
  description?: string;
  service_type: string;
  is_free: boolean;
  submitted_by?: string;
  is_approved: boolean;
  created_at: string;
}

interface PendingSighting {
  id: string;
  chassis_number: string;
  spotter_email: string;
  spotted_at: string;
  location_name: string;
  country: string;
  photo_url: string;
  notes?: string;
  confidence_score: number;
  status: string;
  created_at: string;
}

interface FlaggedUser {
  id: string;
  user_email: string;
  flagged_by?: string;
  reason?: string;
  flag_count: number;
  is_banned: boolean;
  created_at: string;
}

interface SpotterEvent {
  id: string;
  name: string;
  location_name: string;
  country: string;
  event_date: string;
  organizer_email: string;
  is_approved: boolean;
  created_at: string;
}

interface Make {
  id: string;
  name: string;
  slug: string;
  country: string;
  founded_year: number;
}

interface Model {
  id: string;
  make: string;
  model: string;
  full_model_name: string;
  production_start_year: number;
  production_end_year: number;
  body_style: string;
}

interface SpotterProfile {
  id: string;
  user_email: string;
  username: string;
  country: string;
  trust_level: number;
  total_sightings: number;
  verified_sightings: number;
  is_banned: boolean;
  created_at: string;
}

export default function AdminClient({ submissions, claims }: { submissions: Submission[]; claims: Claim[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tab, setTab] = useState<"submissions" | "claims" | "sightings" | "vin-lookup" | "events" | "makes-models" | "spotters" | "moderation">("submissions");
  const [claimProcessing, setClaimProcessing] = useState<string | null>(null);
  const [claimResults, setClaimResults] = useState<Record<string, string>>({});
  const [storageMsg, setStorageMsg] = useState("");
  const [flaggedUsers, setFlaggedUsers] = useState<FlaggedUser[]>([]);
  const [moderationMsg, setModerationMsg] = useState("");
  const [migrateMsg, setMigrateMsg] = useState("");
  const [pendingSightings, setPendingSightings] = useState<PendingSighting[]>([]);
  const [sightingResults, setSightingResults] = useState<Record<string, string>>({});
  const [pendingVinServices, setPendingVinServices] = useState<PendingVinService[]>([]);
  const [vinServiceResults, setVinServiceResults] = useState<Record<string, boolean>>({});
  const [pendingEvents, setPendingEvents] = useState<SpotterEvent[]>([]);
  const [eventResults, setEventResults] = useState<Record<string, boolean>>({});
  const [makes, setMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [newMake, setNewMake] = useState({ name: "", country: "", founded_year: "" });
  const [newModel, setNewModel] = useState({ make: "", model: "", production_start_year: "", production_end_year: "", body_style: "coupe" });
  const [makeMsg, setMakeMsg] = useState("");
  const [modelMsg, setModelMsg] = useState("");
  const [spotterProfiles, setSpotterProfiles] = useState<SpotterProfile[]>([]);
  const [spotterMsg, setSpotterMsg] = useState("");

  useEffect(() => {
    if (tab === "moderation") {
      fetch("/api/admin/moderation")
        .then(r => r.ok ? r.json() : [])
        .then(setFlaggedUsers)
        .catch(() => {});
    }
    if (tab === "sightings") {
      fetch("/api/sightings?status=pending&limit=100")
        .then(r => r.ok ? r.json() : [])
        .then(setPendingSightings)
        .catch(() => {});
    }
    if (tab === "vin-lookup") {
      fetch("/api/vin-lookup?approved=false")
        .then(r => r.ok ? r.json() : [])
        .then(setPendingVinServices)
        .catch(() => {});
    }
    if (tab === "events") {
      fetch("/api/admin/events")
        .then(r => r.ok ? r.json() : [])
        .then(setPendingEvents)
        .catch(() => {});
    }
    if (tab === "makes-models") {
      Promise.all([
        fetch("/api/admin/makes").then(r => r.ok ? r.json() : []),
        fetch("/api/admin/models").then(r => r.ok ? r.json() : []),
      ]).then(([m, mo]) => { setMakes(m); setModels(mo); });
    }
    if (tab === "spotters") {
      fetch("/api/admin/spotters")
        .then(r => r.ok ? r.json() : [])
        .then(setSpotterProfiles)
        .catch(() => {});
    }
  }, [tab]);

  const stats = useMemo(() => computeStats(submissions), [submissions]);

  const filtered = useMemo(() => {
    return submissions.filter(s => {
      if (statusFilter && s.status !== statusFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        return s.chassis_number?.toLowerCase().includes(q) ||
          s.submitter_email?.toLowerCase().includes(q) ||
          s.original_market?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [submissions, query, statusFilter]);

  const filteredClaims = useMemo(() => {
    return claims.filter(c => {
      if (statusFilter && c.status !== statusFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        return c.chassis_number?.toLowerCase().includes(q) ||
          c.user_email?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [claims, query, statusFilter]);

  async function runMigration() {
    setMigrateMsg("Running migrations...");
    const res = await fetch("/api/admin/migrate", { method: "POST" });
    const data = await res.json();
    if (data.allOk) {
      setMigrateMsg("✓ Migrations applied successfully");
    } else {
      const failed = (data.results || []).filter((r: { ok: boolean; sql: string; error?: string }) => !r.ok);
      if (failed.length > 0) {
        setMigrateMsg(`Some steps had errors (columns may already exist). Check Supabase Studio if needed.`);
      } else {
        setMigrateMsg("Migration complete.");
      }
    }
  }

  async function flagUser(email: string, reason: string) {
    await fetch("/api/admin/moderation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "flag_user", user_email: email, reason, flagged_by: "admin" }),
    });
    setModerationMsg(`Flagged ${email}`);
    fetch("/api/admin/moderation").then(r => r.ok ? r.json() : []).then(setFlaggedUsers);
  }

  async function banUser(email: string) {
    await fetch("/api/admin/moderation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ban_user", user_email: email }),
    });
    setFlaggedUsers(prev => prev.map(u => u.user_email === email ? { ...u, is_banned: true } : u));
    setModerationMsg(`Banned ${email}`);
  }

  async function unbanUser(email: string) {
    await fetch("/api/admin/moderation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "unban_user", user_email: email }),
    });
    setFlaggedUsers(prev => prev.map(u => u.user_email === email ? { ...u, is_banned: false } : u));
    setModerationMsg(`Unbanned ${email}`);
  }

  async function deleteUserSubmissions(email: string) {
    if (!confirm(`Delete ALL submissions from ${email}? This cannot be undone.`)) return;
    const res = await fetch("/api/admin/moderation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_user_submissions", user_email: email }),
    });
    setModerationMsg(res.ok ? `Deleted submissions from ${email}` : "Error deleting submissions");
  }

  async function handleVinService(id: string, approve: boolean) {
    const res = await fetch("/api/vin-lookup", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_approved: approve }),
    });
    if (res.ok) {
      setVinServiceResults(prev => ({ ...prev, [id]: approve }));
    }
  }

  async function handleSighting(id: string, status: "approved" | "rejected") {
    const res = await fetch("/api/sightings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      setSightingResults(prev => ({ ...prev, [id]: status }));
    }
  }

  async function handleEvent(id: string, approve: boolean) {
    const res = await fetch("/api/admin/events", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_approved: approve }),
    });
    if (res.ok) setEventResults(prev => ({ ...prev, [id]: approve }));
  }

  async function saveMake() {
    if (!newMake.name) return;
    const slug = newMake.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const res = await fetch("/api/admin/makes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newMake, slug, founded_year: newMake.founded_year ? parseInt(newMake.founded_year) : null }),
    });
    if (res.ok) {
      setMakeMsg(`✓ Make "${newMake.name}" added`);
      setNewMake({ name: "", country: "", founded_year: "" });
      fetch("/api/admin/makes").then(r => r.ok ? r.json() : []).then(setMakes);
    } else { setMakeMsg("Error saving make"); }
  }

  async function saveModel() {
    if (!newModel.make || !newModel.model) return;
    const full_model_name = `${newModel.make} ${newModel.model}`;
    const res = await fetch("/api/admin/models", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newModel,
        full_model_name,
        production_start_year: newModel.production_start_year ? parseInt(newModel.production_start_year) : null,
        production_end_year: newModel.production_end_year ? parseInt(newModel.production_end_year) : null,
      }),
    });
    if (res.ok) {
      setModelMsg(`✓ Model "${full_model_name}" added — creating forum category…`);
      setNewModel({ make: "", model: "", production_start_year: "", production_end_year: "", body_style: "coupe" });
      fetch("/api/admin/models").then(r => r.ok ? r.json() : []).then(setModels);
      try {
        const forumRes = await fetch("/api/admin/create-forum-category", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ make_name: newModel.make, model_name: newModel.model }),
        });
        const forumData = await forumRes.json();
        if (forumRes.ok) {
          setModelMsg(`✓ Model "${full_model_name}" added + Forum category created`);
        } else {
          setModelMsg(`✓ Model "${full_model_name}" added (forum: ${forumData.error ?? "failed"})`);
        }
      } catch {
        setModelMsg(`✓ Model "${full_model_name}" added (forum category skipped)`);
      }
    } else { setModelMsg("Error saving model"); }
  }

  async function updateSpotterTrust(id: string, trust_level: number) {
    const res = await fetch("/api/admin/spotters", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, trust_level }),
    });
    if (res.ok) {
      setSpotterProfiles(prev => prev.map(p => p.id === id ? { ...p, trust_level } : p));
      setSpotterMsg(`Trust level updated`);
    }
  }

  async function toggleSpotterBan(id: string, is_banned: boolean) {
    const res = await fetch("/api/admin/spotters", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_banned }),
    });
    if (res.ok) {
      setSpotterProfiles(prev => prev.map(p => p.id === id ? { ...p, is_banned } : p));
      setSpotterMsg(is_banned ? "Spotter banned" : "Spotter unbanned");
    }
  }

  async function initStorage() {
    setStorageMsg("Creating storage bucket...");
    const res = await fetch("/api/admin/init-storage", { method: "POST" });
    const data = await res.json();
    setStorageMsg(res.ok ? `Storage setup: ${JSON.stringify(data)}` : `Error: ${JSON.stringify(data)}`);
  }

  async function handleClaim(id: string, action: "approved" | "rejected") {
    setClaimProcessing(id);
    try {
      const res = await fetch("/api/admin/claims", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: action }),
      });
      if (res.ok) {
        setClaimResults(prev => ({ ...prev, [id]: action }));
      } else {
        setClaimResults(prev => ({ ...prev, [id]: "error" }));
      }
    } catch {
      setClaimResults(prev => ({ ...prev, [id]: "error" }));
    }
    setClaimProcessing(null);
  }

  const tabStyle = (active: boolean) => ({
    padding: "10px 20px",
    background: "none",
    border: "none",
    borderBottom: active ? "2px solid #4A90B8" : "2px solid transparent",
    color: active ? "#E2EEF7" : "#4A6A8A",
    fontSize: "12px",
    letterSpacing: "2px",
    cursor: "pointer",
    fontFamily: "Verdana, sans-serif",
  });

  return (
    <main style={{ background: "#080F1A", color: "#E2EEF7", fontFamily: "Verdana, sans-serif", minHeight: "100vh" }}>
      <div style={{ background: "#060D18", borderBottom: "1px solid #2A0D0D", padding: "10px 40px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <span style={{ color: "#E07070", fontSize: "11px", letterSpacing: "2px", fontFamily: "Verdana, sans-serif" }}>ADMIN PANEL</span>
        <Link href="/admin/instagram-queue" style={{ color: "#8BA5B8", fontSize: "12px", textDecoration: "none", border: "1px solid #1E3A5A", padding: "4px 10px", fontFamily: "Verdana, sans-serif" }}>
          Instagram Queue
        </Link>
        <form action="/api/admin/logout" method="POST" style={{ marginLeft: "auto" }}>
          <button type="submit" style={{ background: "none", border: "1px solid #1E3A5A", color: "#4A6A8A", padding: "4px 12px", fontSize: "12px", cursor: "pointer", fontFamily: "Verdana, sans-serif" }}>
            Admin sign out
          </button>
        </form>
      </div>

      <div className="vv-admin-container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 40px 0" }}>
        {/* Stats */}
        <div style={{ marginBottom: "32px" }}>
          <p style={{ color: "#4A90B8", letterSpacing: "3px", fontSize: "11px", marginBottom: "20px" }}>OVERVIEW</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "16px" }}>
            {[
              { label: "Today", value: stats.today, color: "#4A90B8" },
              { label: "This Week", value: stats.thisWeek, color: "#4A90B8" },
              { label: "All Time", value: stats.total, color: "#4A90B8" },
              { label: "Pending", value: stats.pending, color: "#B8944A" },
              { label: "Approved", value: stats.approved, color: "#4AB87A" },
              { label: "Claims Pending", value: claims.filter(c => c.status === "pending").length, color: "#B8944A" },
            ].map(s => (
              <div key={s.label} style={{ background: "#0A1828", border: "1px solid #1E3A5A", padding: "16px 20px", textAlign: "center" }}>
                <div style={{ fontSize: "28px", fontWeight: "bold", color: s.color }}>{s.value}</div>
                <div style={{ color: "#8BA5B8", fontSize: "11px", letterSpacing: "1px", marginTop: "4px" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Storage setup */}
        <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <button
            onClick={initStorage}
            style={{ background: "#0A1828", border: "1px solid #1E3A5A", color: "#8BA5B8", padding: "8px 16px", fontSize: "12px", cursor: "pointer", fontFamily: "Verdana, sans-serif", letterSpacing: "1px" }}
          >
            ⚙ Init Storage Bucket
          </button>
          {storageMsg && <span style={{ color: "#4A6A8A", fontSize: "12px" }}>{storageMsg}</span>}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #1E3A5A", marginBottom: "24px", flexWrap: "wrap" }}>
          <button style={tabStyle(tab === "submissions")} onClick={() => setTab("submissions")}>
            SUBMISSIONS ({submissions.length})
          </button>
          <button style={tabStyle(tab === "claims")} onClick={() => setTab("claims")}>
            OWNERSHIP CLAIMS ({claims.filter(c => c.status === "pending").length} pending)
          </button>
          <button style={tabStyle(tab === "sightings")} onClick={() => setTab("sightings")}>
            SPOTTINGS
          </button>
          <button style={tabStyle(tab === "vin-lookup")} onClick={() => setTab("vin-lookup")}>
            VIN LOOKUP
          </button>
          <button style={tabStyle(tab === "events")} onClick={() => setTab("events")}>
            EVENTS
          </button>
          <button style={tabStyle(tab === "makes-models")} onClick={() => setTab("makes-models")}>
            MAKES &amp; MODELS
          </button>
          <button style={tabStyle(tab === "spotters")} onClick={() => setTab("spotters")}>
            SPOTTERS
          </button>
          <button style={tabStyle(tab === "moderation")} onClick={() => setTab("moderation")}>
            MODERATION
          </button>
        </div>

        {/* Search and filter */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap", alignItems: "center" }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={tab === "submissions" ? "Search chassis, email, market..." : "Search chassis or email..."}
            style={{ background: "#0D1E36", border: "1px solid #1E3A5A", color: "#E2EEF7", padding: "10px 16px", fontSize: "13px", width: "280px", maxWidth: "100%", fontFamily: "Verdana, sans-serif", outline: "none" }}
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ background: "#0D1E36", border: "1px solid #1E3A5A", color: "#8BA5B8", padding: "10px 16px", fontSize: "13px", fontFamily: "Verdana, sans-serif" }}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <span style={{ color: "#4A6A8A", fontSize: "12px", marginLeft: "auto" }}>
            {tab === "submissions" ? `${filtered.length} of ${submissions.length}` : `${filteredClaims.length} of ${claims.length}`}
          </span>
        </div>

        {/* Submissions tab */}
        {tab === "submissions" && (
          <>
            <p style={{ color: "#4A90B8", letterSpacing: "3px", fontSize: "11px", marginBottom: "16px" }}>SUBMISSIONS</p>
            {submissions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px", color: "#4A6A8A" }}>
                <p>No submissions yet.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #1E3A5A", color: "#4A90B8", fontSize: "11px", letterSpacing: "2px", textAlign: "left" }}>
                      <th style={{ padding: "14px 12px" }}>CHASSIS</th>
                      <th style={{ padding: "14px 12px" }}>COLOR</th>
                      <th style={{ padding: "14px 12px" }}>MARKET</th>
                      <th style={{ padding: "14px 12px" }}>SUBMITTED</th>
                      <th style={{ padding: "14px 12px" }}>STATUS</th>
                      <th style={{ padding: "14px 12px" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(s => (
                      <tr key={s.id} style={{ borderBottom: "1px solid #0D1E36" }}>
                        <td style={{ padding: "14px 12px", fontFamily: "monospace", fontSize: "13px" }}>{s.chassis_number}</td>
                        <td style={{ padding: "14px 12px", color: "#8BA5B8", fontSize: "13px" }}>{s.exterior_color || "—"}</td>
                        <td style={{ padding: "14px 12px", color: "#8BA5B8", fontSize: "13px" }}>{s.original_market || "—"}</td>
                        <td style={{ padding: "14px 12px", color: "#8BA5B8", fontSize: "13px" }}>{new Date(s.created_at).toLocaleDateString()}</td>
                        <td style={{ padding: "14px 12px" }}>
                          <span style={{
                            background: s.status === "approved" ? "#0D2A1A" : s.status === "rejected" ? "#2A0D0D" : "#2A1A0D",
                            color: s.status === "approved" ? "#4AB87A" : s.status === "rejected" ? "#E07070" : "#B8944A",
                            padding: "4px 10px", fontSize: "11px", letterSpacing: "1px",
                          }}>{s.status?.toUpperCase()}</span>
                        </td>
                        <td style={{ padding: "14px 12px", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                          <Link href={`/admin/submission/${s.id}`} style={{ color: "#4A90B8", fontSize: "12px", textDecoration: "none", border: "1px solid #1E3A5A", padding: "4px 10px" }}>
                            Review
                          </Link>
                          {s.submitter_email && (
                            <button
                              onClick={() => {
                                const reason = prompt(`Flag reason for ${s.submitter_email}:`) || "Flagged by admin";
                                flagUser(s.submitter_email, reason);
                              }}
                              style={{ background: "#2A1A0D", color: "#E0B87A", border: "1px solid #8A5A2A", padding: "4px 10px", fontSize: "11px", cursor: "pointer", fontFamily: "Verdana, sans-serif" }}
                            >
                              Flag User
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Claims tab */}
        {tab === "claims" && (
          <>
            <p style={{ color: "#4A90B8", letterSpacing: "3px", fontSize: "11px", marginBottom: "16px" }}>OWNERSHIP CLAIMS</p>
            {claims.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px", color: "#4A6A8A" }}>
                <p>No ownership claims yet.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {filteredClaims.map(c => {
                  const result = claimResults[c.id];
                  const effectiveStatus = result || c.status;
                  return (
                    <div key={c.id} style={{ background: "#0A1828", border: "1px solid #1E3A5A", padding: "20px 24px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "12px" }}>
                        <div>
                          <Link href={`/ferrari/288-gto/${c.chassis_number}`} style={{ fontFamily: "monospace", fontSize: "15px", color: "#4A90B8", textDecoration: "none", letterSpacing: "1px" }}>
                            {c.chassis_number}
                          </Link>
                          <p style={{ color: "#8BA5B8", fontSize: "13px", marginTop: "4px" }}>{c.user_email}</p>
                        </div>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{
                            background: effectiveStatus === "approved" ? "#0D2A1A" : effectiveStatus === "rejected" ? "#2A0D0D" : "#2A1A0D",
                            color: effectiveStatus === "approved" ? "#4AB87A" : effectiveStatus === "rejected" ? "#E07070" : "#B8944A",
                            padding: "4px 12px", fontSize: "11px", letterSpacing: "1px",
                          }}>{effectiveStatus.toUpperCase()}</span>
                          <span style={{ color: "#4A6A8A", fontSize: "12px" }}>{new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {c.message && (
                        <p style={{ color: "#8BA5B8", fontSize: "13px", lineHeight: "1.6", background: "#080F1A", padding: "12px 16px", border: "1px solid #0D1E36", marginBottom: "12px" }}>
                          {c.message}
                        </p>
                      )}
                      {effectiveStatus === "pending" && (
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            disabled={claimProcessing === c.id}
                            onClick={() => handleClaim(c.id, "approved")}
                            style={{ background: "#0D2A1A", color: "#4AB87A", border: "1px solid #4AB87A", padding: "8px 20px", fontSize: "12px", letterSpacing: "1px", cursor: "pointer", fontFamily: "Verdana, sans-serif" }}
                          >
                            ✓ Approve
                          </button>
                          <button
                            disabled={claimProcessing === c.id}
                            onClick={() => handleClaim(c.id, "rejected")}
                            style={{ background: "#2A0D0D", color: "#E07070", border: "1px solid #E07070", padding: "8px 20px", fontSize: "12px", letterSpacing: "1px", cursor: "pointer", fontFamily: "Verdana, sans-serif" }}
                          >
                            ✗ Reject
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Sightings tab */}
        {tab === "sightings" && (
          <>
            <p style={{ color: "#4A90B8", letterSpacing: "3px", fontSize: "11px", marginBottom: "16px" }}>PENDING SPOTTINGS</p>
            {pendingSightings.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px", color: "#4A6A8A" }}>
                <p>No pending spottings.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {pendingSightings.map(s => {
                  const result = sightingResults[s.id];
                  const effectiveStatus = result || s.status;
                  return (
                    <div key={s.id} style={{ background: "#0A1828", border: "1px solid #1E3A5A", padding: "20px 24px" }}>
                      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                        {s.photo_url && (
                          <img src={s.photo_url} alt="spotting" style={{ width: "100px", height: "75px", objectFit: "cover", flexShrink: 0, border: "1px solid #1E3A5A" }} />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
                            <span style={{ fontFamily: "monospace", fontSize: "14px", color: "#4A90B8", letterSpacing: "1px" }}>{s.chassis_number}</span>
                            <span style={{ background: "#2A1A0D", color: "#B8944A", padding: "3px 10px", fontSize: "11px", letterSpacing: "1px" }}>
                              SCORE: {s.confidence_score}
                            </span>
                          </div>
                          <p style={{ fontSize: "13px", marginBottom: "4px" }}>{s.location_name}, {s.country}</p>
                          <p style={{ color: "#4A6A8A", fontSize: "12px", marginBottom: "4px" }}>
                            by {s.spotter_email} · {new Date(s.spotted_at).toLocaleDateString("en-GB")}
                          </p>
                          {s.notes && <p style={{ color: "#8BA5B8", fontSize: "12px", lineHeight: "1.5" }}>{s.notes}</p>}
                          {effectiveStatus === "pending" && (
                            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                              <button
                                onClick={() => handleSighting(s.id, "approved")}
                                style={{ background: "#0D2A1A", color: "#4AB87A", border: "1px solid #4AB87A", padding: "6px 16px", fontSize: "11px", letterSpacing: "1px", cursor: "pointer", fontFamily: "Verdana, sans-serif" }}
                              >
                                ✓ Approve
                              </button>
                              <button
                                onClick={() => handleSighting(s.id, "rejected")}
                                style={{ background: "#2A0D0D", color: "#E07070", border: "1px solid #E07070", padding: "6px 16px", fontSize: "11px", letterSpacing: "1px", cursor: "pointer", fontFamily: "Verdana, sans-serif" }}
                              >
                                ✗ Reject
                              </button>
                            </div>
                          )}
                          {effectiveStatus !== "pending" && (
                            <span style={{
                              display: "inline-block", marginTop: "12px",
                              background: effectiveStatus === "approved" ? "#0D2A1A" : "#2A0D0D",
                              color: effectiveStatus === "approved" ? "#4AB87A" : "#E07070",
                              padding: "4px 12px", fontSize: "11px", letterSpacing: "1px",
                            }}>{effectiveStatus.toUpperCase()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* VIN Lookup tab */}
        {tab === "vin-lookup" && (
          <>
            <p style={{ color: "#4A90B8", letterSpacing: "3px", fontSize: "11px", marginBottom: "16px" }}>PENDING VIN LOOKUP SUBMISSIONS</p>
            {pendingVinServices.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px", color: "#4A6A8A" }}>
                <p>No pending VIN lookup submissions.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {pendingVinServices.map(s => {
                  const result = vinServiceResults[s.id];
                  const processed = result !== undefined;
                  return (
                    <div key={s.id} style={{ background: "#0A1828", border: "1px solid #1E3A5A", padding: "20px 24px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
                        <div>
                          <span style={{ fontFamily: "monospace", fontSize: "13px", color: "#4A90B8", marginRight: "12px" }}>{s.country_code}</span>
                          <span style={{ fontSize: "14px", fontWeight: "bold" }}>{s.service_name}</span>
                        </div>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <span style={{ background: "#0D1E36", color: "#4A6A8A", padding: "3px 10px", fontSize: "11px" }}>{s.service_type}</span>
                          <span style={{ background: s.is_free ? "#0D2A1A" : "#0D1E36", color: s.is_free ? "#4AB87A" : "#4A6A8A", padding: "3px 10px", fontSize: "11px" }}>{s.is_free ? "FREE" : "PAID"}</span>
                        </div>
                      </div>
                      <p style={{ color: "#8BA5B8", fontSize: "13px", marginBottom: "4px" }}>{s.country_name}</p>
                      <a href={s.service_url} target="_blank" rel="noopener noreferrer" style={{ color: "#4A90B8", fontSize: "12px", marginBottom: "8px", display: "block" }}>{s.service_url}</a>
                      {s.description && <p style={{ color: "#4A6A8A", fontSize: "12px", marginBottom: "8px", lineHeight: "1.5" }}>{s.description}</p>}
                      {s.submitted_by && <p style={{ color: "#4A6A8A", fontSize: "11px", marginBottom: "12px" }}>Submitted by: {s.submitted_by}</p>}
                      {!processed ? (
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => handleVinService(s.id, true)}
                            style={{ background: "#0D2A1A", color: "#4AB87A", border: "1px solid #4AB87A", padding: "6px 16px", fontSize: "11px", letterSpacing: "1px", cursor: "pointer", fontFamily: "Verdana, sans-serif" }}
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => handleVinService(s.id, false)}
                            style={{ background: "#2A0D0D", color: "#E07070", border: "1px solid #E07070", padding: "6px 16px", fontSize: "11px", letterSpacing: "1px", cursor: "pointer", fontFamily: "Verdana, sans-serif" }}
                          >
                            ✗ Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{
                          display: "inline-block",
                          background: result ? "#0D2A1A" : "#2A0D0D",
                          color: result ? "#4AB87A" : "#E07070",
                          padding: "4px 12px", fontSize: "11px", letterSpacing: "1px",
                        }}>{result ? "APPROVED" : "REJECTED"}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Events tab */}
        {tab === "events" && (
          <>
            <p style={{ color: "#4A90B8", letterSpacing: "3px", fontSize: "11px", marginBottom: "16px" }}>PENDING EVENTS</p>
            {pendingEvents.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px", color: "#4A6A8A" }}><p>No pending events.</p></div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {pendingEvents.map(ev => {
                  const result = eventResults[ev.id];
                  return (
                    <div key={ev.id} style={{ background: "#0A1828", border: "1px solid #1E3A5A", padding: "20px 24px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
                        <div>
                          <p style={{ fontSize: "15px", fontWeight: "bold", marginBottom: "4px" }}>{ev.name}</p>
                          <p style={{ color: "#8BA5B8", fontSize: "13px" }}>{ev.location_name}, {ev.country}</p>
                          <p style={{ color: "#4A6A8A", fontSize: "12px" }}>{ev.event_date} · {ev.organizer_email}</p>
                        </div>
                        {result !== undefined ? (
                          <span style={{ background: result ? "#0D2A1A" : "#2A0D0D", color: result ? "#4AB87A" : "#E07070", padding: "4px 12px", fontSize: "11px", letterSpacing: "1px" }}>
                            {result ? "APPROVED" : "REJECTED"}
                          </span>
                        ) : (
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button onClick={() => handleEvent(ev.id, true)} style={{ background: "#0D2A1A", color: "#4AB87A", border: "1px solid #4AB87A", padding: "6px 16px", fontSize: "11px", cursor: "pointer", fontFamily: "Verdana, sans-serif" }}>✓ Approve</button>
                            <button onClick={() => handleEvent(ev.id, false)} style={{ background: "#2A0D0D", color: "#E07070", border: "1px solid #E07070", padding: "6px 16px", fontSize: "11px", cursor: "pointer", fontFamily: "Verdana, sans-serif" }}>✗ Reject</button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Makes & Models tab */}
        {tab === "makes-models" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", marginBottom: "40px" }}>
              {/* Add Make */}
              <div>
                <p style={{ color: "#4A90B8", letterSpacing: "3px", fontSize: "11px", marginBottom: "16px" }}>ADD MAKE</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[["Name", "name", "Ferrari"], ["Country", "country", "Italy"], ["Founded Year", "founded_year", "1939"]].map(([label, key, ph]) => (
                    <div key={key}>
                      <label style={{ display: "block", color: "#8BA5B8", fontSize: "11px", letterSpacing: "2px", marginBottom: "6px" }}>{label}</label>
                      <input value={(newMake as Record<string, string>)[key]} onChange={e => setNewMake(m => ({ ...m, [key]: e.target.value }))} placeholder={ph} style={{ width: "100%", background: "#0D1E36", border: "1px solid #1E3A5A", color: "#E2EEF7", padding: "10px 14px", fontSize: "13px", fontFamily: "Verdana, sans-serif", boxSizing: "border-box" }} />
                    </div>
                  ))}
                  {newMake.name && <p style={{ color: "#4A6A8A", fontSize: "11px" }}>Slug: {newMake.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}</p>}
                  {makeMsg && <p style={{ color: "#4AB87A", fontSize: "12px" }}>{makeMsg}</p>}
                  <button onClick={saveMake} style={{ background: "#4A90B8", color: "#fff", border: "none", padding: "10px 20px", fontSize: "12px", cursor: "pointer", fontFamily: "Verdana, sans-serif", letterSpacing: "1px", alignSelf: "flex-start" }}>Save Make</button>
                </div>
              </div>
              {/* Add Model */}
              <div>
                <p style={{ color: "#4A90B8", letterSpacing: "3px", fontSize: "11px", marginBottom: "16px" }}>ADD MODEL</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[["Make", "make", "Ferrari"], ["Model Name", "model", "288 GTO"], ["Production Start", "production_start_year", "1984"], ["Production End", "production_end_year", "1985"]].map(([label, key, ph]) => (
                    <div key={key}>
                      <label style={{ display: "block", color: "#8BA5B8", fontSize: "11px", letterSpacing: "2px", marginBottom: "6px" }}>{label}</label>
                      <input value={(newModel as Record<string, string>)[key]} onChange={e => setNewModel(m => ({ ...m, [key]: e.target.value }))} placeholder={ph} style={{ width: "100%", background: "#0D1E36", border: "1px solid #1E3A5A", color: "#E2EEF7", padding: "10px 14px", fontSize: "13px", fontFamily: "Verdana, sans-serif", boxSizing: "border-box" }} />
                    </div>
                  ))}
                  <div>
                    <label style={{ display: "block", color: "#8BA5B8", fontSize: "11px", letterSpacing: "2px", marginBottom: "6px" }}>BODY STYLE</label>
                    <select value={newModel.body_style} onChange={e => setNewModel(m => ({ ...m, body_style: e.target.value }))} style={{ width: "100%", background: "#0D1E36", border: "1px solid #1E3A5A", color: "#E2EEF7", padding: "10px 14px", fontSize: "13px", fontFamily: "Verdana, sans-serif" }}>
                      {["coupe", "convertible", "sedan", "suv", "roadster", "berlinetta"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  {newModel.make && newModel.model && <p style={{ color: "#4A6A8A", fontSize: "11px" }}>Full name: {newModel.make} {newModel.model}</p>}
                  {modelMsg && <p style={{ color: "#4AB87A", fontSize: "12px" }}>{modelMsg}</p>}
                  <button onClick={saveModel} style={{ background: "#4A90B8", color: "#fff", border: "none", padding: "10px 20px", fontSize: "12px", cursor: "pointer", fontFamily: "Verdana, sans-serif", letterSpacing: "1px", alignSelf: "flex-start" }}>Save Model</button>
                </div>
              </div>
            </div>
            {/* Makes list */}
            <p style={{ color: "#4A90B8", letterSpacing: "3px", fontSize: "11px", marginBottom: "12px" }}>ALL MAKES ({makes.length})</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "32px" }}>
              {makes.map(m => (
                <span key={m.id} style={{ background: "#0A1828", border: "1px solid #1E3A5A", padding: "6px 14px", fontSize: "12px", color: "#8BA5B8" }}>{m.name} <span style={{ color: "#4A6A8A", fontSize: "10px" }}>/{m.slug}</span></span>
              ))}
            </div>
            {/* Models list */}
            <p style={{ color: "#4A90B8", letterSpacing: "3px", fontSize: "11px", marginBottom: "12px" }}>ALL MODELS ({models.length})</p>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "500px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1E3A5A", color: "#4A90B8", fontSize: "11px", letterSpacing: "2px" }}>
                    {["MAKE", "MODEL", "YEARS", "BODY"].map(h => <th key={h} style={{ padding: "10px 12px", textAlign: "left" }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {models.map(m => (
                    <tr key={m.id} style={{ borderBottom: "1px solid #0D1E36" }}>
                      <td style={{ padding: "10px 12px", color: "#8BA5B8", fontSize: "13px" }}>{m.make}</td>
                      <td style={{ padding: "10px 12px", fontSize: "13px" }}>{m.model}</td>
                      <td style={{ padding: "10px 12px", color: "#4A6A8A", fontSize: "12px" }}>{m.production_start_year}{m.production_end_year ? `–${m.production_end_year}` : "–"}</td>
                      <td style={{ padding: "10px 12px", color: "#4A6A8A", fontSize: "12px" }}>{m.body_style}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Spotters tab */}
        {tab === "spotters" && (
          <>
            <p style={{ color: "#4A90B8", letterSpacing: "3px", fontSize: "11px", marginBottom: "16px" }}>SPOTTER PROFILES ({spotterProfiles.length})</p>
            {spotterMsg && <div style={{ background: "#0A1828", border: "1px solid #4A90B8", color: "#4A90B8", padding: "10px 16px", fontSize: "13px", marginBottom: "16px" }}>{spotterMsg}</div>}
            {spotterProfiles.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px", color: "#4A6A8A" }}><p>No spotter profiles yet.</p></div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "#1E3A5A" }}>
                {spotterProfiles.map(p => (
                  <div key={p.id} style={{ background: "#080F1A", padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <p style={{ fontWeight: "bold", fontSize: "14px", marginBottom: "2px" }}>{p.username}</p>
                      <p style={{ color: "#4A6A8A", fontSize: "12px" }}>{p.user_email}{p.country ? ` · ${p.country}` : ""}</p>
                      <p style={{ color: "#4A6A8A", fontSize: "11px" }}>{p.verified_sightings} verified · {p.total_sightings} total · {new Date(p.created_at).toLocaleDateString()}</p>
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ color: "#8BA5B8", fontSize: "11px" }}>Trust:</span>
                      <select value={p.trust_level} onChange={e => updateSpotterTrust(p.id, parseInt(e.target.value))} style={{ background: "#0D1E36", border: "1px solid #1E3A5A", color: "#E2EEF7", padding: "4px 10px", fontSize: "12px", fontFamily: "Verdana, sans-serif", cursor: "pointer" }}>
                        <option value={1}>1 — New</option>
                        <option value={2}>2 — Regular</option>
                        <option value={3}>3 — Trusted</option>
                        <option value={4}>4 — Expert</option>
                      </select>
                      {p.is_banned ? (
                        <button onClick={() => toggleSpotterBan(p.id, false)} style={{ background: "#0D2A1A", color: "#4AB87A", border: "1px solid #4AB87A", padding: "5px 14px", fontSize: "11px", cursor: "pointer", fontFamily: "Verdana, sans-serif" }}>Unban</button>
                      ) : (
                        <button onClick={() => toggleSpotterBan(p.id, true)} style={{ background: "#2A0D0D", color: "#E07070", border: "1px solid #E07070", padding: "5px 14px", fontSize: "11px", cursor: "pointer", fontFamily: "Verdana, sans-serif" }}>Ban</button>
                      )}
                      {p.is_banned && <span style={{ background: "#2A0D0D", color: "#E07070", padding: "3px 10px", fontSize: "10px", letterSpacing: "1px" }}>BANNED</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Moderation tab */}
        {tab === "moderation" && (
          <>
            <div style={{ marginBottom: "24px" }}>
              <p style={{ color: "#4A90B8", letterSpacing: "3px", fontSize: "11px", marginBottom: "16px" }}>DATABASE MIGRATIONS</p>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "24px" }}>
                <button
                  onClick={runMigration}
                  style={{ background: "#0A1828", border: "1px solid #4A90B8", color: "#4A90B8", padding: "8px 16px", fontSize: "12px", cursor: "pointer", fontFamily: "Verdana, sans-serif", letterSpacing: "1px" }}
                >
                  ⚙ Run DB Migrations (Special Flags + Moderation Tables)
                </button>
                {migrateMsg && <span style={{ color: "#4A6A8A", fontSize: "12px" }}>{migrateMsg}</span>}
              </div>
              <p style={{ color: "#4A6A8A", fontSize: "11px" }}>
                Run this once after deployment to add the new columns to the database. Safe to run multiple times (uses IF NOT EXISTS).
              </p>
            </div>

            <p style={{ color: "#4A90B8", letterSpacing: "3px", fontSize: "11px", marginBottom: "16px", borderTop: "1px solid #1E3A5A", paddingTop: "24px" }}>FLAGGED USERS</p>
            {moderationMsg && (
              <div style={{ background: "#0A1828", border: "1px solid #4A90B8", color: "#4A90B8", padding: "10px 16px", fontSize: "13px", marginBottom: "16px" }}>
                {moderationMsg}
              </div>
            )}
            {flaggedUsers.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px", color: "#4A6A8A" }}>
                <p>No flagged users. Flag users from the Submissions tab.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {flaggedUsers.map(u => (
                  <div key={u.id} style={{ background: "#0A1828", border: `1px solid ${u.is_banned ? "#8A2A2A" : "#1E3A5A"}`, padding: "20px 24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "12px" }}>
                      <div>
                        <p style={{ fontFamily: "monospace", fontSize: "14px", color: "#E2EEF7", marginBottom: "4px" }}>{u.user_email}</p>
                        {u.reason && <p style={{ color: "#4A6A8A", fontSize: "12px" }}>Reason: {u.reason}</p>}
                        {u.flagged_by && <p style={{ color: "#4A6A8A", fontSize: "12px" }}>Flagged by: {u.flagged_by}</p>}
                      </div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ background: u.is_banned ? "#2A0D0D" : "#2A1A0D", color: u.is_banned ? "#E07070" : "#B8944A", padding: "4px 12px", fontSize: "11px", letterSpacing: "1px" }}>
                          {u.is_banned ? "BANNED" : `FLAGS: ${u.flag_count}`}
                        </span>
                        {u.is_banned ? (
                          <button
                            onClick={() => unbanUser(u.user_email)}
                            style={{ background: "#0D2A1A", color: "#4AB87A", border: "1px solid #4AB87A", padding: "6px 16px", fontSize: "11px", cursor: "pointer", fontFamily: "Verdana, sans-serif" }}
                          >
                            Unban
                          </button>
                        ) : (
                          <button
                            onClick={() => banUser(u.user_email)}
                            style={{ background: "#2A0D0D", color: "#E07070", border: "1px solid #E07070", padding: "6px 16px", fontSize: "11px", cursor: "pointer", fontFamily: "Verdana, sans-serif" }}
                          >
                            Ban User
                          </button>
                        )}
                        <button
                          onClick={() => deleteUserSubmissions(u.user_email)}
                          style={{ background: "#2A0D0D", color: "#E07070", border: "1px solid #8A2A2A", padding: "6px 16px", fontSize: "11px", cursor: "pointer", fontFamily: "Verdana, sans-serif" }}
                        >
                          Delete All Submissions
                        </button>
                      </div>
                    </div>
                    <p style={{ color: "#4A6A8A", fontSize: "12px" }}>
                      Flagged {new Date(u.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <footer style={{ borderTop: "1px solid #1E3A5A", padding: "28px 40px", textAlign: "center", color: "#4A6A8A", fontSize: "13px", marginTop: "60px" }}>
        © 2026 <span style={{ color: "#4A90B8" }}>Vin</span>Vault — Curated Automotive Registry
      </footer>
    </main>
  );
}
