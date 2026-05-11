"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { colors } from "@/app/components/ui/tokens";

interface Car {
  id: string; make_name: string; model: string; submodel: string | null;
  year: number | null; color: string | null; mileage: number | null; mileage_unit: string;
  vin: string | null;
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", border: `1px solid ${colors.border}`,
  background: "#FFFDF8", fontFamily: "Georgia, serif", fontSize: "14px",
  color: colors.textPrimary, outline: "none", boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontFamily: "Verdana, sans-serif", fontSize: "10px",
  letterSpacing: "1px", textTransform: "uppercase", color: colors.textMuted, marginBottom: "6px",
};

const CURRENCIES = ["EUR", "DKK", "SEK", "GBP", "USD"];

export default function SellCarPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    asking_price: "", currency: "EUR", mileage: "", location_city: "",
    location_country: "", description: "", contact_via: "platform",
  });

  const loadCar = useCallback(async () => {
    const res = await fetch(`/api/garage/cars/${id}`);
    if (!res.ok) { router.push("/profile"); return; }
    const data = await res.json();
    setCar(data);
    setForm(f => ({ ...f, mileage: data.mileage?.toString() || "" }));
    setLoading(false);
  }, [id, router]);

  useEffect(() => { loadCar(); }, [loadCar]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/garage/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ garage_car_id: id, ...form }),
    });

    if (res.ok) {
      const listing = await res.json();
      router.push(`/for-sale/${listing.id}`);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to create listing");
      setSubmitting(false);
    }
  }

  if (loading) return <main style={{ background: colors.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ fontFamily: "Georgia, serif", color: colors.textMuted }}>Loading…</p></main>;
  if (!car) return null;

  return (
    <main style={{ background: colors.bg, minHeight: "100vh", color: colors.textPrimary }}>
      <nav aria-label="Breadcrumb" style={{ padding: "14px 40px", background: colors.surface, borderBottom: `1px solid ${colors.border}`, fontSize: "12px", color: colors.textMuted, display: "flex", gap: "6px", fontFamily: "Verdana, sans-serif" }}>
        <Link href="/" style={{ color: colors.textMuted, textDecoration: "none" }}>Home</Link>
        <span>/</span>
        <Link href="/profile" style={{ color: colors.textMuted, textDecoration: "none" }}>Profile</Link>
        <span>/</span>
        <span style={{ color: colors.textSecondary }}>List for Sale</span>
      </nav>

      <div className="vv-page-container" style={{ maxWidth: "680px" }}>
        <p style={{ color: colors.accent, letterSpacing: "3px", fontSize: "11px", marginBottom: "12px", fontFamily: "Verdana, sans-serif", textTransform: "uppercase" }}>For Sale</p>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "4px", fontFamily: "Georgia, serif" }}>List for Sale</h1>
        <p style={{ color: colors.textSecondary, fontSize: "15px", marginBottom: "8px", fontFamily: "Georgia, serif" }}>{car.year && `${car.year} `}{car.make_name} {car.model}</p>
        <p style={{ color: colors.textMuted, fontSize: "13px", marginBottom: "40px", fontFamily: "Verdana, sans-serif" }}>Listing active for 30 days. You can renew or mark as sold at any time.</p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "12px", alignItems: "end" }}>
            <div>
              <label style={labelStyle}>Asking Price *</label>
              <input style={inputStyle} type="number" value={form.asking_price} onChange={e => set("asking_price", e.target.value)} required placeholder="e.g. 85000" />
            </div>
            <div>
              <label style={labelStyle}>Currency</label>
              <select style={{ ...inputStyle, width: "90px" }} value={form.currency} onChange={e => set("currency", e.target.value)}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "12px", alignItems: "end" }}>
            <div>
              <label style={labelStyle}>Mileage at Listing</label>
              <input style={inputStyle} type="number" value={form.mileage} onChange={e => set("mileage", e.target.value)} placeholder="e.g. 45000" />
            </div>
            <span style={{ fontFamily: "Verdana, sans-serif", fontSize: "12px", color: colors.textMuted, paddingBottom: "12px" }}>km</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={labelStyle}>City</label>
              <input style={inputStyle} value={form.location_city} onChange={e => set("location_city", e.target.value)} placeholder="e.g. Monaco" />
            </div>
            <div>
              <label style={labelStyle}>Country</label>
              <input style={inputStyle} value={form.location_country} onChange={e => set("location_country", e.target.value)} placeholder="e.g. France" />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...inputStyle, minHeight: "140px", resize: "vertical" }} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Full service history, one owner, no accidents…" />
          </div>

          <div>
            <label style={labelStyle}>Contact Preference</label>
            <div style={{ display: "flex", gap: "24px" }}>
              {[{ v: "platform", l: "Via VinVault only" }, { v: "email", l: "Show my email" }].map(opt => (
                <label key={opt.v} style={{ display: "flex", gap: "8px", alignItems: "center", fontFamily: "Georgia, serif", fontSize: "14px", cursor: "pointer" }}>
                  <input type="radio" name="contact" value={opt.v} checked={form.contact_via === opt.v} onChange={e => set("contact_via", e.target.value)} />
                  {opt.l}
                </label>
              ))}
            </div>
          </div>

          {error && <p style={{ color: colors.error, fontFamily: "Verdana, sans-serif", fontSize: "13px" }}>{error}</p>}

          <div style={{ display: "flex", gap: "16px", paddingTop: "8px" }}>
            <button type="submit" disabled={submitting} style={{ background: colors.accent, color: "#1A1A1A", padding: "13px 32px", border: "none", cursor: "pointer", fontFamily: "Verdana, sans-serif", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", opacity: submitting ? 0.7 : 1 }}>
              {submitting ? "Publishing…" : "Publish Listing"}
            </button>
            <Link href="/profile" style={{ color: colors.textSecondary, textDecoration: "none", fontFamily: "Verdana, sans-serif", fontSize: "12px", display: "flex", alignItems: "center" }}>Cancel</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
