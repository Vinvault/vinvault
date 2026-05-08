"use client";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

interface Make { id: string; name: string; }
interface Model { id: string; model: string; make: string; }

const COUNTRIES = [
  "Argentina","Australia","Austria","Belgium","Brazil","Canada","Chile","China","Colombia",
  "Czech Republic","Denmark","Finland","France","Germany","Greece","Hong Kong","Hungary",
  "India","Indonesia","Ireland","Israel","Italy","Japan","Malaysia","Mexico","Monaco",
  "Netherlands","New Zealand","Norway","Poland","Portugal","Saudi Arabia","Singapore",
  "South Africa","South Korea","Spain","Sweden","Switzerland","Taiwan","Thailand",
  "United Arab Emirates","United Kingdom","United States","Uruguay","Other"
];

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

const inp: React.CSSProperties = {
  width: "100%", background: "#0D1E36", border: "1px solid #1E3A5A",
  color: "#E2EEF7", padding: "12px 16px", fontSize: "15px",
  fontFamily: "Verdana, sans-serif", boxSizing: "border-box", outline: "none",
};
const lbl: React.CSSProperties = {
  display: "block", color: "#8BA5B8", fontSize: "11px", letterSpacing: "2px", marginBottom: "8px",
};
const section: React.CSSProperties = {
  color: "#4A90B8", fontSize: "11px", letterSpacing: "3px",
  borderBottom: "1px solid #1E3A5A", paddingBottom: "12px", marginBottom: "24px", marginTop: "40px",
};

