"use client";
import Link from "next/link";
import { useState, useMemo } from "react";
import { colors } from "@/app/components/ui/tokens";

interface SpotterEvent {
  id: string;
  name: string;
  description: string;
  location_name: string;
  town?: string;
  country: string;
  event_date: string;
  event_time: string;
  organizer_email: string;
  host_name?: string;
  host_url?: string;
  event_url?: string;
  expected_makes?: string;
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
  background: colors.surface,
  border: `1px solid ${colors.border}`,
  color: colors.textPrimary,
  padding: '10px 14px',
  fontSize: '13px',
  fontFamily: 'Georgia, serif',
  boxSizing: 'border-box',
  outline: 'none',
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

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function EventCard({ ev }: { ev: SpotterEvent }) {
  return (
    <div style={{ background: colors.surface, padding: '24px', borderLeft: `3px solid ${colors.accent}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '6px' }}>{ev.name}</h3>
          <p style={{ color: colors.textSecondary, fontSize: '13px', marginBottom: '6px', fontFamily: 'Verdana, sans-serif' }}>
            {ev.town ? `${ev.town}, ` : ""}{ev.location_name}{ev.country ? `, ${ev.country}` : ""}
          </p>
          {ev.expected_makes && (
            <p style={{ color: colors.accentBlue, fontSize: '12px', marginBottom: '6px', fontFamily: 'Verdana, sans-serif' }}>
              {ev.expected_makes}
            </p>
          )}
          {ev.description && (
            <p style={{ color: colors.textMuted, fontSize: '12px', lineHeight: '1.6', marginBottom: '8px' }}>{ev.description}</p>
          )}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginTop: '8px' }}>
            {ev.host_name && (
              <span style={{ color: colors.textSecondary, fontSize: '12px', fontFamily: 'Verdana, sans-serif' }}>
                By{" "}
                {ev.host_url ? (
                  <a href={ev.host_url} target="_blank" rel="noopener noreferrer" style={{ color: colors.accentBlue, textDecoration: 'none' }}>{ev.host_name}</a>
                ) : ev.host_name}
              </span>
            )}
            {ev.event_url && (
              <a href={ev.event_url} target="_blank" rel="noopener noreferrer"
                style={{ color: colors.accentBlue, fontSize: '12px', textDecoration: 'none', border: `1px solid ${colors.border}`, padding: '3px 10px', fontFamily: 'Verdana, sans-serif' }}>
                View Event →
              </a>
            )}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ color: colors.accent, fontWeight: 'bold', fontSize: '14px', fontFamily: 'Verdana, sans-serif' }}>{formatDate(ev.event_date)}</div>
          {ev.event_time && <div style={{ color: colors.textMuted, fontSize: '12px', marginTop: '4px', fontFamily: 'Verdana, sans-serif' }}>{ev.event_time}</div>}
        </div>
      </div>
    </div>
  );
}

export default function EventsClient({ upcoming, past }: Props) {
  const allEvents = [...upcoming, ...past];

  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [townFilter, setTownFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", description: "", location_name: "", town: "", country: "",
    event_date: "", event_time: "", organizer_email: "",
    host_name: "", host_url: "", event_url: "", expected_makes: "",
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const availableCountries = useMemo(() => {
    const s = new Set(allEvents.map(e => e.country).filter(Boolean));
    return Array.from(s).sort();
  }, [allEvents]);

  const hasFilters = search || countryFilter || townFilter || fromDate || toDate;

  const filteredUpcoming = useMemo(() => {
    return upcoming.filter(ev => {
      if (countryFilter && ev.country !== countryFilter) return false;
      if (townFilter && !(ev.town || ev.location_name || "").toLowerCase().includes(townFilter.toLowerCase())) return false;
      if (fromDate && ev.event_date < fromDate) return false;
      if (toDate && ev.event_date > toDate) return false;
      if (search) {
        const q = search.toLowerCase();
        const haystack = [ev.name, ev.description, ev.expected_makes, ev.location_name, ev.host_name].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [upcoming, search, countryFilter, townFilter, fromDate, toDate]);

  const filteredPast = useMemo(() => {
    return past.filter(ev => {
      if (countryFilter && ev.country !== countryFilter) return false;
      if (townFilter && !(ev.town || ev.location_name || "").toLowerCase().includes(townFilter.toLowerCase())) return false;
      if (fromDate && ev.event_date < fromDate) return false;
      if (toDate && ev.event_date > toDate) return false;
      if (search) {
        const q = search.toLowerCase();
        const haystack = [ev.name, ev.description, ev.expected_makes, ev.location_name, ev.host_name].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [past, search, countryFilter, townFilter, fromDate, toDate]);

  const clearFilters = () => { setSearch(""); setCountryFilter(""); setTownFilter(""); setFromDate(""); setToDate(""); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.location_name || !form.country || !form.event_date || !form.host_name) {
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

  const fieldInput = (label: string, key: string, placeholder: string, required = false, type = "text") => (
    <div>
      <label style={labelStyle}>{label}{required ? " *" : ""}</label>
      <input type={type} value={(form as Record<string, string>)[key]} onChange={e => set(key, e.target.value)}
        placeholder={placeholder} style={{ ...inputStyle, width: "100%" }} />
    </div>
  );

  return (
    <main style={{ background: colors.bg, color: colors.textPrimary, fontFamily: 'Georgia, serif', minHeight: '100vh' }}>
      {/* Header */}
      <section style={{ padding: '60px 40px 48px', borderBottom: `1px solid ${colors.border}`, background: colors.surface }}>
        <p style={{ color: colors.accent, letterSpacing: '3px', fontSize: '11px', marginBottom: '16px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>
          <Link href="/spotters" style={{ color: colors.textMuted, textDecoration: 'none' }}>Spotters</Link>
          {" / "}Events
        </p>
        <h1 style={{ fontSize: '42px', fontWeight: 'bold', marginBottom: '16px' }}>Spotter Events</h1>
        <p style={{ color: colors.textSecondary, fontSize: '15px', maxWidth: '560px', lineHeight: '1.7' }}>
          Cars &amp; Coffee meetups, track days, and rallies where rare cars gather.
          Know of an event? Submit it for the community.
        </p>
      </section>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 40px' }}>

        {/* Filters */}
        <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, padding: '20px 24px', marginBottom: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={labelStyle}>Search</label>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ferrari, Cars & Coffee…"
                style={{ ...inputStyle, width: '100%' }} />
            </div>
            <div>
              <label style={labelStyle}>Town / City</label>
              <input value={townFilter} onChange={e => setTownFilter(e.target.value)} placeholder="Monaco, Maranello…"
                style={{ ...inputStyle, width: '100%' }} />
            </div>
            <div>
              <label style={labelStyle}>Country</label>
              <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)}
                style={{ ...inputStyle, width: '100%', color: countryFilter ? colors.textPrimary : colors.textMuted }}>
                <option value="">All countries</option>
                {availableCountries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>From Date</label>
              <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                style={{ ...inputStyle, width: '100%' }} />
            </div>
            <div>
              <label style={labelStyle}>To Date</label>
              <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                style={{ ...inputStyle, width: '100%' }} />
            </div>
          </div>
          {hasFilters && (
            <button onClick={clearFilters} style={{ background: 'none', border: `1px solid ${colors.border}`, color: colors.textMuted, padding: '6px 14px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Verdana, sans-serif', letterSpacing: '1px' }}>
              × Clear Filters
            </button>
          )}
        </div>

        {/* Upcoming events */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <h2 style={{ fontSize: '11px', letterSpacing: '3px', color: colors.accent, fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase', fontWeight: 'normal' }}>
            Upcoming Events {hasFilters ? `(${filteredUpcoming.length} of ${upcoming.length})` : `(${upcoming.length})`}
          </h2>
        </div>
        {filteredUpcoming.length === 0 ? (
          <div style={{ border: `1px solid ${colors.border}`, padding: '48px', textAlign: 'center', color: colors.textMuted, marginBottom: '40px', fontFamily: 'Verdana, sans-serif', fontSize: '13px' }}>
            {hasFilters ? "No events match your filters." : "No upcoming events yet. Be the first to submit one."}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: colors.border, marginBottom: '40px' }}>
            {filteredUpcoming.map(ev => <EventCard key={ev.id} ev={ev} />)}
          </div>
        )}

        {/* Submit event */}
        <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '40px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '11px', letterSpacing: '3px', color: colors.accent, fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase', fontWeight: 'normal' }}>Submit an Event</h2>
            {!showForm && !submitted && (
              <button onClick={() => setShowForm(true)} style={{ background: colors.accentNavy, color: '#FFFDF8', border: 'none', padding: '10px 20px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Verdana, sans-serif', letterSpacing: '1px', textTransform: 'uppercase' }}>
                + Submit Event
              </button>
            )}
          </div>

          {submitted ? (
            <div style={{ background: '#E8F4EC', border: `1px solid ${colors.success}`, padding: '24px', color: colors.success, fontSize: '14px', fontFamily: 'Verdana, sans-serif' }}>
              Thank you! We will review your submission within 48 hours.
            </div>
          ) : showForm && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {fieldInput("Event Name", "name", "Cars & Coffee Monaco", true)}
                {fieldInput("Date", "event_date", "", true, "date")}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                {fieldInput("Town / City", "town", "Monaco")}
                {fieldInput("Location / Venue", "location_name", "Port Hercule", true)}
                <div>
                  <label style={labelStyle}>Country *</label>
                  <select value={form.country} onChange={e => set("country", e.target.value)}
                    style={{ ...inputStyle, width: '100%', color: form.country ? colors.textPrimary : colors.textMuted }}>
                    <option value="">Select country…</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {fieldInput("Host Name", "host_name", "Monaco Supercar Club", true)}
                {fieldInput("Time", "event_time", "09:00 – 12:00")}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {fieldInput("Host Website", "host_url", "https://example.com")}
                {fieldInput("Event Page / Facebook / Instagram", "event_url", "https://facebook.com/event/...")}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {fieldInput("Expected Makes", "expected_makes", "Ferrari, Lamborghini, McLaren")}
                {fieldInput("Your Email", "organizer_email", "organizer@example.com", false, "email")}
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3}
                  placeholder="What's special about this event? What cars are expected?"
                  style={{ ...inputStyle, width: '100%', resize: 'vertical' }} />
              </div>
              {error && <p style={{ color: colors.error, fontSize: '13px', fontFamily: 'Verdana, sans-serif' }}>{error}</p>}
              <button type="submit" disabled={submitting}
                style={{ background: submitting ? colors.textMuted : colors.accentNavy, color: '#FFFDF8', border: 'none', padding: '14px 28px', fontSize: '11px', cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'Verdana, sans-serif', letterSpacing: '1px', textTransform: 'uppercase', alignSelf: 'flex-start' }}>
                {submitting ? 'Submitting…' : 'Submit for Review'}
              </button>
            </form>
          )}
        </div>

        {/* Past events */}
        {filteredPast.length > 0 && (
          <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '40px' }}>
            <h2 style={{ fontSize: '11px', letterSpacing: '3px', color: colors.textMuted, marginBottom: '20px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase', fontWeight: 'normal' }}>
              Past Events {hasFilters ? `(${filteredPast.length} of ${past.length})` : `(${past.length})`}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: colors.border }}>
              {filteredPast.map(ev => <EventCard key={ev.id} ev={ev} />)}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
