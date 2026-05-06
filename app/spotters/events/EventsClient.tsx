"use client";
import Link from "next/link";
import { useState } from "react";
import AppHeader from "@/app/components/AppHeader";
import AppFooter from "@/app/components/AppFooter";

interface SpotterEvent {
  id: string;
  name: string;
  description: string;
  location_name: string;
  country: string;
  event_date: string;
  event_time: string;
  organizer_email: string;
}

interface Props {
  upcoming: SpotterEvent[];
  past: SpotterEvent[];
}

const COUNTRIES = [
  "Argentina","Australia","Austria","Belgium","Brazil","Canada","Chile","Denmark",
  "Finland","France","Germany","Greece","Hong Kong","Hungary","India","Ireland",
  "Italy","Japan","Malaysia","Mexico","Monaco","Netherlands","New Zealand","Norway",
  "Poland","Portugal","Saudi Arabia","Singapore","South Africa","South Korea","Spain",
  "Sweden","Switzerland","Taiwan","Thailand","United Arab Emirates","United Kingdom",
  "United States","Other"
];

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#0D1E36", border: "1px solid #1E3A5A",
  color: "#E2EEF7", padding: "12px 16px", fontSize: "14px",
  fontFamily: "Verdana, sans-serif", boxSizing: "border-box",
};

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export default function EventsClient({ upcoming, past }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", description: "", location_name: "", country: "",
    event_date: "", event_time: "", organizer_email: "",
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.location_name || !form.country || !form.event_date) {
      setError("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/spotter-events/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main style={{ background: "#080F1A", color: "#E2EEF7", fontFamily: "Verdana, sans-serif", minHeight: "100vh" }}>
      <AppHeader />

      {/* Header */}
      <section style={{ padding: "60px 40px 48px", borderBottom: "1px solid #1E3A5A" }}>
        <p style={{ color: "#4A90B8", letterSpacing: "3px", fontSize: "11px", marginBottom: "16px" }}>
          <Link href="/spotters" style={{ color: "#4A6A8A", textDecoration: "none" }}>SPOTTERS</Link>
          {" / "}EVENTS
        </p>
        <h1 style={{ fontSize: "42px", fontWeight: "bold", marginBottom: "16px" }}>Spotter Events</h1>
        <p style={{ color: "#8BA5B8", fontSize: "15px", maxWidth: "560px", lineHeight: "1.7" }}>
          Cars &amp; Coffee meetups, track days, and rallies where rare cars gather.
          Know of an event? Submit it for the community.
        </p>
      </section>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 40px" }}>

        {/* Upcoming events */}
        <h2 style={{ fontSize: "11px", letterSpacing: "3px", color: "#4A90B8", marginBottom: "20px" }}>UPCOMING EVENTS</h2>
        {upcoming.length === 0 ? (
          <div style={{ border: "1px solid #1E3A5A", padding: "48px", textAlign: "center", color: "#4A6A8A", marginBottom: "40px" }}>
            No upcoming events yet. Be the first to submit one.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "#1E3A5A", marginBottom: "40px" }}>
            {upcoming.map(ev => (
              <div key={ev.id} style={{ background: "#080F1A", padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "6px" }}>{ev.name}</h3>
                    <p style={{ color: "#8BA5B8", fontSize: "13px", marginBottom: "6px" }}>
                      {ev.location_name}{ev.country ? `, ${ev.country}` : ""}
                    </p>
                    {ev.description && <p style={{ color: "#4A6A8A", fontSize: "12px", lineHeight: "1.6" }}>{ev.description}</p>}
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ color: "#4A90B8", fontWeight: "bold", fontSize: "14px" }}>{formatDate(ev.event_date)}</div>
                    {ev.event_time && <div style={{ color: "#4A6A8A", fontSize: "12px", marginTop: "4px" }}>{ev.event_time}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submit event */}
        <div style={{ borderTop: "1px solid #1E3A5A", paddingTop: "40px", marginBottom: "40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "11px", letterSpacing: "3px", color: "#4A90B8" }}>SUBMIT AN EVENT</h2>
            {!showForm && !submitted && (
              <button onClick={() => setShowForm(true)} style={{ background: "#4A90B8", color: "#fff", border: "none", padding: "10px 20px", fontSize: "13px", cursor: "pointer", fontFamily: "Verdana, sans-serif", letterSpacing: "1px" }}>
                + Submit Event
              </button>
            )}
          </div>

          {submitted ? (
            <div style={{ background: "#0A1828", border: "1px solid #4AB87A", padding: "24px", color: "#4AB87A", fontSize: "14px" }}>
              Thank you! We will review your submission within 48 hours.
            </div>
          ) : showForm && (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", color: "#8BA5B8", fontSize: "11px", letterSpacing: "2px", marginBottom: "8px" }}>EVENT NAME *</label>
                  <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Cars & Coffee Monaco" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", color: "#8BA5B8", fontSize: "11px", letterSpacing: "2px", marginBottom: "8px" }}>DATE *</label>
                  <input type="date" value={form.event_date} onChange={e => set("event_date", e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", color: "#8BA5B8", fontSize: "11px", letterSpacing: "2px", marginBottom: "8px" }}>LOCATION *</label>
                  <input value={form.location_name} onChange={e => set("location_name", e.target.value)} placeholder="Principality of Monaco" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", color: "#8BA5B8", fontSize: "11px", letterSpacing: "2px", marginBottom: "8px" }}>COUNTRY *</label>
                  <select value={form.country} onChange={e => set("country", e.target.value)} style={inputStyle}>
                    <option value="">Select country…</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", color: "#8BA5B8", fontSize: "11px", letterSpacing: "2px", marginBottom: "8px" }}>TIME</label>
                  <input value={form.event_time} onChange={e => set("event_time", e.target.value)} placeholder="09:00 – 12:00" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", color: "#8BA5B8", fontSize: "11px", letterSpacing: "2px", marginBottom: "8px" }}>YOUR EMAIL</label>
                  <input type="email" value={form.organizer_email} onChange={e => set("organizer_email", e.target.value)} placeholder="organizer@example.com" style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={{ display: "block", color: "#8BA5B8", fontSize: "11px", letterSpacing: "2px", marginBottom: "8px" }}>DESCRIPTION</label>
                <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} placeholder="What cars are expected? Anything special about this event?" style={{ ...inputStyle, resize: "vertical" }} />
              </div>
              {error && <p style={{ color: "#E07070", fontSize: "13px" }}>{error}</p>}
              <button type="submit" disabled={submitting} style={{ background: submitting ? "#1E3A5A" : "#4A90B8", color: "#fff", border: "none", padding: "14px 28px", fontSize: "13px", cursor: submitting ? "not-allowed" : "pointer", fontFamily: "Verdana, sans-serif", letterSpacing: "1px", alignSelf: "flex-start" }}>
                {submitting ? "Submitting…" : "Submit for Review"}
              </button>
            </form>
          )}
        </div>

        {/* Past events */}
        {past.length > 0 && (
          <div style={{ borderTop: "1px solid #1E3A5A", paddingTop: "40px" }}>
            <h2 style={{ fontSize: "11px", letterSpacing: "3px", color: "#4A6A8A", marginBottom: "20px" }}>PAST EVENTS</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "#1E3A5A" }}>
              {past.map(ev => (
                <div key={ev.id} style={{ background: "#080F1A", padding: "16px 24px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                  <div>
                    <span style={{ fontSize: "13px", color: "#8BA5B8" }}>{ev.name}</span>
                    <span style={{ color: "#4A6A8A", fontSize: "12px", marginLeft: "12px" }}>{ev.location_name}{ev.country ? `, ${ev.country}` : ""}</span>
                  </div>
                  <span style={{ color: "#4A6A8A", fontSize: "12px" }}>{formatDate(ev.event_date)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AppFooter />
    </main>
  );
}
