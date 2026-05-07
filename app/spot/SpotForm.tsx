"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import AppHeader from "@/app/components/AppHeader";
import AppFooter from "@/app/components/AppFooter";
import { createSupabaseBrowserClient } from "@/lib/supabase";

const COUNTRIES = [
  "Argentina","Australia","Austria","Belgium","Brazil","Canada","Chile","China","Colombia",
  "Czech Republic","Denmark","Finland","France","Germany","Greece","Hong Kong","Hungary",
  "India","Indonesia","Ireland","Israel","Italy","Japan","Malaysia","Mexico","Monaco",
  "Netherlands","New Zealand","Norway","Poland","Portugal","Saudi Arabia","Singapore",
  "South Africa","South Korea","Spain","Sweden","Switzerland","Taiwan","Thailand",
  "United Arab Emirates","United Kingdom","United States","Uruguay","Other"
];

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#0D1E36", border: "1px solid #1E3A5A",
  color: "#E2EEF7", padding: "12px 16px", fontSize: "14px",
  fontFamily: "Verdana, sans-serif", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block", color: "#8BA5B8", fontSize: "11px",
  letterSpacing: "2px", marginBottom: "8px",
};

export default function SpotForm() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [chassisList, setChassisList] = useState<string[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ confidence: number; status: string; auto_approved: boolean } | null>(null);
  const [dupWarning, setDupWarning] = useState<{ message: string; nearby_id: string; nearby_location: string } | null>(null);
  const [pendingPayload, setPendingPayload] = useState<Record<string, unknown> | null>(null);
  const [chassisQuery, setChassisQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    chassis_number: "",
    location_name: "",
    country: "",
    spotted_at: "",
    numberplate_seen: "",
    notes: "",
    chassis_visible: false,
  });

  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserEmail(user?.email ?? null));
  }, []);

  useEffect(() => {
    fetch("/api/sightings?chassis=all&limit=1")  // placeholder; fetch chassis list
      .catch(() => {});
    // Fetch known chassis from registry
    fetch("/api/chassis-thumbnails")
      .then(r => r.ok ? r.json() : {})
      .then((data: Record<string, string>) => setChassisList(Object.keys(data)))
      .catch(() => {});
  }, []);

  const filteredChassis = chassisQuery.length >= 3
    ? chassisList.filter(c => c.toLowerCase().includes(chassisQuery.toLowerCase())).slice(0, 8)
    : [];

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target;
    const val = target.type === "checkbox" ? (target as HTMLInputElement).checked : target.value;
    setForm(prev => ({ ...prev, [target.name]: val }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError("Photo must be under 10 MB."); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setError("JPEG, PNG, or WebP only."); return; }
    setError("");
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  async function uploadPhoto(file: File): Promise<string> {
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: upErr } = await supabase.storage.from("sightings-photos").upload(path, file, { contentType: file.type });
    if (upErr) throw new Error(upErr.message);
    const { data } = supabase.storage.from("sightings-photos").getPublicUrl(path);
    return data.publicUrl;
  }

  async function submit(overrideDuplicate = false) {
    setLoading(true);
    setError("");

    if (!form.chassis_number.trim()) { setError("Chassis number is required."); setLoading(false); return; }
    if (!photoFile && !overrideDuplicate) { setError("A photo is required."); setLoading(false); return; }
    if (!form.location_name.trim()) { setError("Location is required."); setLoading(false); return; }
    if (!form.country) { setError("Country is required."); setLoading(false); return; }
    if (!form.spotted_at) { setError("Date and time is required."); setLoading(false); return; }

    // Use GPS from browser or default to 0,0 — in real flow we'd use a geocoder
    // For now, we embed a hidden geocoding approach: country → approximate lat/lng
    const coords = countryCoords[form.country] || { lat: 0, lng: 0 };

    let photoUrl = "";
    if (photoFile) {
      setUploading(true);
      try {
        photoUrl = await uploadPhoto(photoFile);
      } catch (e: unknown) {
        setError("Photo upload failed: " + (e instanceof Error ? e.message : String(e)));
        setLoading(false);
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    const payload: Record<string, unknown> = {
      chassis_number: form.chassis_number.trim().toUpperCase(),
      spotter_email: userEmail || "anonymous",
      location_name: form.location_name.trim(),
      country: form.country,
      spotted_at: new Date(form.spotted_at).toISOString(),
      latitude: coords.lat,
      longitude: coords.lng,
      photo_url: photoUrl,
      numberplate_seen: form.numberplate_seen.trim() || null,
      notes: form.notes.trim() || null,
      chassis_visible: form.chassis_visible,
      confirmed_duplicate: overrideDuplicate,
    };
    if (overrideDuplicate && pendingPayload) {
      Object.assign(payload, { photo_url: pendingPayload.photo_url || photoUrl });
    }

    setPendingPayload(payload);

    try {
      const res = await fetch("/api/sightings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.status === 409 && data.duplicate_warning) {
        setDupWarning({ message: data.message, nearby_id: data.nearby_id, nearby_location: data.nearby_location });
        setLoading(false);
        return;
      }
      if (!res.ok) { setError(data.error || "Submission failed."); setLoading(false); return; }
      setResult({ confidence: data.confidence, status: data.status, auto_approved: data.auto_approved });
      setSubmitted(true);
    } catch (e: unknown) {
      setError("Network error: " + (e instanceof Error ? e.message : String(e)));
    }
    setLoading(false);
  }

  if (submitted && result) {
    return (
      <main style={{ background: "#080F1A", color: "#E2EEF7", fontFamily: "Verdana, sans-serif", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <AppHeader />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 20px" }}>
          <div style={{ textAlign: "center", maxWidth: "500px" }}>
            <div style={{ fontSize: "48px", marginBottom: "24px", color: result.auto_approved ? "#4AB87A" : "#B8944A" }}>
              {result.auto_approved ? "✓" : "⏳"}
            </div>
            <h1 style={{ fontSize: "26px", marginBottom: "16px" }}>Spotting Submitted!</h1>
            <div style={{ background: "#0A1828", border: "1px solid #1E3A5A", padding: "20px 24px", marginBottom: "24px" }}>
              <p style={{ color: "#8BA5B8", fontSize: "13px", marginBottom: "8px" }}>CONFIDENCE SCORE</p>
              <p style={{ fontSize: "32px", fontWeight: "bold", color: result.confidence >= 70 ? "#4AB87A" : result.confidence >= 40 ? "#B8944A" : "#E07070" }}>{result.confidence}/100</p>
              <p style={{ color: "#8BA5B8", fontSize: "13px", marginTop: "8px" }}>
                {result.auto_approved ? "Auto-verified — live immediately" :
                  result.status === "pending_community" ? "Needs 1 community confirmation" :
                    "Under admin review"}
              </p>
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/sightings" style={{ background: "#4A90B8", color: "#fff", padding: "12px 24px", textDecoration: "none", fontSize: "13px" }}>View Spottings</Link>
              <Link href="/spot" style={{ border: "1px solid #4A90B8", color: "#4A90B8", padding: "12px 24px", textDecoration: "none", fontSize: "13px" }}>Submit Another</Link>
            </div>
          </div>
        </div>
        <AppFooter />
      </main>
    );
  }

  return (
    <main style={{ background: "#080F1A", color: "#E2EEF7", fontFamily: "Verdana, sans-serif", minHeight: "100vh" }}>
      <AppHeader />
      <div className="vv-form-container">
        <p style={{ color: "#4A90B8", letterSpacing: "3px", fontSize: "11px", marginBottom: "16px" }}>CAR SPOTTER</p>
        <h1 style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "16px" }}>Submit a Spotting</h1>
        <p style={{ color: "#8BA5B8", lineHeight: "1.7", marginBottom: "48px" }}>
          Spotted a documented car in the wild? Log your spotting to build the global activity map.
          A photo is required. Higher-confidence spottings are verified faster.
        </p>

        {!userEmail && (
          <div style={{ background: "#2A1A0D", border: "1px solid #8A5A2A", padding: "16px 20px", marginBottom: "32px" }}>
            <p style={{ color: "#E0B87A", fontSize: "13px", margin: 0 }}>
              <Link href="/login" style={{ color: "#4A90B8" }}>Sign in</Link> for +5 confidence points and to build your spotter profile.
            </p>
          </div>
        )}

        {error && <div style={{ background: "#2A0D0D", border: "1px solid #8A2A2A", color: "#E07070", padding: "12px 16px", fontSize: "13px", marginBottom: "24px" }}>{error}</div>}

        {/* Duplicate warning */}
        {dupWarning && (
          <div style={{ background: "#2A1A0D", border: "1px solid #8A5A2A", padding: "20px 24px", marginBottom: "24px" }}>
            <p style={{ color: "#E0B87A", fontSize: "14px", marginBottom: "16px" }}>{dupWarning.message}</p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button onClick={() => { setDupWarning(null); submit(true); }}
                style={{ background: "#0D2A1A", color: "#4AB87A", border: "1px solid #4AB87A", padding: "10px 20px", fontSize: "13px", cursor: "pointer", fontFamily: "Verdana, sans-serif" }}>
                Yes, this is a new spotting
              </button>
              <button onClick={() => setDupWarning(null)}
                style={{ background: "none", border: "1px solid #1E3A5A", color: "#8BA5B8", padding: "10px 20px", fontSize: "13px", cursor: "pointer", fontFamily: "Verdana, sans-serif" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <form onSubmit={e => { e.preventDefault(); submit(false); }}>
          <h2 style={{ color: "#4A90B8", fontSize: "11px", letterSpacing: "3px", marginBottom: "24px", borderBottom: "1px solid #1E3A5A", paddingBottom: "12px" }}>PHOTO (REQUIRED)</h2>

          <div style={{ marginBottom: "32px" }}>
            <label style={{ display: "block", ...labelStyle, marginBottom: "16px" }}>UPLOAD PHOTO *</label>
            <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#0A1828", border: "1px solid #1E3A5A", color: "#8BA5B8", padding: "12px 24px", fontSize: "13px", cursor: "pointer", marginBottom: "12px" }}>
              {photoFile ? `✓ ${photoFile.name}` : "+ Choose Photo (JPEG, PNG, WebP — max 10 MB)"}
              <input ref={photoRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} style={{ display: "none" }} required />
            </label>
            {photoPreview && (
              <div style={{ marginTop: "12px" }}>
                <img src={photoPreview} alt="Preview" style={{ maxWidth: "300px", maxHeight: "200px", objectFit: "cover", border: "1px solid #1E3A5A" }} />
              </div>
            )}
          </div>

          <h2 style={{ color: "#4A90B8", fontSize: "11px", letterSpacing: "3px", marginBottom: "24px", borderBottom: "1px solid #1E3A5A", paddingBottom: "12px", marginTop: "40px" }}>VEHICLE</h2>

          <div style={{ marginBottom: "24px", position: "relative" }}>
            <label style={labelStyle}>CHASSIS NUMBER *</label>
            <input
              type="text"
              name="chassis_number"
              value={chassisQuery}
              onChange={e => {
                setChassisQuery(e.target.value);
                setForm(prev => ({ ...prev, chassis_number: e.target.value }));
                setShowSuggestions(true);
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Start typing chassis number..."
              autoComplete="off"
              style={inputStyle}
              required
            />
            {showSuggestions && filteredChassis.length > 0 && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#0A1828", border: "1px solid #1E3A5A", zIndex: 10, maxHeight: "200px", overflowY: "auto" }}>
                {filteredChassis.map(c => (
                  <div key={c}
                    onMouseDown={() => { setChassisQuery(c); setForm(prev => ({ ...prev, chassis_number: c })); setShowSuggestions(false); }}
                    style={{ padding: "10px 16px", cursor: "pointer", fontSize: "13px", fontFamily: "monospace" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#1E3A5A")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >{c}</div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginBottom: "24px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <input type="checkbox" id="chassis_visible" name="chassis_visible" checked={form.chassis_visible}
              onChange={handle} style={{ marginTop: "2px", accentColor: "#4A90B8", width: "16px", height: "16px", flexShrink: 0 }} />
            <label htmlFor="chassis_visible" style={{ color: "#8BA5B8", fontSize: "13px", cursor: "pointer", lineHeight: "1.5" }}>
              <strong style={{ color: "#E2EEF7" }}>+30 pts</strong> — The chassis number is visibly identifiable from this photo
            </label>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={labelStyle}>NUMBERPLATE SEEN (OPTIONAL) <span style={{ color: "#4A90B8" }}>+15 pts</span></label>
            <input type="text" name="numberplate_seen" value={form.numberplate_seen} onChange={handle}
              placeholder="e.g. GTO 1984" style={inputStyle} />
          </div>

          <h2 style={{ color: "#4A90B8", fontSize: "11px", letterSpacing: "3px", marginBottom: "24px", borderBottom: "1px solid #1E3A5A", paddingBottom: "12px", marginTop: "40px" }}>LOCATION & TIME</h2>

          <div style={{ marginBottom: "24px" }}>
            <label style={labelStyle}>CITY / LOCATION NAME *</label>
            <input type="text" name="location_name" value={form.location_name} onChange={handle}
              placeholder="e.g. Maranello, Via Abetone Inferiore" style={inputStyle} required />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={labelStyle}>COUNTRY *</label>
            <select name="country" value={form.country} onChange={handle} style={{ ...inputStyle, color: form.country ? "#E2EEF7" : "#4A6A8A" }} required>
              <option value="">Select country...</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={labelStyle}>DATE & TIME SPOTTED *</label>
            <input type="datetime-local" name="spotted_at" value={form.spotted_at} onChange={handle}
              style={{ ...inputStyle, colorScheme: "dark" }} required />
          </div>

          <h2 style={{ color: "#4A90B8", fontSize: "11px", letterSpacing: "3px", marginBottom: "24px", borderBottom: "1px solid #1E3A5A", paddingBottom: "12px", marginTop: "40px" }}>NOTES <span style={{ color: "#4A6A8A" }}>+10 pts</span></h2>

          <div style={{ marginBottom: "32px" }}>
            <label style={labelStyle}>ADDITIONAL NOTES (OPTIONAL)</label>
            <textarea name="notes" value={form.notes} onChange={handle}
              placeholder="Where exactly? Any interesting context? Was it being driven or parked?" rows={4}
              style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          {/* Confidence preview */}
          <ConfidencePreview
            hasPhoto={Boolean(photoFile)}
            chassisVisible={form.chassis_visible}
            hasPlate={Boolean(form.numberplate_seen.trim())}
            hasNotes={Boolean(form.notes.trim())}
            isLoggedIn={Boolean(userEmail)}
          />

          <button type="submit" disabled={loading || uploading}
            style={{ background: loading ? "#2A4A6A" : "#4A90B8", color: "#fff", padding: "16px 40px", fontSize: "15px", border: "none", cursor: loading ? "not-allowed" : "pointer", fontFamily: "Verdana, sans-serif", width: "100%", marginTop: "32px" }}>
            {uploading ? "UPLOADING PHOTO..." : loading ? "SUBMITTING..." : "SUBMIT SPOTTING"}
          </button>
        </form>
      </div>
      <AppFooter />
    </main>
  );
}

function ConfidencePreview({ hasPhoto, chassisVisible, hasPlate, hasNotes, isLoggedIn }: {
  hasPhoto: boolean; chassisVisible: boolean; hasPlate: boolean; hasNotes: boolean; isLoggedIn: boolean;
}) {
  const score = (hasPhoto ? 40 : 0) + (chassisVisible ? 30 : 0) + (hasPlate ? 15 : 0) + (hasNotes ? 10 : 0) + (isLoggedIn ? 5 : 0);
  const color = score >= 70 ? "#4AB87A" : score >= 40 ? "#B8944A" : "#E07070";
  const label = score >= 70 ? "Auto-verified" : score >= 40 ? "Community review" : "Admin review";

  return (
    <div style={{ background: "#0A1828", border: "1px solid #1E3A5A", padding: "20px 24px", marginBottom: "8px" }}>
      <p style={{ color: "#8BA5B8", fontSize: "11px", letterSpacing: "2px", marginBottom: "12px" }}>CONFIDENCE SCORE PREVIEW</p>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "12px" }}>
        <span style={{ fontSize: "36px", fontWeight: "bold", color }}>{score}</span>
        <div>
          <p style={{ color, fontSize: "13px", marginBottom: "2px" }}>{label}</p>
          <p style={{ color: "#4A6A8A", fontSize: "12px" }}>{score >= 70 ? "Will go live immediately" : score >= 40 ? "1 community upvote needed" : "Admin will review within 48h"}</p>
        </div>
      </div>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {[
          { pts: 40, earned: hasPhoto, label: "Photo" },
          { pts: 30, earned: chassisVisible, label: "Chassis visible" },
          { pts: 15, earned: hasPlate, label: "Plate" },
          { pts: 10, earned: hasNotes, label: "Notes" },
          { pts: 5, earned: isLoggedIn, label: "Signed in" },
        ].map(item => (
          <span key={item.label} style={{ padding: "3px 10px", fontSize: "11px", background: item.earned ? "#0D2A1A" : "#0D1E36", color: item.earned ? "#4AB87A" : "#4A6A8A", border: `1px solid ${item.earned ? "#1E5A3A" : "#1E3A5A"}` }}>
            {item.earned ? "✓" : "+"}{item.pts} {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// Approximate country centroids for lat/lng
const countryCoords: Record<string, { lat: number; lng: number }> = {
  "Argentina": { lat: -34.61, lng: -58.38 }, "Australia": { lat: -25.27, lng: 133.77 },
  "Austria": { lat: 47.80, lng: 13.03 }, "Belgium": { lat: 50.50, lng: 4.46 },
  "Brazil": { lat: -14.24, lng: -51.93 }, "Canada": { lat: 56.13, lng: -106.35 },
  "Chile": { lat: -35.68, lng: -71.54 }, "China": { lat: 35.86, lng: 104.20 },
  "Colombia": { lat: 4.57, lng: -74.30 }, "Czech Republic": { lat: 49.82, lng: 15.47 },
  "Denmark": { lat: 56.26, lng: 9.50 }, "Finland": { lat: 61.92, lng: 25.74 },
  "France": { lat: 46.23, lng: 2.21 }, "Germany": { lat: 51.17, lng: 10.45 },
  "Greece": { lat: 39.07, lng: 21.82 }, "Hong Kong": { lat: 22.32, lng: 114.17 },
  "Hungary": { lat: 47.16, lng: 19.50 }, "India": { lat: 20.59, lng: 78.96 },
  "Indonesia": { lat: -0.79, lng: 113.92 }, "Ireland": { lat: 53.41, lng: -8.24 },
  "Israel": { lat: 31.05, lng: 34.85 }, "Italy": { lat: 41.87, lng: 12.57 },
  "Japan": { lat: 36.20, lng: 138.25 }, "Malaysia": { lat: 4.21, lng: 108.00 },
  "Mexico": { lat: 23.63, lng: -102.55 }, "Monaco": { lat: 43.73, lng: 7.41 },
  "Netherlands": { lat: 52.13, lng: 5.29 }, "New Zealand": { lat: -40.90, lng: 174.89 },
  "Norway": { lat: 60.47, lng: 8.47 }, "Poland": { lat: 51.92, lng: 19.15 },
  "Portugal": { lat: 39.40, lng: -8.22 }, "Saudi Arabia": { lat: 23.89, lng: 45.08 },
  "Singapore": { lat: 1.35, lng: 103.82 }, "South Africa": { lat: -30.56, lng: 22.94 },
  "South Korea": { lat: 35.91, lng: 127.77 }, "Spain": { lat: 40.46, lng: -3.74 },
  "Sweden": { lat: 60.13, lng: 18.64 }, "Switzerland": { lat: 46.82, lng: 8.23 },
  "Taiwan": { lat: 23.70, lng: 121.00 }, "Thailand": { lat: 15.87, lng: 100.99 },
  "United Arab Emirates": { lat: 23.42, lng: 53.85 }, "United Kingdom": { lat: 55.38, lng: -3.44 },
  "United States": { lat: 37.09, lng: -95.71 }, "Uruguay": { lat: -32.52, lng: -55.77 },
  "Other": { lat: 0, lng: 0 },
};
