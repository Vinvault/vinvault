"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import "leaflet/dist/leaflet.css";

const VinLookupMapInner = dynamic(() => import("./VinLookupMapInner"), {
  ssr: false,
  loading: () => <div style={{ width: "100%", height: "500px", background: "#0A1828", display: "flex", alignItems: "center", justifyContent: "center", color: "#4A6A8A" }}>Loading map...</div>,
});

interface VinService {
  id: string;
  service_name: string;
  country_name: string;
  country_code: string;
  service_url: string;
  description?: string;
  service_type: string;
  is_free: boolean;
  latitude?: number;
  longitude?: number;
}

interface Props {
  services: VinService[];
}

const SERVICE_TYPES = ["government", "commercial", "nonprofit", "community"];

export default function VinLookupClient({ services }: Props) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");
  const [form, setForm] = useState({
    service_name: "",
    country_name: "",
    country_code: "",
    service_url: "",
    description: "",
    service_type: "government",
    is_free: true,
    submitted_by: "",
  });

  const filtered = useMemo(() => {
    return services.filter(s => {
      if (typeFilter && s.service_type !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return s.country_name.toLowerCase().includes(q) ||
          s.service_name.toLowerCase().includes(q) ||
          (s.description?.toLowerCase().includes(q) ?? false);
      }
      return true;
    });
  }, [services, search, typeFilter]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMsg("");
    try {
      const res = await fetch("/api/vin-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSubmitMsg("Thank you! Your submission is pending review.");
        setForm({ service_name: "", country_name: "", country_code: "", service_url: "", description: "", service_type: "government", is_free: true, submitted_by: "" });
      } else {
        setSubmitMsg("Something went wrong. Please try again.");
      }
    } catch {
      setSubmitMsg("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  }

  const inputStyle = { background: "#0D1E36", border: "1px solid #1E3A5A", color: "#E2EEF7", padding: "10px 16px", fontSize: "14px", fontFamily: "Verdana, sans-serif", outline: "none", width: "100%", boxSizing: "border-box" as const };
  const labelStyle = { color: "#8BA5B8", fontSize: "12px", letterSpacing: "1px", display: "block" as const, marginBottom: "6px" };

  return (
    <main style={{ background: "#080F1A", color: "#E2EEF7", fontFamily: "Verdana, sans-serif", minHeight: "100vh" }}>
      {/* Header */}
      <section className="vv-registry-header">
        <p style={{ color: "#4A90B8", letterSpacing: "3px", fontSize: "11px", marginBottom: "16px" }}>VEHICLE HISTORY RESOURCES</p>
        <h1 style={{ fontSize: "42px", fontWeight: "bold", marginBottom: "16px" }}>VIN Lookup Directory</h1>
        <p style={{ color: "#8BA5B8", fontSize: "16px", maxWidth: "620px", lineHeight: "1.7" }}>
          Official and community-vetted vehicle registration lookup services by country. {services.length} services across {new Set(services.map(s => s.country_code)).size} countries.
        </p>
      </section>

      {/* Map */}
      <section style={{ borderBottom: "1px solid #1E3A5A" }}>
        <VinLookupMapInner services={services.filter(s => s.latitude && s.longitude)} height={500} />
      </section>

      {/* Legend */}
      <section style={{ padding: "16px 40px", borderBottom: "1px solid #1E3A5A", display: "flex", gap: "24px", flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ color: "#4A6A8A", fontSize: "12px" }}>MAP LEGEND:</span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "12px", height: "12px", background: "#4AB87A", border: "2px solid #fff", borderRadius: "50%" }} />
          <span style={{ color: "#8BA5B8", fontSize: "12px" }}>Free service</span>
        </div>
      </section>

      {/* Filters */}
      <section className="vv-registry-filters">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by country or service..."
          style={{ background: "#0D1E36", border: "1px solid #1E3A5A", color: "#E2EEF7", padding: "10px 16px", fontSize: "14px", width: "260px", fontFamily: "Verdana, sans-serif", outline: "none" }}
        />
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          style={{ background: "#0D1E36", border: "1px solid #1E3A5A", color: "#8BA5B8", padding: "10px 16px", fontSize: "14px", fontFamily: "Verdana, sans-serif" }}
        >
          <option value="">All Types</option>
          {SERVICE_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
        <span style={{ marginLeft: "auto", color: "#4A6A8A", fontSize: "13px" }}>{filtered.length} of {services.length} services</span>
      </section>

      {/* Services table */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px" }}>
        {filtered.length === 0 ? (
          <p style={{ color: "#4A6A8A", padding: "40px 0" }}>No services match your filters.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1E3A5A", color: "#4A90B8", fontSize: "11px", letterSpacing: "2px", textAlign: "left" }}>
                  <th style={{ padding: "14px 12px" }}>COUNTRY</th>
                  <th style={{ padding: "14px 12px" }}>SERVICE</th>
                  <th style={{ padding: "14px 12px" }}>TYPE</th>
                  <th style={{ padding: "14px 12px" }}>LINK</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} style={{ borderBottom: "1px solid #0D1E36" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#0A1828")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <td style={{ padding: "14px 12px", fontSize: "13px", fontWeight: "bold" }}>
                      <span style={{ color: "#8BA5B8" }}>{s.country_code}</span>
                      <span style={{ color: "#4A6A8A", fontSize: "11px", display: "block" }}>{s.country_name}</span>
                    </td>
                    <td style={{ padding: "14px 12px" }}>
                      <p style={{ fontSize: "13px", marginBottom: s.description ? "4px" : 0 }}>{s.service_name}</p>
                      {s.description && <p style={{ color: "#4A6A8A", fontSize: "11px", lineHeight: "1.4", maxWidth: "360px" }}>{s.description}</p>}
                    </td>
                    <td style={{ padding: "14px 12px" }}>
                      <span style={{ background: "#0D1E36", color: "#4A6A8A", padding: "3px 10px", fontSize: "11px" }}>{s.service_type}</span>
                    </td>
                    <td style={{ padding: "14px 12px" }}>
                      <a href={s.service_url} target="_blank" rel="noopener noreferrer"
                        style={{ color: "#4A90B8", fontSize: "12px", textDecoration: "none", border: "1px solid #1E3A5A", padding: "5px 12px", whiteSpace: "nowrap" }}>
                        Visit →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Community submission form */}
        <div style={{ marginTop: "64px", borderTop: "1px solid #1E3A5A", paddingTop: "48px" }}>
          <p style={{ color: "#4A90B8", letterSpacing: "3px", fontSize: "11px", marginBottom: "8px" }}>COMMUNITY CONTRIBUTION</p>
          <h2 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "8px" }}>Know a service we&apos;re missing?</h2>
          <p style={{ color: "#8BA5B8", fontSize: "14px", lineHeight: "1.7", marginBottom: "32px" }}>
            Submit a VIN or registration lookup service for your country. All submissions are reviewed before publishing.
          </p>

          <form onSubmit={handleSubmit} style={{ maxWidth: "600px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={labelStyle}>COUNTRY NAME *</label>
                <input required value={form.country_name} onChange={e => setForm(p => ({ ...p, country_name: e.target.value }))} placeholder="e.g. Portugal" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>COUNTRY CODE *</label>
                <input required maxLength={3} value={form.country_code} onChange={e => setForm(p => ({ ...p, country_code: e.target.value.toUpperCase() }))} placeholder="e.g. PT" style={inputStyle} />
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>SERVICE NAME *</label>
              <input required value={form.service_name} onChange={e => setForm(p => ({ ...p, service_name: e.target.value }))} placeholder="e.g. Instituto da Mobilidade e dos Transportes" style={inputStyle} />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>SERVICE URL *</label>
              <input required type="url" value={form.service_url} onChange={e => setForm(p => ({ ...p, service_url: e.target.value }))} placeholder="https://..." style={inputStyle} />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>DESCRIPTION</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Briefly describe what this service provides..." rows={3}
                style={{ ...inputStyle, resize: "vertical" as const }} />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>SERVICE TYPE</label>
              <select value={form.service_type} onChange={e => setForm(p => ({ ...p, service_type: e.target.value }))}
                style={{ ...inputStyle, color: "#8BA5B8" }}>
                {SERVICE_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={labelStyle}>YOUR EMAIL (OPTIONAL)</label>
              <input type="email" value={form.submitted_by} onChange={e => setForm(p => ({ ...p, submitted_by: e.target.value }))} placeholder="For follow-up questions only" style={inputStyle} />
            </div>

            <button type="submit" disabled={submitting}
              style={{ background: "#4A90B8", color: "#fff", padding: "12px 32px", border: "none", fontSize: "14px", cursor: submitting ? "not-allowed" : "pointer", fontFamily: "Verdana, sans-serif", letterSpacing: "1px", opacity: submitting ? 0.7 : 1 }}>
              {submitting ? "Submitting..." : "Submit for Review"}
            </button>
            {submitMsg && (
              <p style={{ marginTop: "16px", color: submitMsg.includes("Thank") ? "#4AB87A" : "#E07070", fontSize: "13px" }}>
                {submitMsg}
              </p>
            )}
          </form>
        </div>
      </div>

    </main>
  );
}
