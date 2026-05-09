"use client";
import Link from "next/link";
import { useState, useEffect, useMemo, useCallback } from "react";
import { VERSION } from "@/app/version";

// ─── types ───────────────────────────────────────────────────────────────────
interface Submission { id: string; chassis_number: string; exterior_color: string; original_market: string; submitter_email: string; status: string; created_at: string; }
interface Claim { id: string; chassis_number: string; user_email: string; status: string; message: string; created_at: string; }
interface UserProfile { id: string; email: string; username: string | null; role: string; is_protected: boolean; trust_level: number; total_points: number; verified_spottings: number; country: string | null; is_banned: boolean; ban_reason: string | null; subscription_tier: string | null; created_at: string; last_login: string | null; }
interface AuditEntry { id: string; admin_email: string; action: string; target_user_email: string | null; details: Record<string, unknown> | null; created_at: string; }
interface ModelSuggestion { make: string; model: string; count: number; firstSpotter: string; firstDate: string; ids: string[]; }
interface Make { id: string; name: string; slug: string; country: string; founded_year: number; }
interface Model { id: string; make: string; model: string; full_model_name: string; production_start_year: number; production_end_year: number; body_style: string; }
interface Submodel { id: string; model_id: string; name: string; slug: string; production_start_year: number | null; production_end_year: number | null; notes: string | null; }
interface PendingSighting { id: string; chassis_number: string; spotter_email: string; spotted_at: string; location_name: string; country: string; photo_url: string; confidence_score: number; status: string; unverified_make?: string; unverified_model?: string; }
interface SpotterEvent { id: string; name: string; location_name: string; country: string; event_date: string; organizer_email: string; is_approved: boolean; created_at: string; }
interface PendingVinService { id: string; service_name: string; country_name: string; service_url: string; is_free: boolean; is_approved: boolean; created_at: string; }
interface DashStats { totalUsers: number; bannedUsers: number; totalSightings: number; pendingSightings: number; totalSubmissions: number; pendingSubmissions: number; approvedSubmissions: number; totalSpotters: number; modelSuggestions: number; recentAudit: AuditEntry[]; }

type Tab = "dashboard" | "users" | "roles" | "registry" | "spottings" | "brands-models" | "points" | "audit-log" | "events" | "vin-services" | "subscriptions" | "settings";

// ─── constants ────────────────────────────────────────────────────────────────
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

// ─── nav items ────────────────────────────────────────────────────────────────
const NAV: { id: Tab; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "◈" },
  { id: "users", label: "Users", icon: "◉" },
  { id: "roles", label: "Roles & Permissions", icon: "◆" },
  { id: "registry", label: "Registry", icon: "◇" },
  { id: "spottings", label: "Spottings", icon: "⊕" },
  { id: "brands-models", label: "Brands & Models", icon: "◎" },
  { id: "points", label: "Points & Leaderboard", icon: "★" },
  { id: "audit-log", label: "Audit Log", icon: "≡" },
  { id: "events", label: "Events", icon: "◷" },
  { id: "vin-services", label: "VIN Services", icon: "⊞" },
  { id: "subscriptions", label: "Subscriptions", icon: "◈" },
  { id: "settings", label: "Settings", icon: "⚙" },
];