export default function SpotForm() {
  const [user, setUser] = useState<{ email: string; username?: string } | null>(null);
  const [makes, setMakes] = useState<Make[]>([]);
  const [allModels, setAllModels] = useState<Model[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "loading" | "ok" | "denied">("idle");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ points: number; id: string; hasVin: boolean; firstBonus: boolean } | null>(null);
  const [dupWarning, setDupWarning] = useState<{ message: string; nearby_location: string } | null>(null);

  const [form, setForm] = useState({
    make_id: "",
    model_id: "",
    city: "",
    country: "",
    latitude: "",
    longitude: "",
    numberplate: "",
    chassis_number: "",
    notes: "",
  });

  const photoRef = useRef<HTMLInputElement>(null);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user?.email) return;
      try {
        const res = await fetch(`/api/admin/spotters?email=${encodeURIComponent(user.email)}`);
        const profiles = res.ok ? await res.json() : [];
        setUser({ email: user.email, username: profiles[0]?.username });
      } catch {
        setUser({ email: user.email });
      }
    });
    fetch("/api/admin/makes").then(r => r.ok ? r.json() : []).then(setMakes).catch(() => {});
    fetch("/api/admin/models").then(r => r.ok ? r.json() : []).then(setAllModels).catch(() => {});
  }, []);

  const filteredModels = form.make_id
    ? allModels.filter(m => {
        const selectedMake = makes.find(mk => mk.id === form.make_id);
        return selectedMake && m.make === selectedMake.name;
      })
    : [];

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(f => {
      const next = { ...f, [name]: value };
      if (name === "make_id") next.model_id = "";
      return next;
    });
  };

  const detectGPS = useCallback(() => {
    if (!navigator.geolocation) { setGpsStatus("denied"); return; }
    setGpsStatus("loading");
    navigator.geolocation.getCurrentPosition(
      pos => {
        setForm(f => ({ ...f, latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) }));
        setGpsStatus("ok");
      },
      () => setGpsStatus("denied"),
      { timeout: 10000 }
    );
  }, []);

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter(f =>
      f.size <= 10 * 1024 * 1024 && ["image/jpeg", "image/png", "image/webp"].includes(f.type)
    ).slice(0, 10);
    if (valid.length < files.length) setError("Some photos were skipped (max 10 MB each, JPEG/PNG/WebP only).");
    else setError("");
    setPhotos(valid);
    Promise.all(valid.map(f => new Promise<string>(resolve => {
      const r = new FileReader();
      r.onload = ev => resolve(ev.target?.result as string);
      r.readAsDataURL(f);
    }))).then(setPhotoPreviews);
  };

  const removePhoto = (i: number) => {
    setPhotos(ps => ps.filter((_, j) => j !== i));
    setPhotoPreviews(ps => ps.filter((_, j) => j !== i));
  };

  async function uploadPhoto(file: File): Promise<string> {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: upErr } = await supabase.storage.from("sightings-photos").upload(path, file, { contentType: file.type });
    if (upErr) throw new Error(upErr.message);
    return supabase.storage.from("sightings-photos").getPublicUrl(path).data.publicUrl;
  }

  const hasPlate = Boolean(form.numberplate.trim());
  const hasVin = Boolean(form.chassis_number.trim());
  const points = 10 + (hasPlate ? 15 : 0) + (hasVin ? 30 : 0);

  async function doSubmit(override = false) {
    setError("");
    if (!form.make_id) { setError("Please select a brand."); return; }
    if (!form.model_id) { setError("Please select a model."); return; }
    if (photos.length === 0) { setError("At least one photo is required."); return; }
    if (!form.city.trim()) { setError("City / location is required."); return; }
    if (!form.country) { setError("Country is required."); return; }

    setLoading(true);
    setUploading(true);
    let photoUrls: string[] = [];
    try {
      photoUrls = await Promise.all(photos.map(uploadPhoto));
    } catch (e: unknown) {
      setError("Photo upload failed: " + (e instanceof Error ? e.message : String(e)));
      setLoading(false); setUploading(false); return;
    }
    setUploading(false);

    const coords = (form.latitude && form.longitude)
      ? { lat: parseFloat(form.latitude), lng: parseFloat(form.longitude) }
      : countryCoords[form.country] || { lat: 0, lng: 0 };

    const payload = {
      make_id: form.make_id,
      model_id: form.model_id,
      chassis_number: form.chassis_number.trim().toUpperCase() || null,
      spotter_email: user?.email || "anonymous",
      spotter_username: user?.username || null,
      location_name: form.city.trim(),
      country: form.country,
      spotted_at: new Date().toISOString(),
      latitude: coords.lat,
      longitude: coords.lng,
      photo_url: photoUrls[0],
      photo_urls: photoUrls,
      numberplate: form.numberplate.trim() || null,
      notes: form.notes.trim() || null,
      confirmed_duplicate: override,
    };

    try {
      const res = await fetch("/api/sightings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.status === 409 && data.duplicate_warning) {
        setDupWarning({ message: data.message, nearby_location: data.nearby_location });
        setLoading(false); return;
      }
      if (!res.ok) { setError(data.error || "Submission failed."); setLoading(false); return; }
      setResult({
        points: data.points_awarded || 10,
        id: data.sighting?.id || "",
        hasVin: hasVin,
        firstBonus: data.first_spotting_bonus || false,
      });
      setSubmitted(true);
    } catch (e: unknown) {
      setError("Network error: " + (e instanceof Error ? e.message : String(e)));
    }
    setLoading(false);
  }

  if (submitted && result) {
    return (
      <main style={{ background: "#080F1A", color: "#E2EEF7", fontFamily: "Verdana, sans-serif", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 20px" }}>
          <div style={{ textAlign: "center", maxWidth: "480px", width: "100%" }}>
            <div style={{ width: "64px", height: "64px", background: "#0D2A1A", border: "2px solid #4AB87A", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: "28px", color: "#4AB87A" }}>✓</div>
            <h1 style={{ fontSize: "26px", fontWeight: "bold", marginBottom: "12px" }}>Spotting submitted!</h1>
            <div style={{ background: "#0A1828", border: "1px solid #1E5A3A", padding: "20px 24px", marginBottom: "24px" }}>
              <p style={{ color: "#8BA5B8", fontSize: "11px", letterSpacing: "2px", marginBottom: "8px" }}>POINTS EARNED</p>
              <p style={{ fontSize: "40px", fontWeight: "bold", color: "#4AB87A", marginBottom: "4px" }}>+{result.points}</p>
              {result.firstBonus && (
                <p style={{ color: "#B8944A", fontSize: "12px" }}>Includes +100 first-spotting bonus!</p>
              )}
            </div>
            {!result.hasVin && (
              <div style={{ background: "#1A1200", border: "1px solid #8A6A00", padding: "16px 20px", marginBottom: "24px" }}>
                <p style={{ color: "#E0C060", fontSize: "13px", lineHeight: "1.6" }}>
                  VIN unknown — {result.id
                    ? <Link href={`/spottings/${result.id}`} style={{ color: "#4A90B8", textDecoration: "underline" }}>be the first to identify it</Link>
                    : "be the first to identify it"} and earn 50 more points.
                </p>
              </div>
            )}
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              {result.id && (
                <Link href={`/spottings/${result.id}`}
                  style={{ background: "#4A90B8", color: "#fff", padding: "12px 24px", textDecoration: "none", fontSize: "13px", letterSpacing: "1px" }}>
                  VIEW SPOTTING
                </Link>
              )}
              <Link href="/spotters" style={{ border: "1px solid #4A90B8", color: "#4A90B8", padding: "12px 24px", textDecoration: "none", fontSize: "13px", letterSpacing: "1px" }}>
                LEADERBOARD
              </Link>
              <button onClick={() => { setSubmitted(false); setResult(null); setPhotos([]); setPhotoPreviews([]); setForm({ make_id: "", model_id: "", city: "", country: "", latitude: "", longitude: "", numberplate: "", chassis_number: "", notes: "" }); }}
                style={{ border: "1px solid #1E3A5A", color: "#8BA5B8", padding: "12px 24px", background: "none", cursor: "pointer", fontFamily: "Verdana, sans-serif", fontSize: "13px", letterSpacing: "1px" }}>
                SUBMIT ANOTHER
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: "#080F1A", color: "#E2EEF7", fontFamily: "Verdana, sans-serif", minHeight: "100vh" }}>
      <div className="vv-form-container">
        <p style={{ color: "#4A90B8", letterSpacing: "3px", fontSize: "11px", marginBottom: "16px" }}>CAR SPOTTER</p>
        <h1 style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "12px" }}>Spot a car</h1>
        <p style={{ color: "#8BA5B8", fontSize: "14px", lineHeight: "1.7", marginBottom: "40px" }}>
          Spotted a rare car in the wild? Log it in 60 seconds and earn points.
        </p>

        {!user && (
          <div style={{ background: "#0D1E36", border: "1px solid #1E3A5A", padding: "14px 18px", marginBottom: "28px", fontSize: "13px", color: "#8BA5B8" }}>
            <Link href="/login" style={{ color: "#4A90B8" }}>Sign in</Link> to earn points and build your spotter reputation.
          </div>
        )}

        {error && (
          <div style={{ background: "#2A0D0D", border: "1px solid #8A2A2A", color: "#E07070", padding: "12px 16px", fontSize: "13px", marginBottom: "24px" }}>
            {error}
          </div>
        )}

        {dupWarning && (
          <div style={{ background: "#2A1A0D", border: "1px solid #8A5A2A", padding: "20px 24px", marginBottom: "24px" }}>
            <p style={{ color: "#E0B87A", fontSize: "14px", marginBottom: "16px" }}>{dupWarning.message}</p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button onClick={() => { setDupWarning(null); doSubmit(true); }}
                style={{ background: "#0D2A1A", color: "#4AB87A", border: "1px solid #4AB87A", padding: "10px 20px", fontSize: "13px", cursor: "pointer", fontFamily: "Verdana, sans-serif" }}>
                Yes, submit anyway
              </button>
              <button onClick={() => setDupWarning(null)}
                style={{ background: "none", border: "1px solid #1E3A5A", color: "#8BA5B8", padding: "10px 20px", fontSize: "13px", cursor: "pointer", fontFamily: "Verdana, sans-serif" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <form onSubmit={e => { e.preventDefault(); doSubmit(false); }}>

          {/* BRAND & MODEL */}
          <h2 style={section}>THE CAR</h2>

          <div style={{ marginBottom: "20px" }}>
            <label style={lbl}>BRAND *</label>
            <select name="make_id" value={form.make_id} onChange={handle} required style={{ ...inp, color: form.make_id ? "#E2EEF7" : "#4A6A8A" }}>
              <option value="">Select brand...</option>
              {makes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: "32px" }}>
            <label style={lbl}>MODEL *</label>
            <select name="model_id" value={form.model_id} onChange={handle} required disabled={!form.make_id}
              style={{ ...inp, color: form.model_id ? "#E2EEF7" : "#4A6A8A", opacity: form.make_id ? 1 : 0.5, cursor: form.make_id ? "pointer" : "not-allowed" }}>
              <option value="">{form.make_id ? "Select model..." : "Select brand first"}</option>
              {filteredModels.map(m => <option key={m.id} value={m.id}>{m.model}</option>)}
            </select>
          </div>

          {/* PHOTOS */}
          <h2 style={section}>PHOTOS *</h2>

          <div style={{ marginBottom: "32px" }}>
            <label style={{ ...lbl, marginBottom: "12px" }}>
              {photos.length === 0 ? "Add up to 10 photos" : `${photos.length} photo${photos.length === 1 ? "" : "s"} selected`}
            </label>

            <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#0A1828", border: "1px solid #1E3A5A", color: "#8BA5B8", padding: "12px 24px", fontSize: "13px", cursor: "pointer", marginBottom: "16px" }}>
              + Add photos
              <input ref={photoRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handlePhotos} style={{ display: "none" }} />
            </label>

            {photoPreviews.length > 0 && (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {photoPreviews.map((src, i) => (
                  <div key={i} style={{ position: "relative" }}>
                    <img src={src} alt={`Photo ${i + 1}`} style={{ width: "90px", height: "70px", objectFit: "cover", border: "1px solid #1E3A5A" }} />
                    <button type="button" onClick={() => removePhoto(i)}
                      style={{ position: "absolute", top: "2px", right: "2px", background: "#2A0D0D", border: "none", color: "#E07070", width: "18px", height: "18px", fontSize: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
                      ×
                    </button>
                  </div>
                ))}
                {photos.length < 10 && (
                  <label style={{ width: "90px", height: "70px", border: "1px dashed #1E3A5A", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#4A6A8A", fontSize: "22px" }}>
                    +
                    <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e => {
                      const newFiles = Array.from(e.target.files || []).filter(f => f.size <= 10 * 1024 * 1024 && ["image/jpeg","image/png","image/webp"].includes(f.type));
                      const combined = [...photos, ...newFiles].slice(0, 10);
                      setPhotos(combined);
                      Promise.all(combined.map(f => new Promise<string>(resolve => {
                        const r = new FileReader(); r.onload = ev => resolve(ev.target?.result as string); r.readAsDataURL(f);
                      }))).then(setPhotoPreviews);
                    }} style={{ display: "none" }} />
                  </label>
                )}
              </div>
            )}
          </div>

          {/* LOCATION */}
          <h2 style={section}>LOCATION</h2>

          <div style={{ marginBottom: "20px" }}>
            <label style={lbl}>CITY / LOCATION *</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input type="text" name="city" value={form.city} onChange={handle} placeholder="e.g. Monaco, Circuit de Monaco" required style={{ ...inp, flex: 1 }} />
              <button type="button" onClick={detectGPS} title="Detect my GPS location"
                style={{ background: gpsStatus === "ok" ? "#0D2A1A" : "#0A1828", border: `1px solid ${gpsStatus === "ok" ? "#4AB87A" : gpsStatus === "denied" ? "#8A2A2A" : "#1E3A5A"}`, color: gpsStatus === "ok" ? "#4AB87A" : gpsStatus === "denied" ? "#E07070" : "#8BA5B8", padding: "12px 14px", cursor: "pointer", fontFamily: "Verdana, sans-serif", fontSize: "16px", flexShrink: 0, minWidth: "48px" }}>
                {gpsStatus === "loading" ? "…" : "📍"}
              </button>
            </div>
            {gpsStatus === "ok" && (
              <p style={{ color: "#4AB87A", fontSize: "11px", marginTop: "6px" }}>
                GPS captured: {parseFloat(form.latitude).toFixed(4)}, {parseFloat(form.longitude).toFixed(4)}
              </p>
            )}
            {gpsStatus === "denied" && (
              <p style={{ color: "#8BA5B8", fontSize: "11px", marginTop: "6px" }}>GPS unavailable — country location will be used.</p>
            )}
          </div>

          <div style={{ marginBottom: "32px" }}>
            <label style={lbl}>COUNTRY *</label>
            <select name="country" value={form.country} onChange={handle} required style={{ ...inp, color: form.country ? "#E2EEF7" : "#4A6A8A" }}>
              <option value="">Select country...</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* EARN MORE POINTS */}
          <h2 style={section}>EARN MORE POINTS <span style={{ color: "#4A6A8A", fontWeight: "normal" }}>(optional)</span></h2>

          <div style={{ marginBottom: "20px" }}>
            <label style={lbl}>
              NUMBERPLATE <span style={{ color: "#4AB87A", fontWeight: "bold" }}>+15 pts</span>
            </label>
            <input type="text" name="numberplate" value={form.numberplate} onChange={handle}
              placeholder="e.g. GTO 288 — add a plate to earn +15 points" style={inp} />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={lbl}>
              VIN / CHASSIS NUMBER <span style={{ color: "#4AB87A", fontWeight: "bold" }}>+30 pts</span>
            </label>
            <input type="text" name="chassis_number" value={form.chassis_number} onChange={handle}
              placeholder="e.g. ZFFPA16B000040099 — add VIN to earn +30 points"
              style={{ ...inp, fontFamily: "monospace", letterSpacing: "0.5px" }} />
          </div>

          <div style={{ marginBottom: "32px" }}>
            <label style={lbl}>NOTES</label>
            <textarea name="notes" value={form.notes} onChange={handle}
              placeholder="Any interesting context? Was it being driven or parked?" rows={3}
              style={{ ...inp, resize: "vertical" }} />
          </div>

          {/* POINTS PREVIEW */}
          <div style={{ background: "#0A1828", border: "1px solid #1E3A5A", padding: "20px 24px", marginBottom: "32px" }}>
            <p style={{ color: "#8BA5B8", fontSize: "11px", letterSpacing: "2px", marginBottom: "12px" }}>POINTS PREVIEW</p>
            <p style={{ fontSize: "13px", color: "#E2EEF7", marginBottom: "12px" }}>
              Your spotting will earn:{" "}
              <span style={{ color: "#4AB87A" }}>10 pts base</span>
              {hasPlate && <span style={{ color: "#4AB87A" }}> + 15 pts plate</span>}
              {hasVin && <span style={{ color: "#4AB87A" }}> + 30 pts VIN</span>}
              {" = "}
              <span style={{ color: "#4AB87A", fontWeight: "bold", fontSize: "16px" }}>{points} pts</span>
            </p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <Pill earned label="10 pts base" />
              <Pill earned={hasPlate} label="+15 pts plate" />
              <Pill earned={hasVin} label="+30 pts VIN" />
            </div>
          </div>

          <button type="submit" disabled={loading || uploading}
            style={{ background: loading ? "#2A4A6A" : "#4A90B8", color: "#fff", padding: "16px 40px", fontSize: "15px", border: "none", cursor: loading ? "not-allowed" : "pointer", fontFamily: "Verdana, sans-serif", width: "100%", letterSpacing: "2px" }}>
            {uploading ? "UPLOADING PHOTOS..." : loading ? "SUBMITTING..." : "SUBMIT SPOTTING"}
          </button>
        </form>
      </div>
    </main>
  );
}

function Pill({ earned, label }: { earned: boolean; label: string }) {
  return (
    <span style={{ padding: "3px 10px", fontSize: "11px", background: earned ? "#0D2A1A" : "#0D1E36", color: earned ? "#4AB87A" : "#4A6A8A", border: `1px solid ${earned ? "#1E5A3A" : "#1E3A5A"}` }}>
      {earned ? "✓ " : ""}{label}
    </span>
  );
}
