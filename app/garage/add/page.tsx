"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { colors } from "@/app/components/ui/tokens";

interface Make { id: string; name: string; }

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", border: `1px solid ${colors.border}`,
  background: "#FFFDF8", fontFamily: "Georgia, serif", fontSize: "14px",
  color: colors.textPrimary, outline: "none", boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontFamily: "Verdana, sans-serif", fontSize: "10px",
  letterSpacing: "1px", textTransform: "uppercase", color: colors.textMuted,
  marginBottom: "6px",
};
const lockNote: React.CSSProperties = {
  fontSize: "10px", color: colors.textMuted, fontFamily: "Verdana, sans-serif",
  marginTop: "4px",
};

export default function AddGarageCarPage() {
  const router = useRouter();
  const [makes, setMakes] = useState<Make[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMakeRequest, setShowMakeRequest] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    make_id: "", make_name: "", unverified_make: "", model: "", submodel: "",
    year: "", color: "", vin: "", mileage: "", mileage_unit: "km",
    purchase_date: "", purchase_price: "", numberplate: "", notes: "", status: "current",
  });
  const [makeRequest, setMakeRequest] = useState({
    make_name: "", model_name: "", year: "", reason: "", description: "", production_numbers: "", source_url: "",
  });
  const [makeRequestSent, setMakeRequestSent] = useState(false);

  useEffect(() => {
    async function loadMakes() {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.from("makes").select("id,name").order("name");
      setMakes(data ?? []);
    }
    loadMakes();
  }, []);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const selectedMake = makes.find(m => m.id === form.make_id);
    const payload = {
      ...form,
      make_name: selectedMake?.name || form.make_name,
      year: form.year ? Number(form.year) : null,
      mileage: form.mileage ? Number(form.mileage) : null,
      purchase_price: form.purchase_price ? Number(form.purchase_price) : null,
    };

    const res = await fetch("/api/garage/cars", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const car = await res.json();
      router.push(`/garage/${car.id}/edit`);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to add car");
      setLoading(false);
    }
  }

  async function handleMakeRequest(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/garage/request-make", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(makeRequest),
    });
    if (res.ok) setMakeRequestSent(true);
  }

  return (
    <main style={{ background: colors.bg, minHeight: "100vh", color: colors.textPrimary }}>
      <nav aria-label="Breadcrumb" style={{ padding: "14px 40px", background: colors.surface, borderBottom: `1px solid ${colors.border}`, fontSize: "12px", color: colors.textMuted, display: "flex", gap: "6px", fontFamily: "Verdana, sans-serif" }}>
        <Link href="/" style={{ color: colors.textMuted, textDecoration: "none" }}>Home</Link>
        <span>/</span>
        <Link href="/profile" style={{ color: colors.textMuted, textDecoration: "none" }}>Profile</Link>
        <span>/</span>
        <span style={{ color: colors.textSecondary }}>Add a Car</span>
      </nav>

      <div className="vv-page-container" style={{ maxWidth: "680px" }}>
        <p style={{ color: colors.accent, letterSpacing: "3px", fontSize: "11px", marginBottom: "12px", fontFamily: "Verdana, sans-serif", textTransform: "uppercase" }}>My Garage</p>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "8px", fontFamily: "Georgia, serif" }}>Add a Car</h1>
        <p style={{ color: colors.textSecondary, fontSize: "14px", marginBottom: "40px", fontFamily: "Georgia, serif" }}>Add a car to your personal collection.</p>

        {!showMakeRequest ? (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Make */}
            <div>
              <label style={labelStyle}>Make *</label>
              <select
                value={form.make_id}
                onChange={e => {
                  if (e.target.value === "__custom__") { setShowMakeRequest(true); return; }
                  const m = makes.find(mk => mk.id === e.target.value);
                  set("make_id", e.target.value);
                  set("make_name", m?.name || "");
                }}
                style={inputStyle}
                required={!form.make_id && !form.unverified_make}
              >
                <option value="">Select a make…</option>
                {makes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                <option value="__custom__">My car&apos;s make isn&apos;t listed →</option>
              </select>
            </div>

            {/* Model */}
            <div>
              <label style={labelStyle}>Model *</label>
              <input style={inputStyle} value={form.model} onChange={e => set("model", e.target.value)} placeholder="e.g. 911 Turbo" required />
            </div>

            {/* Submodel */}
            <div>
              <label style={labelStyle}>Submodel / Edition</label>
              <input style={inputStyle} value={form.submodel} onChange={e => set("submodel", e.target.value)} placeholder="e.g. S, Carrera 4S, Final Edition" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Year</label>
                <input style={inputStyle} type="number" value={form.year} onChange={e => set("year", e.target.value)} placeholder="e.g. 1995" min="1886" max="2030" />
              </div>
              <div>
                <label style={labelStyle}>Color</label>
                <input style={inputStyle} value={form.color} onChange={e => set("color", e.target.value)} placeholder="e.g. Rosso Corsa" />
              </div>
            </div>

            <div>
              <label style={labelStyle}>VIN / Chassis Number</label>
              <input style={inputStyle} value={form.vin} onChange={e => set("vin", e.target.value)} placeholder="e.g. ZFFJA09B000061234" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "12px", alignItems: "end" }}>
              <div>
                <label style={labelStyle}>Mileage</label>
                <input style={inputStyle} type="number" value={form.mileage} onChange={e => set("mileage", e.target.value)} placeholder="e.g. 45000" />
              </div>
              <div>
                <label style={labelStyle}>Unit</label>
                <select style={{ ...inputStyle, width: "80px" }} value={form.mileage_unit} onChange={e => set("mileage_unit", e.target.value)}>
                  <option value="km">km</option>
                  <option value="mi">mi</option>
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Status</label>
              <select style={inputStyle} value={form.status} onChange={e => set("status", e.target.value)}>
                <option value="current">Current Owner</option>
                <option value="previous">Previous Owner</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Purchase Date <span style={{ color: colors.textMuted }}>🔒 Private</span></label>
              <input style={inputStyle} type="date" value={form.purchase_date} onChange={e => set("purchase_date", e.target.value)} />
              <p style={lockNote}>Only visible to you</p>
            </div>

            <div>
              <label style={labelStyle}>Purchase Price <span style={{ color: colors.textMuted }}>🔒 Private</span></label>
              <input style={inputStyle} type="number" value={form.purchase_price} onChange={e => set("purchase_price", e.target.value)} placeholder="e.g. 85000" />
              <p style={lockNote}>Only visible to you</p>
            </div>

            <div>
              <label style={labelStyle}>Current Numberplate <span style={{ color: colors.textMuted }}>🔒 Private</span></label>
              <input style={inputStyle} value={form.numberplate} onChange={e => set("numberplate", e.target.value)} placeholder="e.g. AB 12345" />
              <p style={lockNote}>Only visible to you</p>
            </div>

            <div>
              <label style={labelStyle}>Notes <span style={{ color: colors.textMuted }}>🔒 Private</span></label>
              <textarea style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Service history, modifications, story…" />
              <p style={lockNote}>Only visible to you</p>
            </div>

            {error && <p style={{ color: colors.error, fontFamily: "Verdana, sans-serif", fontSize: "13px" }}>{error}</p>}

            <div style={{ display: "flex", gap: "16px", paddingTop: "8px" }}>
              <button type="submit" disabled={loading} style={{ background: colors.accent, color: "#1A1A1A", padding: "13px 32px", border: "none", cursor: "pointer", fontFamily: "Verdana, sans-serif", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", opacity: loading ? 0.7 : 1 }}>
                {loading ? "Adding…" : "Add to My Garage"}
              </button>
              <Link href="/profile" style={{ color: colors.textSecondary, textDecoration: "none", fontFamily: "Verdana, sans-serif", fontSize: "12px", display: "flex", alignItems: "center" }}>Cancel</Link>
            </div>
          </form>
        ) : makeRequestSent ? (
          <div style={{ background: "#E8F4EC", border: `1px solid ${colors.success}`, padding: "32px", textAlign: "center" }}>
            <p style={{ color: colors.success, fontFamily: "Georgia, serif", fontSize: "16px", marginBottom: "8px" }}>Request submitted!</p>
            <p style={{ color: colors.textSecondary, fontFamily: "Georgia, serif", fontSize: "14px", marginBottom: "20px" }}>We will review it within 48 hours and notify you by email.</p>
            <button onClick={() => { setShowMakeRequest(false); setMakeRequestSent(false); }} style={{ background: "none", border: `1px solid ${colors.accent}`, color: colors.accent, padding: "10px 24px", cursor: "pointer", fontFamily: "Verdana, sans-serif", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase" }}>
              Back to Add Car
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "20px", margin: 0 }}>Request a Make</h2>
              <button onClick={() => setShowMakeRequest(false)} style={{ background: "none", border: "none", cursor: "pointer", color: colors.textMuted, fontFamily: "Verdana, sans-serif", fontSize: "12px" }}>← Back</button>
            </div>
            <p style={{ color: colors.textSecondary, fontFamily: "Georgia, serif", fontSize: "14px", marginBottom: "32px", lineHeight: "1.7" }}>
              VinVault focuses on rare and collectible vehicles. Submit a request and we will review within 48 hours.
            </p>
            <form onSubmit={handleMakeRequest} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={labelStyle}>Make Name *</label>
                <input style={inputStyle} value={makeRequest.make_name} onChange={e => setMakeRequest(r => ({ ...r, make_name: e.target.value }))} required />
              </div>
              <div>
                <label style={labelStyle}>Model Name *</label>
                <input style={inputStyle} value={makeRequest.model_name} onChange={e => setMakeRequest(r => ({ ...r, model_name: e.target.value }))} required />
              </div>
              <div>
                <label style={labelStyle}>Year</label>
                <input style={inputStyle} type="number" value={makeRequest.year} onChange={e => setMakeRequest(r => ({ ...r, year: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Why does this qualify for VinVault? *</label>
                {[
                  { v: "final_edition", l: 'Final/limited edition (e.g. "Final Edition", "STI Special")' },
                  { v: "homologation", l: "Homologation special" },
                  { v: "low_production", l: "Low production numbers (under 5,000)" },
                  { v: "collector_value", l: "High collector value" },
                  { v: "historically_significant", l: "Historically significant" },
                  { v: "other", l: "Other (describe below)" },
                ].map(opt => (
                  <label key={opt.v} style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "8px", fontFamily: "Georgia, serif", fontSize: "14px", cursor: "pointer" }}>
                    <input type="radio" name="reason" value={opt.v} checked={makeRequest.reason === opt.v} onChange={e => setMakeRequest(r => ({ ...r, reason: e.target.value }))} style={{ marginTop: "3px" }} required />
                    {opt.l}
                  </label>
                ))}
              </div>
              <div>
                <label style={labelStyle}>Description / Reason</label>
                <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} value={makeRequest.description} onChange={e => setMakeRequest(r => ({ ...r, description: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Approximate Production Numbers</label>
                <input style={inputStyle} value={makeRequest.production_numbers} onChange={e => setMakeRequest(r => ({ ...r, production_numbers: e.target.value }))} placeholder="e.g. 272 units" />
              </div>
              <div>
                <label style={labelStyle}>Source / Reference URL</label>
                <input style={inputStyle} type="url" value={makeRequest.source_url} onChange={e => setMakeRequest(r => ({ ...r, source_url: e.target.value }))} placeholder="https://…" />
              </div>
              <button type="submit" style={{ background: colors.accent, color: "#1A1A1A", padding: "13px 32px", border: "none", cursor: "pointer", fontFamily: "Verdana, sans-serif", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", alignSelf: "flex-start" }}>
                Submit Make Request
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