// ─── helpers ──────────────────────────────────────────────────────────────────
const F = "Verdana, sans-serif";
const bg = (c: string) => ({ background: c });
function Badge({ role }: { role: string }) {
  const c = ROLE_COLORS[role] || "#8BA5B8";
  return <span style={{ background: c + "22", color: c, border: `1px solid ${c}44`, padding: "2px 8px", fontSize: "10px", letterSpacing: "1px", fontFamily: F }}>{role.replace(/_/g, " ").toUpperCase()}</span>;
}
function Stat({ n, label, color = "#4A90B8" }: { n: number | string; label: string; color?: string }) {
  return (
    <div style={{ background: "#0A1828", border: "1px solid #1E3A5A", padding: "20px 24px" }}>
      <div style={{ fontSize: "32px", fontWeight: "bold", color }}>{n}</div>
      <div style={{ color: "#8BA5B8", fontSize: "11px", letterSpacing: "1px", marginTop: "6px" }}>{label}</div>
    </div>
  );
}
function SectionHead({ children }: { children: React.ReactNode }) {
  return <p style={{ color: "#4A90B8", letterSpacing: "3px", fontSize: "11px", marginBottom: "20px" }}>{children}</p>;
}
function BtnPrimary({ onClick, children, disabled }: { onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  return <button onClick={onClick} disabled={disabled} style={{ background: disabled ? "#1E3A5A" : "#4A90B8", color: "#fff", border: "none", padding: "8px 18px", fontSize: "12px", cursor: disabled ? "not-allowed" : "pointer", fontFamily: F, letterSpacing: "1px" }}>{children}</button>;
}
function BtnDanger({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} style={{ background: "#2A0D0D", color: "#E07070", border: "1px solid #8A2A2A", padding: "8px 18px", fontSize: "12px", cursor: "pointer", fontFamily: F }}>{children}</button>;
}
function BtnAmber({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} style={{ background: "#2A1A0D", color: "#E0B87A", border: "1px solid #8A5A2A", padding: "8px 18px", fontSize: "12px", cursor: "pointer", fontFamily: F }}>{children}</button>;
}

// ─── permission matrix data ───────────────────────────────────────────────────
const PERM_GROUPS = [
  { cat: "ADMINISTRATION", perms: [
    { label: "Create/delete admin accounts", vals: { super_admin:"full", assistant_admin:"no", registry_moderator:"no", forum_moderator:"no", spotter_moderator:"no", trusted_spotter:"no", registry_contributor:"no", paid_basic:"no", paid_pro:"no", paid_elite:"no", regular:"no", probation:"no", banned:"no" } },
    { label: "Create assistant admins", vals: { super_admin:"crown", assistant_admin:"no", registry_moderator:"no", forum_moderator:"no", spotter_moderator:"no", trusted_spotter:"no", registry_contributor:"no", paid_basic:"no", paid_pro:"no", paid_elite:"no", regular:"no", probation:"no", banned:"no" } },
    { label: "Manage all roles", vals: { super_admin:"full", assistant_admin:"limited", registry_moderator:"no", forum_moderator:"no", spotter_moderator:"no", trusted_spotter:"no", registry_contributor:"no", paid_basic:"no", paid_pro:"no", paid_elite:"no", regular:"no", probation:"no", banned:"no" } },
    { label: "Access audit log", vals: { super_admin:"full", assistant_admin:"full", registry_moderator:"limited", forum_moderator:"limited", spotter_moderator:"limited", trusted_spotter:"no", registry_contributor:"no", paid_basic:"no", paid_pro:"no", paid_elite:"no", regular:"no", probation:"no", banned:"no" } },
  ]},
  { cat: "USER MANAGEMENT", perms: [
    { label: "Ban users permanently", vals: { super_admin:"full", assistant_admin:"full", registry_moderator:"no", forum_moderator:"no", spotter_moderator:"limited", trusted_spotter:"no", registry_contributor:"no", paid_basic:"no", paid_pro:"no", paid_elite:"no", regular:"no", probation:"no", banned:"no" } },
    { label: "Temporary ban users", vals: { super_admin:"full", assistant_admin:"full", registry_moderator:"limited", forum_moderator:"full", spotter_moderator:"full", trusted_spotter:"no", registry_contributor:"no", paid_basic:"no", paid_pro:"no", paid_elite:"no", regular:"no", probation:"no", banned:"no" } },
    { label: "Edit user profiles", vals: { super_admin:"full", assistant_admin:"full", registry_moderator:"no", forum_moderator:"no", spotter_moderator:"limited", trusted_spotter:"no", registry_contributor:"no", paid_basic:"no", paid_pro:"no", paid_elite:"no", regular:"no", probation:"no", banned:"no" } },
    { label: "Manage subscriptions", vals: { super_admin:"full", assistant_admin:"full", registry_moderator:"no", forum_moderator:"no", spotter_moderator:"no", trusted_spotter:"no", registry_contributor:"no", paid_basic:"no", paid_pro:"no", paid_elite:"no", regular:"no", probation:"no", banned:"no" } },
  ]},
  { cat: "REGISTRY", perms: [
    { label: "Approve registry submissions", vals: { super_admin:"full", assistant_admin:"full", registry_moderator:"full", forum_moderator:"no", spotter_moderator:"no", trusted_spotter:"no", registry_contributor:"no", paid_basic:"no", paid_pro:"no", paid_elite:"no", regular:"no", probation:"no", banned:"no" } },
    { label: "Edit any registry entry", vals: { super_admin:"full", assistant_admin:"full", registry_moderator:"full", forum_moderator:"no", spotter_moderator:"no", trusted_spotter:"limited", registry_contributor:"limited", paid_basic:"no", paid_pro:"no", paid_elite:"no", regular:"no", probation:"no", banned:"no" } },
    { label: "Approve new brands/models", vals: { super_admin:"full", assistant_admin:"full", registry_moderator:"full", forum_moderator:"no", spotter_moderator:"no", trusted_spotter:"no", registry_contributor:"no", paid_basic:"no", paid_pro:"no", paid_elite:"no", regular:"no", probation:"no", banned:"no" } },
    { label: "Submit to registry", vals: { super_admin:"full", assistant_admin:"full", registry_moderator:"full", forum_moderator:"full", spotter_moderator:"full", trusted_spotter:"full", registry_contributor:"full", paid_basic:"full", paid_pro:"full", paid_elite:"full", regular:"full", probation:"limited", banned:"no" } },
  ]},
  { cat: "SPOTTINGS", perms: [
    { label: "Approve spottings", vals: { super_admin:"full", assistant_admin:"full", registry_moderator:"full", forum_moderator:"no", spotter_moderator:"full", trusted_spotter:"no", registry_contributor:"no", paid_basic:"no", paid_pro:"no", paid_elite:"no", regular:"no", probation:"no", banned:"no" } },
    { label: "Auto-verified own spottings", vals: { super_admin:"full", assistant_admin:"full", registry_moderator:"no", forum_moderator:"no", spotter_moderator:"no", trusted_spotter:"full", registry_contributor:"no", paid_basic:"no", paid_pro:"no", paid_elite:"no", regular:"no", probation:"no", banned:"no" } },
    { label: "Submit spottings", vals: { super_admin:"full", assistant_admin:"full", registry_moderator:"full", forum_moderator:"full", spotter_moderator:"full", trusted_spotter:"full", registry_contributor:"full", paid_basic:"full", paid_pro:"full", paid_elite:"full", regular:"full", probation:"limited", banned:"no" } },
    { label: "Manage events", vals: { super_admin:"full", assistant_admin:"full", registry_moderator:"no", forum_moderator:"no", spotter_moderator:"full", trusted_spotter:"no", registry_contributor:"no", paid_basic:"no", paid_pro:"no", paid_elite:"no", regular:"no", probation:"no", banned:"no" } },
  ]},
  { cat: "POINTS", perms: [
    { label: "Award bonus points", vals: { super_admin:"full", assistant_admin:"full", registry_moderator:"limited", forum_moderator:"no", spotter_moderator:"limited", trusted_spotter:"no", registry_contributor:"no", paid_basic:"no", paid_pro:"no", paid_elite:"no", regular:"no", probation:"no", banned:"no" } },
    { label: "Remove points", vals: { super_admin:"full", assistant_admin:"full", registry_moderator:"no", forum_moderator:"no", spotter_moderator:"limited", trusted_spotter:"no", registry_contributor:"no", paid_basic:"no", paid_pro:"no", paid_elite:"no", regular:"no", probation:"no", banned:"no" } },
    { label: "Edit leaderboard", vals: { super_admin:"crown", assistant_admin:"no", registry_moderator:"no", forum_moderator:"no", spotter_moderator:"no", trusted_spotter:"no", registry_contributor:"no", paid_basic:"no", paid_pro:"no", paid_elite:"no", regular:"no", probation:"no", banned:"no" } },
  ]},
  { cat: "CONTENT", perms: [
    { label: "Export data", vals: { super_admin:"full", assistant_admin:"full", registry_moderator:"full", forum_moderator:"no", spotter_moderator:"no", trusted_spotter:"no", registry_contributor:"no", paid_basic:"no", paid_pro:"full", paid_elite:"full", regular:"no", probation:"no", banned:"no" } },
    { label: "API access", vals: { super_admin:"full", assistant_admin:"full", registry_moderator:"no", forum_moderator:"no", spotter_moderator:"no", trusted_spotter:"no", registry_contributor:"no", paid_basic:"no", paid_pro:"no", paid_elite:"full", regular:"no", probation:"no", banned:"no" } },
    { label: "Private notes", vals: { super_admin:"full", assistant_admin:"full", registry_moderator:"full", forum_moderator:"full", spotter_moderator:"full", trusted_spotter:"full", registry_contributor:"no", paid_basic:"no", paid_pro:"no", paid_elite:"full", regular:"no", probation:"no", banned:"no" } },
    { label: "Early access features", vals: { super_admin:"full", assistant_admin:"full", registry_moderator:"full", forum_moderator:"full", spotter_moderator:"full", trusted_spotter:"full", registry_contributor:"no", paid_basic:"full", paid_pro:"full", paid_elite:"full", regular:"no", probation:"no", banned:"no" } },
  ]},
];

function PermCell({ val }: { val: string }) {
  if (val === "full") return <td style={{ background: "#0D2A1A", textAlign: "center", padding: "6px 4px", fontSize: "13px" }}>✅</td>;
  if (val === "limited") return <td style={{ background: "#2A1A0D", textAlign: "center", padding: "6px 4px", fontSize: "13px" }}>⚡</td>;
  if (val === "crown") return <td style={{ background: "#0D1A2A", textAlign: "center", padding: "6px 4px", fontSize: "13px" }}>👑</td>;
  return <td style={{ background: "#0D0D0D", textAlign: "center", padding: "6px 4px", fontSize: "13px" }}>❌</td>;
}

const ROLE_DISPLAY_NAMES: Record<string, string> = {
  super_admin:"Super Admin", assistant_admin:"Asst Admin", registry_moderator:"Registry Mod",
  forum_moderator:"Forum Mod", spotter_moderator:"Spotter Mod", trusted_spotter:"Trusted",
  registry_contributor:"Contributor", paid_basic:"Basic", paid_pro:"Pro", paid_elite:"Elite",
  regular:"Regular", probation:"Probation", banned:"Banned",
};

const PLANS = [
  { id: "paid_basic", name: "Basic", monthly: "€4.99", yearly: "€49.99", color: "#A0B0C0", features: ["Early access", "No ads", "Community badge"] },
  { id: "paid_pro", name: "Pro", monthly: "€9.99", yearly: "€99.99", color: "#C8A000", features: ["Everything in Basic", "Data export", "Priority support", "Pro badge"] },
  { id: "paid_elite", name: "Elite", monthly: "€24.99", yearly: "€249.99", color: "#F0C040", features: ["Everything in Pro", "API access", "Private notes", "Elite badge", "Direct admin contact"] },
];

const POINTS_RULES = [
  { action: "submit_spotting", label: "Submit spotting (photo only)", default: 10 },
  { action: "submit_spotting_with_plate", label: "Spotting with plate", default: 25 },
  { action: "submit_spotting_with_vin", label: "Spotting with VIN", default: 40 },
  { action: "submit_spotting_with_both", label: "Spotting with plate + VIN", default: 55 },
  { action: "first_spotting_of_chassis", label: "First ever spotting of a chassis", default: 100 },
  { action: "identify_vin", label: "Identify unknown VIN", default: 50 },
  { action: "add_numberplate", label: "Add numberplate to sighting", default: 15 },
  { action: "add_registry_field", label: "Add registry field (community)", default: 20 },
  { action: "ghost_car_found", label: "Discover a ghost car", default: 500 },
  { action: "photo_verified", label: "Photo verification bonus", default: 5 },
  { action: "model_suggestion_approved", label: "Model suggestion approved", default: 25 },
];

// ─── main component ───────────────────────────────────────────────────────────
export default function AdminClient({ submissions, claims }: { submissions: Submission[]; claims: Claim[] }) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // dashboard
  const [stats, setStats] = useState<DashStats | null>(null);

  // users
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [userBannedFilter, setUserBannedFilter] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [userMsg, setUserMsg] = useState("");

  // registry
  const [subQuery, setSubQuery] = useState("");
  const [subStatusFilter, setSubStatusFilter] = useState("");

  // spottings
  const [pendingSightings, setPendingSightings] = useState<PendingSighting[]>([]);
  const [sightingResults, setSightingResults] = useState<Record<string, string>>({});

  // brands & models
  const [makes, setMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [modelMakeFilter, setModelMakeFilter] = useState("");
  const [newMake, setNewMake] = useState({ name: "", country: "", founded_year: "" });
  const [newModel, setNewModel] = useState({ make: "", model: "", production_start_year: "", body_style: "coupe" });
  const [makeMsg, setMakeMsg] = useState("");
  const [modelMsg, setModelMsg] = useState("");
  const [modelSuggestions, setModelSuggestions] = useState<ModelSuggestion[]>([]);
  const [suggestionResults, setSuggestionResults] = useState<Record<string, string>>({});
  // submodels
  const [submodels, setSubmodels] = useState<Submodel[]>([]);
  const [submodelModelFilter, setSubmodelModelFilter] = useState("");
  const [newSubmodel, setNewSubmodel] = useState({ model_id: "", name: "", production_start_year: "", production_end_year: "", notes: "" });
  const [submodelMsg, setSubmodelMsg] = useState("");

  // claims
  const [claimResults, setClaimResults] = useState<Record<string, string>>({});

  // audit log
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [auditFilter, setAuditFilter] = useState("");
  const [auditActionFilter, setAuditActionFilter] = useState("");
  const [auditAdminFilter, setAuditAdminFilter] = useState("");
  const [auditDateFrom, setAuditDateFrom] = useState("");
  const [auditDateTo, setAuditDateTo] = useState("");

  // events
  const [pendingEvents, setPendingEvents] = useState<SpotterEvent[]>([]);
  const [eventResults, setEventResults] = useState<Record<string, boolean>>({});

  // vin services
  const [vinServices, setVinServices] = useState<PendingVinService[]>([]);
  const [vinResults, setVinResults] = useState<Record<string, boolean>>({});

  // points
  const [pointsUser, setPointsUser] = useState("");
  const [pointsAmount, setPointsAmount] = useState("");
  const [pointsReason, setPointsReason] = useState("");
  const [pointsMsg, setPointsMsg] = useState("");
  const [pointsHistory, setPointsHistory] = useState<{ user_email: string; action: string; points: number; created_at: string }[]>([]);
  const [leaderboard, setLeaderboard] = useState<{ username: string | null; user_email: string; total_points: number; country: string | null }[]>([]);
  const [lbCountryFilter, setLbCountryFilter] = useState("");
  const [bulkAwardMsg, setBulkAwardMsg] = useState("");

  // settings
  const [migrateMsg, setMigrateMsg] = useState("");
  const [storageMsg, setStorageMsg] = useState("");

  // ── data loading ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (tab === "dashboard") {
      fetch("/api/admin/stats").then(r => r.ok ? r.json() : null).then(d => d && setStats(d)).catch(() => {});
    }
    if (tab === "users") loadUsers();
    if (tab === "spottings") {
      fetch("/api/sightings?status=pending&limit=100").then(r => r.ok ? r.json() : []).then(setPendingSightings).catch(() => {});
    }
    if (tab === "brands-models") {
      Promise.all([
        fetch("/api/admin/makes").then(r => r.ok ? r.json() : []),
        fetch("/api/admin/models?limit=300").then(r => r.ok ? r.json() : []),
        fetch("/api/admin/model-suggestions").then(r => r.ok ? r.json() : []),
        fetch("/api/admin/submodels").then(r => r.ok ? r.json() : []),
      ]).then(([m, mo, ms, sm]) => { setMakes(m); setModels(mo); setModelSuggestions(ms); setSubmodels(sm); });
    }
    if (tab === "audit-log") {
      fetch("/api/admin/audit-log?limit=200").then(r => r.ok ? r.json() : []).then(setAuditLog).catch(() => {});
    }
    if (tab === "events") {
      fetch("/api/admin/events").then(r => r.ok ? r.json() : []).then(setPendingEvents).catch(() => {});
    }
    if (tab === "vin-services") {
      fetch("/api/vin-lookup?approved=false").then(r => r.ok ? r.json() : []).then(setVinServices).catch(() => {});
    }
    if (tab === "points") {
      fetch("/api/admin/spotters").then(r => r.ok ? r.json() : []).then(setLeaderboard).catch(() => {});
    }
  }, [tab]);

  const loadUsers = useCallback(() => {
    const params = new URLSearchParams({ page: String(userPage), ...(userSearch && { search: userSearch }), ...(userRoleFilter && { role: userRoleFilter }), ...(userBannedFilter && { banned: userBannedFilter }) });
    fetch(`/api/admin/users?${params}`).then(r => r.ok ? r.json() : { users: [], total: 0 }).then(d => { setUsers(d.users || []); setUserTotal(d.total || 0); }).catch(() => {});
  }, [userPage, userSearch, userRoleFilter, userBannedFilter]);

  useEffect(() => { if (tab === "users") loadUsers(); }, [tab, userPage, userRoleFilter, userBannedFilter, loadUsers]);

  // ── registry helpers ─────────────────────────────────────────────────────────
  const filteredSubs = useMemo(() => submissions.filter(s => {
    if (subStatusFilter && s.status !== subStatusFilter) return false;
    if (subQuery) { const q = subQuery.toLowerCase(); return (s.chassis_number||"").toLowerCase().includes(q) || (s.submitter_email||"").toLowerCase().includes(q); }
    return true;
  }), [submissions, subQuery, subStatusFilter]);

  async function approveSub(id: string) {
    await fetch("/api/admin/approve", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    window.location.reload();
  }
  async function rejectSub(id: string) {
    await fetch("/api/admin/reject", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    window.location.reload();
  }

  // ── sighting helpers ─────────────────────────────────────────────────────────
  async function handleSighting(id: string, status: "approved" | "rejected") {
    const res = await fetch("/api/sightings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    if (res.ok) setSightingResults(p => ({ ...p, [id]: status }));
  }

  // ── make/model helpers ───────────────────────────────────────────────────────
  async function saveMake() {
    if (!newMake.name) return;
    const slug = newMake.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const res = await fetch("/api/admin/makes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...newMake, slug, founded_year: newMake.founded_year ? parseInt(newMake.founded_year) : null }) });
    if (res.ok) { setMakeMsg(`✓ "${newMake.name}" added`); setNewMake({ name: "", country: "", founded_year: "" }); fetch("/api/admin/makes").then(r => r.ok ? r.json() : []).then(setMakes); }
    else setMakeMsg("Error");
  }
  async function saveModel() {
    if (!newModel.make || !newModel.model) return;
    const full_model_name = `${newModel.make} ${newModel.model}`;
    const res = await fetch("/api/admin/models", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...newModel, full_model_name, production_start_year: parseInt(newModel.production_start_year) || 2020 }) });
    if (res.ok) { setModelMsg(`✓ "${full_model_name}" added`); setNewModel({ make: "", model: "", production_start_year: "", body_style: "coupe" }); fetch("/api/admin/models?limit=300").then(r => r.ok ? r.json() : []).then(setModels); }
    else setModelMsg("Error");
  }

  // ── user helpers ─────────────────────────────────────────────────────────────
  async function banUser(email: string, reason: string) {
    await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, is_banned: true, ban_reason: reason, action: "USER_BANNED", admin_email: "admin" }) });
    setUserMsg(`Banned ${email}`); loadUsers();
  }
  async function unbanUser(email: string) {
    await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, is_banned: false, ban_reason: null, action: "USER_UNBANNED", admin_email: "admin" }) });
    setUserMsg(`Unbanned ${email}`); loadUsers();
  }
  async function changeRole(email: string, role: string) {
    await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, role, action: "ROLE_CHANGED", admin_email: "admin" }) });
    setUserMsg(`Role updated for ${email}`); loadUsers();
  }

  // ── points helpers ───────────────────────────────────────────────────────────
  async function awardPoints(subtract = false) {
    if (!pointsUser || !pointsAmount) return;
    const pts = parseInt(pointsAmount) * (subtract ? -1 : 1);
    await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: pointsUser, action: subtract ? "POINTS_REMOVED" : "POINTS_AWARDED", admin_email: "admin" }) });
    const res = await fetch("/api/admin/audit-log", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ admin_email: "admin", action: subtract ? "POINTS_REMOVED" : "POINTS_AWARDED", target_user_email: pointsUser, details: { points: pts, reason: pointsReason } }) });
    if (res.ok) { setPointsMsg(`${subtract ? "Removed" : "Awarded"} ${Math.abs(pts)} pts ${subtract ? "from" : "to"} ${pointsUser}`); setPointsAmount(""); setPointsReason(""); }
  }

  // ── events/vin helpers ───────────────────────────────────────────────────────
  async function handleEvent(id: string, approve: boolean) {
    await fetch("/api/admin/events", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, is_approved: approve }) });
    setEventResults(p => ({ ...p, [id]: approve }));
  }
  async function handleVin(id: string, approve: boolean) {
    await fetch("/api/vin-lookup", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, is_approved: approve }) });
    setVinResults(p => ({ ...p, [id]: approve }));
  }

  // ── submodel helpers ─────────────────────────────────────────────────────────
  async function saveSubmodel() {
    if (!newSubmodel.model_id || !newSubmodel.name) return;
    const slug = newSubmodel.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const res = await fetch("/api/admin/submodels", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...newSubmodel, slug, production_start_year: newSubmodel.production_start_year ? parseInt(newSubmodel.production_start_year) : null, production_end_year: newSubmodel.production_end_year ? parseInt(newSubmodel.production_end_year) : null }) });
    if (res.ok) { setSubmodelMsg(`✓ "${newSubmodel.name}" added`); setNewSubmodel({ model_id: "", name: "", production_start_year: "", production_end_year: "", notes: "" }); fetch("/api/admin/submodels").then(r => r.ok ? r.json() : []).then(setSubmodels); }
    else setSubmodelMsg("Error");
  }
  async function deleteSubmodel(id: string) {
    if (!confirm("Delete this submodel?")) return;
    await fetch("/api/admin/submodels", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setSubmodels(prev => prev.filter(s => s.id !== id));
  }

  // ── model suggestion helpers ─────────────────────────────────────────────────
  async function handleSuggestion(s: ModelSuggestion, action: "approve" | "reject" | "mark_variant") {
    const key = `${s.make}|||${s.model}`;
    const res = await fetch("/api/admin/model-suggestions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, make: s.make, model: s.model, ids: s.ids, firstSpotter: s.firstSpotter }) });
    setSuggestionResults(p => ({ ...p, [key]: res.ok ? action : "error" }));
  }

  // ── style helpers ────────────────────────────────────────────────────────────
  const inp: React.CSSProperties = { background: "#0D1E36", border: "1px solid #1E3A5A", color: "#E2EEF7", padding: "9px 14px", fontSize: "13px", fontFamily: F, outline: "none", width: "100%", boxSizing: "border-box" };
  const inpSm: React.CSSProperties = { ...inp, width: "auto" };
  const tbl: React.CSSProperties = { width: "100%", borderCollapse: "collapse", fontSize: "12px" };
  const th: React.CSSProperties = { padding: "10px 12px", color: "#4A90B8", letterSpacing: "2px", fontSize: "10px", textAlign: "left", borderBottom: "1px solid #1E3A5A" };
  const td: React.CSSProperties = { padding: "12px 12px", borderBottom: "1px solid #0D1E36", verticalAlign: "middle" };

  // ── render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#060D18", fontFamily: F, color: "#E2EEF7" }}>

      {/* ── sidebar ── */}
      <aside style={{ width: sidebarOpen ? "220px" : "48px", minHeight: "100vh", background: "#04080F", borderRight: "1px solid #0D1E36", transition: "width 0.2s", flexShrink: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 12px", borderBottom: "1px solid #0D1E36", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {sidebarOpen && <span style={{ color: "#E07070", fontSize: "10px", letterSpacing: "3px" }}>ADMIN</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "none", border: "none", color: "#4A6A8A", cursor: "pointer", fontSize: "16px", padding: "0 4px" }}>
            {sidebarOpen ? "◂" : "▸"}
          </button>
        </div>
        <nav style={{ flex: 1, padding: "8px 0" }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: tab === n.id ? "#0D1E36" : "none", border: "none", borderLeft: `2px solid ${tab === n.id ? "#4A90B8" : "transparent"}`, color: tab === n.id ? "#E2EEF7" : "#4A6A8A", cursor: "pointer", fontFamily: F, fontSize: "12px", textAlign: "left", letterSpacing: "0.5px" }}>
              <span style={{ fontSize: "14px", flexShrink: 0 }}>{n.icon}</span>
              {sidebarOpen && <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.label}</span>}
            </button>
          ))}
        </nav>
        {sidebarOpen && (
          <div style={{ padding: "12px", borderTop: "1px solid #0D1E36" }}>
            <p style={{ color: "#1E3A5A", fontSize: "10px" }}>{VERSION}</p>
          </div>
        )}
      </aside>

      {/* ── main ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* top bar */}
        <header style={{ background: "#04080F", borderBottom: "1px solid #1E2A0D", padding: "12px 32px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <span style={{ color: "#E07070", fontSize: "11px", letterSpacing: "3px" }}>ADMIN PANEL</span>
          <span style={{ color: "#4A6A8A", fontSize: "11px" }}>setup@vinvault.net</span>
          <span style={{ color: "#1E3A5A", fontSize: "11px" }}>{VERSION}</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: "12px", alignItems: "center" }}>
            <Link href="/" style={{ color: "#4A6A8A", fontSize: "11px", textDecoration: "none" }}>← Site</Link>
            <form action="/api/admin/logout" method="POST">
              <button type="submit" style={{ background: "none", border: "1px solid #1E3A5A", color: "#4A6A8A", padding: "4px 12px", fontSize: "11px", cursor: "pointer", fontFamily: F }}>Sign out</button>
            </form>
          </div>
        </header>

        {/* content */}
        <main style={{ flex: 1, padding: "32px", overflowY: "auto", maxWidth: "1400px" }}>

          {/* ─── DASHBOARD ─── */}
          {tab === "dashboard" && (
            <div>
              <SectionHead>OVERVIEW</SectionHead>
              {stats ? (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px,1fr))", gap: "16px", marginBottom: "36px" }}>
                    <Stat n={stats.totalUsers} label="TOTAL USERS" />
                    <Stat n={stats.totalSpotters} label="SPOTTERS" color="#4AB87A" />
                    <Stat n={stats.totalSightings} label="SPOTTINGS" />
                    <Stat n={stats.pendingSightings} label="PENDING SPOTTINGS" color="#B8944A" />
                    <Stat n={stats.approvedSubmissions} label="REGISTRY ENTRIES" color="#4AB87A" />
                    <Stat n={stats.pendingSubmissions} label="PENDING REGISTRY" color="#B8944A" />
                    <Stat n={stats.modelSuggestions} label="MODEL SUGGESTIONS" color="#B87AE0" />
                    <Stat n={stats.bannedUsers} label="BANNED USERS" color="#E07070" />
                  </div>
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "36px" }}>
                    <BtnPrimary onClick={() => setTab("spottings")}>Review Spottings ({stats.pendingSightings})</BtnPrimary>
                    <BtnPrimary onClick={() => setTab("registry")}>Review Registry ({stats.pendingSubmissions})</BtnPrimary>
                    <BtnPrimary onClick={() => setTab("brands-models")}>Model Suggestions ({stats.modelSuggestions})</BtnPrimary>
                  </div>
                  <SectionHead>RECENT ACTIVITY</SectionHead>
                  <div style={{ background: "#0A1828", border: "1px solid #1E3A5A" }}>
                    {stats.recentAudit.length === 0 ? <p style={{ padding: "24px", color: "#4A6A8A" }}>No audit entries yet.</p> : stats.recentAudit.map(e => (
                      <div key={e.id} style={{ display: "flex", gap: "16px", padding: "10px 16px", borderBottom: "1px solid #0D1E36", alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ color: "#4A6A8A", fontSize: "11px", whiteSpace: "nowrap" }}>{new Date(e.created_at).toLocaleString()}</span>
                        <span style={{ color: ACTION_COLORS[e.action] || "#8BA5B8", fontSize: "11px", letterSpacing: "1px" }}>{e.action}</span>
                        {e.target_user_email && <span style={{ color: "#8BA5B8", fontSize: "11px" }}>{e.target_user_email}</span>}
                        <span style={{ color: "#4A6A8A", fontSize: "11px" }}>{e.admin_email}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : <p style={{ color: "#4A6A8A" }}>Loading stats…</p>}
            </div>
          )}

          {/* ─── USERS ─── */}
          {tab === "users" && (
            <div>
              <SectionHead>USER MANAGEMENT</SectionHead>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "20px" }}>
                <input value={userSearch} onChange={e => setUserSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && loadUsers()} placeholder="Search email, username…" style={{ ...inpSm, width: "240px" }} />
                <select value={userRoleFilter} onChange={e => { setUserRoleFilter(e.target.value); setUserPage(1); }} style={{ ...inpSm }}>
                  <option value="">All Roles</option>
                  {ROLES.map(r => <option key={r} value={r}>{ROLE_DISPLAY_NAMES[r]}</option>)}
                </select>
                <select value={userBannedFilter} onChange={e => { setUserBannedFilter(e.target.value); setUserPage(1); }} style={{ ...inpSm }}>
                  <option value="">All Users</option>
                  <option value="true">Banned</option>
                  <option value="false">Not Banned</option>
                </select>
                <BtnPrimary onClick={loadUsers}>Search</BtnPrimary>
              </div>
              {userMsg && <p style={{ color: "#4AB87A", fontSize: "12px", marginBottom: "16px" }}>{userMsg}</p>}
              <div style={{ overflowX: "auto" }}>
                <table style={tbl}>
                  <thead><tr>
                    {["", "USERNAME", "EMAIL", "ROLE", "TRUST", "POINTS", "COUNTRY", "JOINED", ""].map(h2 => <th key={h2} style={th}>{h2}</th>)}
                  </tr></thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr><td colSpan={9} style={{ ...td, textAlign: "center", color: "#4A6A8A", padding: "48px" }}>No users found.</td></tr>
                    ) : users.map((u: UserProfile) => (
                      <tr key={u.id} style={{ background: u.is_banned ? "#1A0808" : "transparent" }}>
                        <td style={td}><div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#1E3A5A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#4A90B8" }}>{(u.username || u.email)[0].toUpperCase()}</div></td>
                        <td style={{ ...td, fontWeight: "bold" }}>{u.username || "—"}</td>
                        <td style={{ ...td, color: "#8BA5B8" }}>{u.email}</td>
                        <td style={td}><Badge role={u.role} /></td>
                        <td style={{ ...td, color: "#8BA5B8", textAlign: "center" }}>{u.trust_level}</td>
                        <td style={{ ...td, color: "#4A90B8" }}>{u.total_points?.toLocaleString()}</td>
                        <td style={{ ...td, color: "#8BA5B8" }}>{u.country || "—"}</td>
                        <td style={{ ...td, color: "#4A6A8A", whiteSpace: "nowrap" }}>{new Date(u.created_at).toLocaleDateString()}</td>
                        <td style={td}>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                            <Link href={`/admin/users/${u.id}`} style={{ color: "#4A90B8", fontSize: "11px", border: "1px solid #1E3A5A", padding: "4px 10px", textDecoration: "none", whiteSpace: "nowrap" }}>Edit</Link>
                            <select defaultValue={u.role} onChange={e => changeRole(u.email, e.target.value)} style={{ ...inpSm, fontSize: "11px", padding: "4px 8px" }} disabled={u.is_protected}>
                              {ROLES.map(r => <option key={r} value={r}>{ROLE_DISPLAY_NAMES[r]}</option>)}
                            </select>
                            {u.is_banned
                              ? <BtnPrimary onClick={() => unbanUser(u.email)}>Unban</BtnPrimary>
                              : <BtnDanger onClick={() => { const r = prompt(`Ban reason for ${u.email}:`); if (r) banUser(u.email, r); }}>Ban</BtnDanger>
                            }
                            {u.is_protected && <span style={{ color: "#E07070", fontSize: "10px", padding: "4px" }}>🔒</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* pagination */}
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "16px" }}>
                <BtnPrimary onClick={() => setUserPage(p => Math.max(1, p - 1))} disabled={userPage === 1}>← Prev</BtnPrimary>
                <span style={{ color: "#8BA5B8", fontSize: "12px" }}>Page {userPage} · {userTotal} total</span>
                <BtnPrimary onClick={() => setUserPage(p => p + 1)} disabled={users.length < 25}>Next →</BtnPrimary>
              </div>
            </div>
          )}

          {/* ─── ROLES & PERMISSIONS ─── */}
          {tab === "roles" && (
            <div>
              <SectionHead>ROLES &amp; PERMISSIONS</SectionHead>
              {/* Legend */}
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "20px" }}>
                {[["✅ Full permission","#0D2A1A"],["⚡ Limited","#2A1A0D"],["👑 Exclusive (super admin only)","#0D1A2A"],["❌ No permission","#0D0D0D"]].map(([l, bg2]) => (
                  <div key={l} style={{ background: bg2, padding: "4px 12px", fontSize: "11px", display: "flex", alignItems: "center", gap: "6px" }}>{l}</div>
                ))}
              </div>
              <div style={{ overflowX: "auto", marginBottom: "48px" }}>
                <table style={{ ...tbl, minWidth: "1100px" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #1E3A5A" }}>
                      <th style={{ ...th, width: "180px" }}>PERMISSION</th>
                      {ROLES.map(r => <th key={r} style={{ ...th, textAlign: "center", fontSize: "9px", padding: "8px 4px" }}><div style={{ color: ROLE_COLORS[r] || "#8BA5B8" }}>{ROLE_DISPLAY_NAMES[r]}</div></th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {PERM_GROUPS.map(g => (
                      <>
                        <tr key={g.cat}><td colSpan={14} style={{ background: "#0A1828", color: "#4A90B8", fontSize: "10px", letterSpacing: "2px", padding: "8px 12px" }}>{g.cat}</td></tr>
                        {g.perms.map(p => (
                          <tr key={p.label} style={{ borderBottom: "1px solid #0A1020" }}>
                            <td style={{ ...td, fontSize: "11px", whiteSpace: "nowrap" }}>{p.label}</td>
                            {ROLES.map(r => <PermCell key={r} val={(p.vals as Record<string, string>)[r] || "no"} />)}
                          </tr>
                        ))}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Role descriptions */}
              <SectionHead>ROLE DESCRIPTIONS</SectionHead>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: "16px", marginBottom: "40px" }}>
                {[
                  { role: "super_admin", desc: "Full system access. Can do everything.", earn: "Assigned manually. Cannot be revoked except by another super admin.", badge: true },
                  { role: "assistant_admin", desc: "Almost full access. Cannot manage super admins.", earn: "Assigned by super admin.", badge: true },
                  { role: "registry_moderator", desc: "Reviews and approves registry submissions and brands.", earn: "Assigned by admin for trusted experts.", badge: true },
                  { role: "spotter_moderator", desc: "Moderates spotting submissions and events.", earn: "Assigned by admin.", badge: true },
                  { role: "trusted_spotter", desc: "Experienced spotter. Own spottings auto-verified.", earn: "Automatic at 500+ points with 50+ verified spottings.", badge: true },
                  { role: "registry_contributor", desc: "Recognized contributor to registry data.", earn: "Awarded for significant registry contributions.", badge: true },
                  { role: "paid_elite", desc: "Elite subscriber. All features unlocked.", earn: "Subscription €24.99/mo or €249.99/yr.", badge: true },
                  { role: "paid_pro", desc: "Pro subscriber. Export + priority support.", earn: "Subscription €9.99/mo or €99.99/yr.", badge: true },
                  { role: "paid_basic", desc: "Basic subscriber. No ads, early access.", earn: "Subscription €4.99/mo or €49.99/yr.", badge: true },
                  { role: "regular", desc: "Standard registered user.", earn: "Default on registration.", badge: false },
                  { role: "probation", desc: "Restricted user. Limited submission rights.", earn: "Assigned after rule violations. Temporary.", badge: false },
                  { role: "banned", desc: "Banned user. No access to submit.", earn: "Assigned by moderator or admin.", badge: false },
                ].map(({ role, desc, earn, badge }) => {
                  const c = ROLE_COLORS[role] || "#8BA5B8";
                  return (
                    <div key={role} style={{ background: "#0A1828", border: `1px solid ${c}33`, padding: "16px 20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <Badge role={role} />
                        {badge && <span style={{ color: "#4A6A8A", fontSize: "10px" }}>Has badge</span>}
                      </div>
                      <p style={{ color: "#E2EEF7", fontSize: "13px", marginBottom: "8px" }}>{desc}</p>
                      <p style={{ color: "#4A6A8A", fontSize: "11px" }}>{earn}</p>
                    </div>
                  );
                })}
              </div>

              {/* Subscription plans */}
              <SectionHead>SUBSCRIPTION PLANS</SectionHead>
              <p style={{ color: "#4A6A8A", fontSize: "12px", marginBottom: "20px" }}>Stripe integration coming soon — activate manually per user in the Users tab.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: "16px" }}>
                {PLANS.map(plan => (
                  <div key={plan.id} style={{ background: "#0A1828", border: `1px solid ${plan.color}44`, padding: "24px" }}>
                    <p style={{ color: plan.color, fontSize: "13px", letterSpacing: "2px", marginBottom: "8px" }}>{plan.name.toUpperCase()}</p>
                    <p style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "4px" }}>{plan.monthly}<span style={{ fontSize: "12px", color: "#8BA5B8" }}>/mo</span></p>
                    <p style={{ color: "#4A6A8A", fontSize: "12px", marginBottom: "16px" }}>{plan.yearly}/yr</p>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                      {plan.features.map(f => <li key={f} style={{ color: "#8BA5B8", fontSize: "12px", marginBottom: "6px" }}>✓ {f}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── REGISTRY ─── */}
          {tab === "registry" && (
            <div>
              <SectionHead>REGISTRY SUBMISSIONS ({submissions.length})</SectionHead>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "20px" }}>
                <input value={subQuery} onChange={e => setSubQuery(e.target.value)} placeholder="Search chassis, email…" style={{ ...inpSm, width: "240px" }} />
                <select value={subStatusFilter} onChange={e => setSubStatusFilter(e.target.value)} style={inpSm}>
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={tbl}>
                  <thead><tr>{["CHASSIS","COLOR","MARKET","SUBMITTED","STATUS",""].map(h2 => <th key={h2} style={th}>{h2}</th>)}</tr></thead>
                  <tbody>
                    {filteredSubs.map(s => (
                      <tr key={s.id} style={{ borderBottom: "1px solid #0D1E36" }}>
                        <td style={{ ...td, fontFamily: "monospace" }}>{s.chassis_number}</td>
                        <td style={{ ...td, color: "#8BA5B8" }}>{s.exterior_color || "—"}</td>
                        <td style={{ ...td, color: "#8BA5B8" }}>{s.original_market || "—"}</td>
                        <td style={{ ...td, color: "#4A6A8A" }}>{new Date(s.created_at).toLocaleDateString()}</td>
                        <td style={td}>
                          <span style={{ background: s.status === "approved" ? "#0D2A1A" : s.status === "rejected" ? "#2A0D0D" : "#2A1A0D", color: s.status === "approved" ? "#4AB87A" : s.status === "rejected" ? "#E07070" : "#B8944A", padding: "3px 10px", fontSize: "10px", letterSpacing: "1px" }}>{s.status?.toUpperCase()}</span>
                        </td>
                        <td style={td}>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <Link href={`/admin/submission/${s.id}`} style={{ color: "#4A90B8", fontSize: "11px", border: "1px solid #1E3A5A", padding: "4px 10px", textDecoration: "none" }}>Review</Link>
                            {s.status === "pending" && <>
                              <button onClick={() => approveSub(s.id)} style={{ background: "#0D2A1A", color: "#4AB87A", border: "1px solid #4AB87A", padding: "4px 10px", fontSize: "11px", cursor: "pointer", fontFamily: F }}>✓</button>
                              <button onClick={() => rejectSub(s.id)} style={{ background: "#2A0D0D", color: "#E07070", border: "1px solid #8A2A2A", padding: "4px 10px", fontSize: "11px", cursor: "pointer", fontFamily: F }}>✗</button>
                            </>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── SPOTTINGS ─── */}
          {tab === "spottings" && (
            <div>
              <SectionHead>PENDING SPOTTINGS ({pendingSightings.length})</SectionHead>
              <div style={{ display: "grid", gap: "12px" }}>
                {pendingSightings.length === 0 ? <p style={{ color: "#4A6A8A" }}>No pending spottings.</p> : pendingSightings.map(s => {
                  const r = sightingResults[s.id];
                  return (
                    <div key={s.id} style={{ background: "#0A1828", border: "1px solid #1E3A5A", padding: "16px 20px", display: "flex", gap: "16px", alignItems: "flex-start", flexWrap: "wrap" }}>
                      {s.photo_url && <img src={s.photo_url} alt="" style={{ width: "80px", height: "60px", objectFit: "cover", border: "1px solid #1E3A5A", flexShrink: 0 }} />}
                      <div style={{ flex: 1, minWidth: "200px" }}>
                        <p style={{ fontFamily: "monospace", fontSize: "13px", marginBottom: "4px" }}>{s.chassis_number || "(no VIN)"}</p>
                        <p style={{ color: "#8BA5B8", fontSize: "12px" }}>{s.location_name}, {s.country} · {s.spotter_email}</p>
                        {s.unverified_model && <p style={{ color: "#B87AE0", fontSize: "11px", marginTop: "4px" }}>Suggested model: {s.unverified_make ? `${s.unverified_make} ` : ""}{s.unverified_model}</p>}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                          <div style={{ background: "#0D1E36", height: "4px", width: "100px", borderRadius: "2px" }}>
                            <div style={{ background: s.confidence_score >= 70 ? "#4AB87A" : s.confidence_score >= 40 ? "#B8944A" : "#E07070", height: "4px", width: `${s.confidence_score}%`, borderRadius: "2px" }} />
                          </div>
                          <span style={{ color: "#4A6A8A", fontSize: "11px" }}>Confidence {s.confidence_score}%</span>
                        </div>
                      </div>
                      {r ? (
                        <span style={{ color: r === "approved" ? "#4AB87A" : "#E07070", fontSize: "12px", letterSpacing: "1px" }}>{r.toUpperCase()}</span>
                      ) : (
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button onClick={() => handleSighting(s.id, "approved")} style={{ background: "#0D2A1A", color: "#4AB87A", border: "1px solid #4AB87A", padding: "8px 16px", fontSize: "12px", cursor: "pointer", fontFamily: F }}>Approve</button>
                          <button onClick={() => handleSighting(s.id, "rejected")} style={{ background: "#2A0D0D", color: "#E07070", border: "1px solid #8A2A2A", padding: "8px 16px", fontSize: "12px", cursor: "pointer", fontFamily: F }}>Reject</button>
                          <Link href={`/spottings/${s.id}`} style={{ color: "#4A90B8", fontSize: "12px", border: "1px solid #1E3A5A", padding: "8px 16px", textDecoration: "none" }}>View</Link>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── BRANDS & MODELS ─── */}
          {tab === "brands-models" && (
            <div>
              <SectionHead>MAKES ({makes.length})</SectionHead>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "12px" }}>
                <input value={newMake.name} onChange={e => setNewMake(m => ({ ...m, name: e.target.value }))} placeholder="Brand name" style={{ ...inpSm, width: "180px" }} />
                <input value={newMake.country} onChange={e => setNewMake(m => ({ ...m, country: e.target.value }))} placeholder="Country" style={{ ...inpSm, width: "120px" }} />
                <input value={newMake.founded_year} onChange={e => setNewMake(m => ({ ...m, founded_year: e.target.value }))} placeholder="Founded" style={{ ...inpSm, width: "80px" }} />
                <BtnPrimary onClick={saveMake}>Add Brand</BtnPrimary>
                {makeMsg && <span style={{ color: "#4AB87A", fontSize: "12px", alignSelf: "center" }}>{makeMsg}</span>}
              </div>
              <div style={{ overflowX: "auto", marginBottom: "36px" }}>
                <table style={tbl}>
                  <thead><tr>{["NAME","SLUG","COUNTRY","FOUNDED","MODELS",""].map(h2 => <th key={h2} style={th}>{h2}</th>)}</tr></thead>
                  <tbody>
                    {makes.map(m => (
                      <tr key={m.id} style={{ borderBottom: "1px solid #0D1E36" }}>
                        <td style={{ ...td, fontWeight: "bold" }}>{m.name}</td>
                        <td style={{ ...td, color: "#4A6A8A", fontFamily: "monospace" }}>{m.slug}</td>
                        <td style={{ ...td, color: "#8BA5B8" }}>{m.country || "—"}</td>
                        <td style={{ ...td, color: "#8BA5B8" }}>{m.founded_year || "—"}</td>
                        <td style={{ ...td, color: "#4A90B8" }}>{models.filter(mo => mo.make === m.name).length}</td>
                        <td style={td}></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <SectionHead>MODELS ({models.length})</SectionHead>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "12px" }}>
                <select value={newModel.make} onChange={e => setNewModel(m => ({ ...m, make: e.target.value }))} style={{ ...inpSm, width: "160px" }}>
                  <option value="">Select brand</option>
                  {makes.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                </select>
                <input value={newModel.model} onChange={e => setNewModel(m => ({ ...m, model: e.target.value }))} placeholder="Model name" style={{ ...inpSm, width: "160px" }} />
                <input value={newModel.production_start_year} onChange={e => setNewModel(m => ({ ...m, production_start_year: e.target.value }))} placeholder="Year" style={{ ...inpSm, width: "70px" }} />
                <select value={newModel.body_style} onChange={e => setNewModel(m => ({ ...m, body_style: e.target.value }))} style={inpSm}>
                  {["coupe","convertible","roadster","sedan","suv","hatchback","wagon"].map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <BtnPrimary onClick={saveModel}>Add Model</BtnPrimary>
                {modelMsg && <span style={{ color: "#4AB87A", fontSize: "12px", alignSelf: "center" }}>{modelMsg}</span>}
              </div>
              <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                <select value={modelMakeFilter} onChange={e => setModelMakeFilter(e.target.value)} style={{ ...inpSm, width: "180px" }}>
                  <option value="">All Brands</option>
                  {makes.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                </select>
              </div>
              <div style={{ overflowX: "auto", marginBottom: "36px" }}>
                <table style={tbl}>
                  <thead><tr>{["MAKE","MODEL","YEARS","BODY",""].map(h2 => <th key={h2} style={th}>{h2}</th>)}</tr></thead>
                  <tbody>
                    {models.filter(m => !modelMakeFilter || m.make === modelMakeFilter).slice(0, 100).map(m => (
                      <tr key={m.id} style={{ borderBottom: "1px solid #0D1E36" }}>
                        <td style={{ ...td, color: "#4A90B8", fontSize: "11px" }}>{m.make}</td>
                        <td style={{ ...td, fontWeight: "bold" }}>{m.model}</td>
                        <td style={{ ...td, color: "#8BA5B8" }}>{m.production_start_year}{m.production_end_year ? `–${m.production_end_year}` : "–"}</td>
                        <td style={{ ...td, color: "#8BA5B8" }}>{m.body_style || "—"}</td>
                        <td style={td}></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <SectionHead>MODEL SUGGESTIONS ({modelSuggestions.length})</SectionHead>
              {modelSuggestions.length === 0 ? <p style={{ color: "#4A6A8A" }}>No suggestions pending.</p> : modelSuggestions.map(s => {
                const key = `${s.make}|||${s.model}`;
                const r = suggestionResults[key];
                return (
                  <div key={key} style={{ background: "#0A1828", border: "1px solid #1E3A5A", padding: "16px 20px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <p style={{ fontWeight: "bold" }}>{s.make !== "(known brand)" && <span style={{ color: "#B87AE0" }}>[NEW BRAND] </span>}{s.make !== "(known brand)" ? s.make + " " : ""}<span style={{ color: "#E2EEF7" }}>{s.model}</span></p>
                      <p style={{ color: "#4A6A8A", fontSize: "11px" }}>{s.count} sighting{s.count !== 1 ? "s" : ""} · First: {s.firstSpotter}</p>
                    </div>
                    {r ? <span style={{ color: r === "approve" ? "#4AB87A" : r === "reject" ? "#E07070" : "#B8944A", fontSize: "11px" }}>{r.toUpperCase()}</span>
                      : <div style={{ display: "flex", gap: "8px" }}>
                          <button onClick={() => handleSuggestion(s, "approve")} style={{ background: "#0D2A1A", color: "#4AB87A", border: "1px solid #4AB87A", padding: "6px 14px", fontSize: "11px", cursor: "pointer", fontFamily: F }}>Add to DB</button>
                          <button onClick={() => handleSuggestion(s, "mark_variant")} style={{ background: "#2A1A0D", color: "#E0B87A", border: "1px solid #8A5A2A", padding: "6px 14px", fontSize: "11px", cursor: "pointer", fontFamily: F }}>Variant</button>
                          <button onClick={() => handleSuggestion(s, "reject")} style={{ background: "#2A0D0D", color: "#E07070", border: "1px solid #8A2A2A", padding: "6px 14px", fontSize: "11px", cursor: "pointer", fontFamily: F }}>Reject</button>
                        </div>
                    }
                  </div>
                );
              })}

              <p style={{ color: "#4A90B8", letterSpacing: "3px", fontSize: "11px", marginBottom: "20px", marginTop: "36px" }}>SUBMODELS / VARIANTS ({submodels.length})</p>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "12px" }}>
                <select value={newSubmodel.model_id} onChange={e => setNewSubmodel(m => ({ ...m, model_id: e.target.value }))} style={{ ...inpSm, width: "200px" }}>
                  <option value="">Select model</option>
                  {models.map(m => <option key={m.id} value={m.id}>{m.full_model_name}</option>)}
                </select>
                <input value={newSubmodel.name} onChange={e => setNewSubmodel(m => ({ ...m, name: e.target.value }))} placeholder="Submodel name (e.g. GTS, Targa)" style={{ ...inpSm, width: "200px" }} />
                <input value={newSubmodel.production_start_year} onChange={e => setNewSubmodel(m => ({ ...m, production_start_year: e.target.value }))} placeholder="From year" style={{ ...inpSm, width: "80px" }} />
                <input value={newSubmodel.production_end_year} onChange={e => setNewSubmodel(m => ({ ...m, production_end_year: e.target.value }))} placeholder="To year" style={{ ...inpSm, width: "80px" }} />
                <input value={newSubmodel.notes} onChange={e => setNewSubmodel(m => ({ ...m, notes: e.target.value }))} placeholder="Notes" style={{ ...inpSm, width: "160px" }} />
                <BtnPrimary onClick={saveSubmodel}>Add Submodel</BtnPrimary>
                {submodelMsg && <span style={{ color: "#4AB87A", fontSize: "12px", alignSelf: "center" }}>{submodelMsg}</span>}
              </div>
              <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                <select value={submodelModelFilter} onChange={e => setSubmodelModelFilter(e.target.value)} style={{ ...inpSm, width: "220px" }}>
                  <option value="">All Models</option>
                  {models.map(m => <option key={m.id} value={m.id}>{m.full_model_name}</option>)}
                </select>
              </div>
              <div style={{ overflowX: "auto", marginBottom: "36px" }}>
                <table style={tbl}>
                  <thead><tr>{["MODEL","SUBMODEL","YEARS","NOTES",""].map(h2 => <th key={h2} style={th}>{h2}</th>)}</tr></thead>
                  <tbody>
                    {submodels.filter(s => !submodelModelFilter || s.model_id === submodelModelFilter).map(s => {
                      const parentModel = models.find(m => m.id === s.model_id);
                      return (
                        <tr key={s.id} style={{ borderBottom: "1px solid #0D1E36" }}>
                          <td style={{ ...td, color: "#4A90B8", fontSize: "11px" }}>{parentModel?.full_model_name || "—"}</td>
                          <td style={{ ...td, fontWeight: "bold" }}>{s.name}</td>
                          <td style={{ ...td, color: "#8BA5B8" }}>{s.production_start_year || "—"}{s.production_end_year ? `–${s.production_end_year}` : ""}</td>
                          <td style={{ ...td, color: "#4A6A8A", fontSize: "11px" }}>{s.notes || "—"}</td>
                          <td style={td}><button onClick={() => deleteSubmodel(s.id)} style={{ background: "#2A0D0D", color: "#E07070", border: "1px solid #8A2A2A", padding: "4px 10px", fontSize: "11px", cursor: "pointer", fontFamily: F }}>Delete</button></td>
                        </tr>
                      );
                    })}
                    {submodels.filter(s => !submodelModelFilter || s.model_id === submodelModelFilter).length === 0 && (
                      <tr><td colSpan={5} style={{ ...td, color: "#4A6A8A", textAlign: "center", padding: "24px" }}>No submodels found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── POINTS & LEADERBOARD ─── */}
          {tab === "points" && (
            <div>
              <SectionHead>POINTS MANAGEMENT</SectionHead>
              <div style={{ background: "#0A1828", border: "1px solid #1E3A5A", padding: "20px 24px", maxWidth: "500px", marginBottom: "32px" }}>
                <p style={{ color: "#8BA5B8", fontSize: "11px", letterSpacing: "2px", marginBottom: "16px" }}>AWARD / REMOVE POINTS</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <input value={pointsUser} onChange={e => setPointsUser(e.target.value)} placeholder="User email" style={inp} />
                  <input value={pointsAmount} onChange={e => setPointsAmount(e.target.value)} placeholder="Amount" type="number" style={inp} />
                  <input value={pointsReason} onChange={e => setPointsReason(e.target.value)} placeholder="Reason (required for audit)" style={inp} />
                  <div style={{ display: "flex", gap: "10px" }}>
                    <BtnPrimary onClick={() => awardPoints(false)}>+ Award Points</BtnPrimary>
                    <BtnDanger onClick={() => awardPoints(true)}>− Remove Points</BtnDanger>
                  </div>
                </div>
                {pointsMsg && <p style={{ color: "#4AB87A", fontSize: "12px", marginTop: "12px" }}>{pointsMsg}</p>}
              </div>

              <SectionHead>POINTS RULES</SectionHead>
              <p style={{ color: "#4A6A8A", fontSize: "12px", marginBottom: "16px" }}>Changes are logged to audit. Take effect on new submissions immediately.</p>
              <div style={{ overflowX: "auto", marginBottom: "36px" }}>
                <table style={tbl}>
                  <thead><tr>{["ACTION","LABEL","DEFAULT PTS",""].map(h2 => <th key={h2} style={th}>{h2}</th>)}</tr></thead>
                  <tbody>
                    {POINTS_RULES.map(r => (
                      <tr key={r.action} style={{ borderBottom: "1px solid #0D1E36" }}>
                        <td style={{ ...td, fontFamily: "monospace", fontSize: "11px", color: "#4A6A8A" }}>{r.action}</td>
                        <td style={td}>{r.label}</td>
                        <td style={{ ...td, color: "#4AB87A", fontWeight: "bold" }}>{r.default}</td>
                        <td style={td}></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <SectionHead>LEADERBOARD (TOP 50)</SectionHead>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
                <input value={lbCountryFilter} onChange={e => setLbCountryFilter(e.target.value)} placeholder="Filter by country…" style={{ ...inpSm, width: "200px" }} />
                {lbCountryFilter && <button onClick={() => setLbCountryFilter("")} style={{ background: "none", border: "1px solid #1E3A5A", color: "#4A6A8A", padding: "4px 12px", fontSize: "11px", cursor: "pointer", fontFamily: F }}>Clear</button>}
              </div>
              {bulkAwardMsg && <p style={{ color: "#4AB87A", fontSize: "12px", marginBottom: "12px" }}>{bulkAwardMsg}</p>}
              <div style={{ overflowX: "auto" }}>
                <table style={tbl}>
                  <thead><tr>{["#","USERNAME","EMAIL","COUNTRY","POINTS"].map(h2 => <th key={h2} style={th}>{h2}</th>)}</tr></thead>
                  <tbody>
                    {leaderboard.filter(u => !lbCountryFilter || (u.country || "").toLowerCase().includes(lbCountryFilter.toLowerCase())).slice(0, 50).map((u, i) => (
                      <tr key={u.user_email} style={{ borderBottom: "1px solid #0D1E36" }}>
                        <td style={{ ...td, color: "#4A6A8A" }}>{i + 1}</td>
                        <td style={{ ...td, fontWeight: "bold" }}>{u.username || "—"}</td>
                        <td style={{ ...td, color: "#8BA5B8" }}>{u.user_email}</td>
                        <td style={{ ...td, color: "#4A6A8A" }}>{u.country || "—"}</td>
                        <td style={{ ...td, color: "#4A90B8", fontWeight: "bold" }}>{u.total_points?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── AUDIT LOG ─── */}
          {tab === "audit-log" && (
            <div>
              <SectionHead>AUDIT LOG</SectionHead>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "20px", alignItems: "center" }}>
                <input value={auditFilter} onChange={e => setAuditFilter(e.target.value)} placeholder="Search target user…" style={{ ...inpSm, width: "200px" }} />
                <input value={auditAdminFilter} onChange={e => setAuditAdminFilter(e.target.value)} placeholder="Filter by admin…" style={{ ...inpSm, width: "180px" }} />
                <select value={auditActionFilter} onChange={e => setAuditActionFilter(e.target.value)} style={inpSm}>
                  <option value="">All Actions</option>
                  {Object.keys(ACTION_COLORS).map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <input type="date" value={auditDateFrom} onChange={e => setAuditDateFrom(e.target.value)} style={{ ...inpSm, width: "140px" }} title="From date" />
                <input type="date" value={auditDateTo} onChange={e => setAuditDateTo(e.target.value)} style={{ ...inpSm, width: "140px" }} title="To date" />
                <BtnAmber onClick={() => {
                  const rows = auditLog.map(e => `${e.created_at},${e.admin_email},${e.action},${e.target_user_email || ""},${JSON.stringify(e.details || {})}`).join("\n");
                  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([`timestamp,admin,action,target,details\n${rows}`], { type: "text/csv" })); a.download = "audit-log.csv"; a.click();
                }}>Export CSV</BtnAmber>
              </div>
              <div style={{ background: "#0A1828", border: "1px solid #1E3A5A" }}>
                {auditLog.filter(e => {
                  if (auditFilter && !(e.target_user_email || "").toLowerCase().includes(auditFilter.toLowerCase())) return false;
                  if (auditAdminFilter && !e.admin_email.toLowerCase().includes(auditAdminFilter.toLowerCase())) return false;
                  if (auditActionFilter && e.action !== auditActionFilter) return false;
                  if (auditDateFrom && new Date(e.created_at) < new Date(auditDateFrom)) return false;
                  if (auditDateTo && new Date(e.created_at) > new Date(auditDateTo + "T23:59:59")) return false;
                  return true;
                }).map(e => (
                  <div key={e.id} style={{ display: "flex", gap: "16px", padding: "10px 16px", borderBottom: "1px solid #0D1E36", alignItems: "flex-start", flexWrap: "wrap" }}>
                    <span style={{ color: "#4A6A8A", fontSize: "11px", whiteSpace: "nowrap", minWidth: "140px" }}>{new Date(e.created_at).toLocaleString()}</span>
                    <span style={{ background: (ACTION_COLORS[e.action] || "#8BA5B8") + "22", color: ACTION_COLORS[e.action] || "#8BA5B8", padding: "2px 8px", fontSize: "10px", letterSpacing: "1px", whiteSpace: "nowrap" }}>{e.action}</span>
                    <span style={{ color: "#E2EEF7", fontSize: "12px", flex: 1 }}>{e.target_user_email || ""}</span>
                    <span style={{ color: "#4A6A8A", fontSize: "11px" }}>by {e.admin_email}</span>
                    {e.details && <span style={{ color: "#4A6A8A", fontSize: "10px", fontFamily: "monospace", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{JSON.stringify(e.details)}</span>}
                  </div>
                ))}
                {auditLog.length === 0 && <p style={{ padding: "24px", color: "#4A6A8A" }}>No audit entries yet.</p>}
              </div>
            </div>
          )}

          {/* ─── EVENTS ─── */}
          {tab === "events" && (
            <div>
              <SectionHead>PENDING EVENTS</SectionHead>
              {pendingEvents.length === 0 ? <p style={{ color: "#4A6A8A" }}>No pending events.</p> : pendingEvents.map(e => {
                const r = eventResults[e.id];
                return (
                  <div key={e.id} style={{ background: "#0A1828", border: "1px solid #1E3A5A", padding: "16px 20px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <p style={{ fontWeight: "bold", marginBottom: "4px" }}>{e.name}</p>
                      <p style={{ color: "#8BA5B8", fontSize: "12px" }}>{e.location_name}, {e.country} · {new Date(e.event_date).toLocaleDateString()}</p>
                      <p style={{ color: "#4A6A8A", fontSize: "11px" }}>By {e.organizer_email}</p>
                    </div>
                    {r !== undefined ? <span style={{ color: r ? "#4AB87A" : "#E07070", fontSize: "12px" }}>{r ? "APPROVED" : "REJECTED"}</span>
                      : <div style={{ display: "flex", gap: "8px" }}>
                          <button onClick={() => handleEvent(e.id, true)} style={{ background: "#0D2A1A", color: "#4AB87A", border: "1px solid #4AB87A", padding: "6px 14px", fontSize: "11px", cursor: "pointer", fontFamily: F }}>Approve</button>
                          <button onClick={() => handleEvent(e.id, false)} style={{ background: "#2A0D0D", color: "#E07070", border: "1px solid #8A2A2A", padding: "6px 14px", fontSize: "11px", cursor: "pointer", fontFamily: F }}>Reject</button>
                        </div>
                    }
                  </div>
                );
              })}
            </div>
          )}

          {/* ─── VIN SERVICES ─── */}
          {tab === "vin-services" && (
            <div>
              <SectionHead>VIN LOOKUP SERVICE SUBMISSIONS</SectionHead>
              {vinServices.length === 0 ? <p style={{ color: "#4A6A8A" }}>No pending VIN services.</p> : vinServices.map(s => {
                const r = vinResults[s.id];
                return (
                  <div key={s.id} style={{ background: "#0A1828", border: "1px solid #1E3A5A", padding: "16px 20px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <p style={{ fontWeight: "bold", marginBottom: "4px" }}>{s.service_name}</p>
                      <p style={{ color: "#8BA5B8", fontSize: "12px" }}>{s.country_name} · {s.is_free ? "Free" : "Paid"}</p>
                      <a href={s.service_url} target="_blank" rel="noopener noreferrer" style={{ color: "#4A90B8", fontSize: "11px" }}>{s.service_url}</a>
                    </div>
                    {r !== undefined ? <span style={{ color: r ? "#4AB87A" : "#E07070", fontSize: "12px" }}>{r ? "APPROVED" : "REJECTED"}</span>
                      : <div style={{ display: "flex", gap: "8px" }}>
                          <button onClick={() => handleVin(s.id, true)} style={{ background: "#0D2A1A", color: "#4AB87A", border: "1px solid #4AB87A", padding: "6px 14px", fontSize: "11px", cursor: "pointer", fontFamily: F }}>Approve</button>
                          <button onClick={() => handleVin(s.id, false)} style={{ background: "#2A0D0D", color: "#E07070", border: "1px solid #8A2A2A", padding: "6px 14px", fontSize: "11px", cursor: "pointer", fontFamily: F }}>Reject</button>
                        </div>
                    }
                  </div>
                );
              })}
            </div>
          )}

          {/* ─── SUBSCRIPTIONS ─── */}
          {tab === "subscriptions" && (
            <div>
              <SectionHead>SUBSCRIPTION MANAGEMENT</SectionHead>
              <p style={{ color: "#4A6A8A", fontSize: "13px", marginBottom: "28px" }}>Stripe integration coming soon. To manually activate a subscription, go to the Users tab, find the user, and change their role to paid_basic / paid_pro / paid_elite.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: "16px" }}>
                {PLANS.map(plan => (
                  <div key={plan.id} style={{ background: "#0A1828", border: `1px solid ${plan.color}44`, padding: "24px" }}>
                    <p style={{ color: plan.color, fontSize: "13px", letterSpacing: "2px", marginBottom: "8px" }}>{plan.name.toUpperCase()}</p>
                    <p style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "4px" }}>{plan.monthly}<span style={{ fontSize: "11px", color: "#8BA5B8" }}>/mo</span></p>
                    <p style={{ color: "#4A6A8A", fontSize: "11px", marginBottom: "16px" }}>{plan.yearly}/yr</p>
                    <ul style={{ listStyle: "none", padding: 0 }}>{plan.features.map(f => <li key={f} style={{ color: "#8BA5B8", fontSize: "12px", marginBottom: "4px" }}>✓ {f}</li>)}</ul>
                    <div style={{ marginTop: "16px", padding: "10px", background: "#060D18", border: "1px dashed #1E3A5A", color: "#4A6A8A", fontSize: "11px" }}>Stripe coming soon</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── SETTINGS ─── */}
          {tab === "settings" && (
            <div>
              <SectionHead>SYSTEM SETTINGS</SectionHead>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "24px" }}>
                <button onClick={async () => { setStorageMsg("…"); const r = await fetch("/api/admin/init-storage", { method: "POST" }); setStorageMsg(r.ok ? "✓ Storage OK" : "Error"); }} style={{ background: "#0A1828", border: "1px solid #1E3A5A", color: "#8BA5B8", padding: "10px 20px", fontSize: "12px", cursor: "pointer", fontFamily: F }}>Init Storage Bucket</button>
                <button onClick={async () => { setMigrateMsg("…"); const r = await fetch("/api/admin/migrate", { method: "POST" }); const d = await r.json(); setMigrateMsg(d.allOk ? "✓ Migrations OK" : "Migrations complete (some may already exist)"); }} style={{ background: "#0A1828", border: "1px solid #1E3A5A", color: "#8BA5B8", padding: "10px 20px", fontSize: "12px", cursor: "pointer", fontFamily: F }}>Run DB Migrations</button>
              </div>
              {storageMsg && <p style={{ color: "#4AB87A", fontSize: "12px", marginBottom: "8px" }}>{storageMsg}</p>}
              {migrateMsg && <p style={{ color: "#4AB87A", fontSize: "12px" }}>{migrateMsg}</p>}
              <div style={{ background: "#0A1828", border: "1px solid #1E3A5A", padding: "20px 24px", marginTop: "24px" }}>
                <p style={{ color: "#4A90B8", fontSize: "11px", letterSpacing: "2px", marginBottom: "12px" }}>CLAIMS PENDING</p>
                <table style={tbl}>
                  <thead><tr>{["CHASSIS","USER","MESSAGE","DATE",""].map(h2 => <th key={h2} style={th}>{h2}</th>)}</tr></thead>
                  <tbody>
                    {claims.filter(c => c.status === "pending").map(c => (
                      <tr key={c.id} style={{ borderBottom: "1px solid #0D1E36" }}>
                        <td style={{ ...td, fontFamily: "monospace" }}>{c.chassis_number}</td>
                        <td style={{ ...td, color: "#8BA5B8" }}>{c.user_email}</td>
                        <td style={{ ...td, color: "#8BA5B8", maxWidth: "200px" }}>{c.message?.slice(0, 60)}…</td>
                        <td style={{ ...td, color: "#4A6A8A" }}>{new Date(c.created_at).toLocaleDateString()}</td>
                        <td style={td}>
                          <div style={{ display: "flex", gap: "6px" }}>
                            {claimResults[c.id]
                              ? <span style={{ color: claimResults[c.id] === "approved" ? "#4AB87A" : "#E07070", fontSize: "11px" }}>{claimResults[c.id].toUpperCase()}</span>
                              : <>
                                  <button onClick={async () => { await fetch("/api/admin/claims", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: c.id, status: "approved" }) }); setClaimResults(p => ({ ...p, [c.id]: "approved" })); }} style={{ background: "#0D2A1A", color: "#4AB87A", border: "1px solid #4AB87A", padding: "4px 10px", fontSize: "11px", cursor: "pointer", fontFamily: F }}>✓</button>
                                  <button onClick={async () => { await fetch("/api/admin/claims", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: c.id, status: "rejected" }) }); setClaimResults(p => ({ ...p, [c.id]: "rejected" })); }} style={{ background: "#2A0D0D", color: "#E07070", border: "1px solid #8A2A2A", padding: "4px 10px", fontSize: "11px", cursor: "pointer", fontFamily: F }}>✗</button>
                                </>
                            }
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
