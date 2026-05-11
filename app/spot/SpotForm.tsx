"use client";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { colors } from "@/app/components/ui/tokens";
import PullToRefresh from "@/app/components/PullToRefresh";

interface Make { id: string | null; name: string; }
interface Model { id: string; model: string; make: string; }

const MAKES_FALLBACK = [
  "Abarth","AC Cars","Alfa Romeo","Alpine","Ariel","Arrinera","Aston Martin","Audi","BAC",
  "Bentley","BMW","Brabham","Bugatti","Buick","Cadillac","Callaway","Caparo","Caterham",
  "Chevrolet","Chrysler","Citroën","Corvette","Czinger","Dallara","Datsun","De Tomaso",
  "Dodge","Donkervoort","Eagle","Elfin","Factory Five","Ferrari","Fiat","Ford","GMA",
  "Hennessey","Honda","Jaguar","Jeep","KTM","Koenigsegg","Lamborghini","Lancia",
  "Land Rover","Lexus","Ligier","Lister","Lotus","Maserati","Mazda","McLaren",
  "Mercedes-AMG","Mercedes-Benz","MG","Mini","Mitsubishi","Morgan","Mosler","Nissan",
  "Noble","Opel","Pagani","Panoz","Peugeot","Pininfarina","Porsche","Radical","Renault",
  "Rimac","Rolls-Royce","Ruf","Saab","Saleen","Shelby","Singer","Spyker","SSC","Subaru",
  "Tesla","Toyota","TVR","Ultima","Volkswagen","Volvo","W Motors","Wiesmann","Zenvo",
];

const countryCoords: Record<string, { lat: number; lng: number }> = {
  "France": { lat: 46.23, lng: 2.21 }, "Germany": { lat: 51.17, lng: 10.45 },
  "Italy": { lat: 41.87, lng: 12.57 }, "United Kingdom": { lat: 55.38, lng: -3.44 },
  "Spain": { lat: 40.46, lng: -3.74 }, "Monaco": { lat: 43.73, lng: 7.41 },
  "United States": { lat: 37.09, lng: -95.71 }, "Japan": { lat: 36.20, lng: 138.25 },
  "Other": { lat: 0, lng: 0 },
};

async function compressImage(file: File, maxPx = 2048, quality = 0.82): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        blob => resolve(blob ? new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }) : file),
        "image/jpeg", quality
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = e => resolve((e.target?.result as string).replace(/^data:image\/[a-z]+;base64,/, ""));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

const inp: React.CSSProperties = {
  width: "100%", background: colors.surface, border: `1px solid ${colors.border}`,
  color: colors.textPrimary, padding: "12px 16px", fontSize: "15px",
  fontFamily: "Georgia, serif", boxSizing: "border-box", outline: "none",
};
const lbl: React.CSSProperties = {
  display: "block", color: colors.textMuted, fontSize: "11px", letterSpacing: "2px",
  marginBottom: "8px", fontFamily: "Verdana, sans-serif", textTransform: "uppercase",
};
const hint: React.CSSProperties = { color: colors.textMuted, fontSize: "11px", marginTop: "6px", fontFamily: "Verdana, sans-serif" };
const sectionHd: React.CSSProperties = {
  color: colors.accent, fontSize: "11px", letterSpacing: "3px",
  borderBottom: `1px solid ${colors.border}`, paddingBottom: "12px",
  marginBottom: "24px", marginTop: "40px", fontFamily: "Verdana, sans-serif",
  textTransform: "uppercase", fontWeight: "normal",
};

interface AIResult {
  make: string | null; model: string | null; confidence: number;
  numberplate: string | null; plate_confidence: number;
  color: string | null; approximate_year: string | null; notes: string | null;
}

interface NominatimResult {
  display_name: string; lat: string; lon: string;
  address?: { city?: string; town?: string; village?: string; country?: string; state?: string };
}

export default function SpotForm() {
  const [user, setUser] = useState<{ email: string; username?: string } | null>(null);
  const [makes, setMakes] = useState<Make[]>(MAKES_FALLBACK.map(n => ({ id: null, name: n })));
  const [allModels, setAllModels] = useState<Model[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);

  // Photos + AI
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [aiAnalysing, setAiAnalysing] = useState(false);
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [aiError, setAiError] = useState("");
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);
  const [formVisible, setFormVisible] = useState(false);

  // Make/model
  const [selectedMake, setSelectedMake] = useState<Make | null>(null);
  const [isOtherBrand, setIsOtherBrand] = useState(false);
  const [customBrand, setCustomBrand] = useState("");
  const [modelQuery, setModelQuery] = useState("");
  const [modelOpen, setModelOpen] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const modelRef = useRef<HTMLDivElement>(null);

  // Location (Nominatim)
  const [locationText, setLocationText] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<NominatimResult[]>([]);
  const [locationOpen, setLocationOpen] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [gpsStatus, setGpsStatus] = useState<"idle" | "loading" | "ok" | "denied">("idle");
  const locationRef = useRef<HTMLDivElement>(null);
  const locationDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [form, setForm] = useState({
    country: "", numberplate: "", chassis_number: "", submodel: "", notes: "", color: "",
  });

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ points: number; id: string; hasVin: boolean; firstBonus: boolean } | null>(null);
  const [dupWarning, setDupWarning] = useState<{ message: string } | null>(null);

  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user: u } }) => {
      if (!u?.email) return;
      try {
        const { data } = await supabase.from("spotter_profiles").select("username").eq("user_email", u.email).limit(1).single();
        setUser({ email: u.email, username: data?.username });
      } catch { setUser({ email: u.email }); }
    });
    fetch("/api/admin/makes").then(r => r.ok ? r.json() : [])
      .then((dbMakes: { id: string; name: string }[]) => {
        const dbNames = new Set(dbMakes.map(m => m.name));
        const merged: Make[] = [
          ...dbMakes.map(m => ({ id: m.id, name: m.name })),
          ...MAKES_FALLBACK.filter(n => !dbNames.has(n)).map(n => ({ id: null, name: n })),
        ].sort((a, b) => a.name.localeCompare(b.name));
        setMakes(merged);
      }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedMake) { setAllModels([]); return; }
    setModelsLoading(true);
    fetch(`/api/admin/models?make=${encodeURIComponent(selectedMake.name)}`)
      .then(r => r.ok ? r.json() : [])
      .then(setAllModels).catch(() => setAllModels([]))
      .finally(() => setModelsLoading(false));
  }, [selectedMake?.name]);

  // Close model dropdown on outside pointer (works on mobile + desktop)
  useEffect(() => {
    function handlePointer(e: PointerEvent) {
      if (modelRef.current && !modelRef.current.contains(e.target as Node)) setModelOpen(false);
    }
    document.addEventListener("pointerdown", handlePointer);
    return () => document.removeEventListener("pointerdown", handlePointer);
  }, []);

  // Close location dropdown on outside pointer
  useEffect(() => {
    function handlePointer(e: PointerEvent) {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) setLocationOpen(false);
    }
    document.addEventListener("pointerdown", handlePointer);
    return () => document.removeEventListener("pointerdown", handlePointer);
  }, []);

  const filteredModels = selectedMake
    ? allModels.filter(m => {
        const q = modelQuery.trim().toLowerCase();
        return m.make === selectedMake.name && (q ? m.model.toLowerCase().includes(q) : true);
      }).slice(0, 8)
    : [];

  const selectModel = (model: Model) => {
    setModelQuery(model.model); setSelectedModelId(model.id); setModelOpen(false);
  };

  // Nominatim location search
  const searchLocation = useCallback((query: string) => {
    if (query.length < 3) { setLocationSuggestions([]); return; }
    if (locationDebounce.current) clearTimeout(locationDebounce.current);
    locationDebounce.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
          { headers: { "User-Agent": "VinVault/1.0 (contact@vinvault.net)" } }
        );
        if (res.ok) { setLocationSuggestions(await res.json()); setLocationOpen(true); }
      } catch {}
    }, 400);
  }, []);

  const selectLocation = (place: NominatimResult) => {
    const addr = place.address || {};
    const city = addr.city || addr.town || addr.village || addr.state || "";
    const country = addr.country || "";
    const label = city && country ? `${city}, ${country}` : place.display_name.split(",").slice(0, 2).join(",").trim();
    setLocationText(label);
    setLatitude(place.lat);
    setLongitude(place.lon);
    if (country) setForm(f => ({ ...f, country: country }));
    setLocationSuggestions([]); setLocationOpen(false);
  };

  const detectGPS = useCallback(() => {
    if (!navigator.geolocation) { setGpsStatus("denied"); return; }
    setGpsStatus("loading");
    navigator.geolocation.getCurrentPosition(async pos => {
      const lat = pos.coords.latitude, lon = pos.coords.longitude;
      setLatitude(lat.toFixed(6)); setLongitude(lon.toFixed(6));
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
          { headers: { "User-Agent": "VinVault/1.0 (contact@vinvault.net)" } }
        );
        if (res.ok) {
          const data = await res.json();
          const addr = data.address || {};
          const city = addr.city || addr.town || addr.village || addr.state || "";
          const country = addr.country || "";
          if (city || country) {
            setLocationText(city && country ? `${city}, ${country}` : city || country);
            if (country) setForm(f => ({ ...f, country }));
          }
        }
      } catch {}
      setGpsStatus("ok");
    }, () => setGpsStatus("denied"), { timeout: 10000 });
  }, []);

  // AI analysis
  async function runAIAnalysis(file: File) {
    setAiAnalysing(true); setAiError(""); setAiResult(null);
    try {
      const base64 = await fileToBase64(file);
      const res = await fetch("/api/spot/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mediaType: file.type }),
      });
      const data = await res.json();
      setAiAvailable(data.available !== false);
      if (data.result) {
        setAiResult(data.result);
        // Pre-fill form from AI
        if (data.result.make) {
          const found = makes.find(m => m.name.toLowerCase() === (data.result.make || "").toLowerCase());
          if (found) { setSelectedMake(found); setIsOtherBrand(false); }
          else { setIsOtherBrand(true); setCustomBrand(data.result.make); }
        }
        if (data.result.model) setModelQuery(data.result.model);
        if (data.result.color) setForm(f => ({ ...f, color: data.result!.color || "" }));
        if (data.result.numberplate) setForm(f => ({ ...f, numberplate: data.result!.numberplate || "" }));
      } else if (data.error) {
        setAiError(data.error);
      }
    } catch {
      setAiError("AI analysis failed");
    }
    setAiAnalysing(false);
    setFormVisible(true);
  }

  const handlePhotos = async (files: FileList | null) => {
    const arr = Array.from(files || []);
    const valid = arr.filter(f => f.size <= 10 * 1024 * 1024 && ["image/jpeg","image/png","image/webp"].includes(f.type)).slice(0, 10);
    if (valid.length < arr.length) setError("Some photos skipped (max 10 MB, JPEG/PNG/WebP).");
    else setError("");
    const compressed = await Promise.all(valid.map(f => compressImage(f)));
    setPhotos(compressed);
    Promise.all(compressed.map(f => new Promise<string>(res => {
      const r = new FileReader(); r.onload = e => res(e.target?.result as string); r.readAsDataURL(f);
    }))).then(setPhotoPreviews);
    if (compressed.length > 0) await runAIAnalysis(compressed[0]);
    else setFormVisible(true);
  };

  const addPhotos = async (files: FileList | null) => {
    const arr = Array.from(files || []);
    const valid = arr.filter(f => f.size <= 10 * 1024 * 1024 && ["image/jpeg","image/png","image/webp"].includes(f.type));
    const compressed = await Promise.all(valid.map(f => compressImage(f)));
    const combined = [...photos, ...compressed].slice(0, 10);
    setPhotos(combined);
    Promise.all(combined.map(f => new Promise<string>(res => {
      const r = new FileReader(); r.onload = e => res(e.target?.result as string); r.readAsDataURL(f);
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
    const effectiveBrand = isOtherBrand ? customBrand.trim() : selectedMake?.name || "";
    if (!effectiveBrand) { setError("Please select or enter a brand."); return; }
    if (!modelQuery.trim()) { setError("Please enter a model name."); return; }
    if (photos.length === 0) { setError("At least one photo is required."); return; }
    if (!locationText.trim()) { setError("Location is required."); return; }

    setLoading(true); setUploading(true);
    let photoUrls: string[] = [];
    try { photoUrls = await Promise.all(photos.map(uploadPhoto)); }
    catch (e: unknown) { setError("Photo upload failed: " + (e instanceof Error ? e.message : String(e))); setLoading(false); setUploading(false); return; }
    setUploading(false);

    const coords = latitude && longitude
      ? { lat: parseFloat(latitude), lng: parseFloat(longitude) }
      : countryCoords[form.country] || { lat: 0, lng: 0 };

    const modelIsNew = !selectedModelId && Boolean(modelQuery.trim());
    const needsReview = modelIsNew || isOtherBrand;

    const payload = {
      make_id: isOtherBrand ? null : (selectedMake?.id || null),
      make_name: effectiveBrand,
      model_id: selectedModelId || null,
      model_name: modelQuery.trim(),
      submodel: form.submodel.trim() || null,
      chassis_number: form.chassis_number.trim().toUpperCase() || null,
      spotter_email: user?.email || "anonymous",
      spotter_username: user?.username || null,
      location_name: locationText.trim(),
      country: form.country,
      spotted_at: new Date().toISOString(),
      latitude: coords.lat,
      longitude: coords.lng,
      photo_url: photoUrls[0],
      photo_urls: photoUrls,
      numberplate: form.numberplate.trim() || null,
      notes: form.notes.trim() || null,
      confirmed_duplicate: override,
      unverified_make: isOtherBrand ? effectiveBrand : null,
      unverified_model: needsReview ? modelQuery.trim() : null,
      needs_model_review: needsReview,
    };

    try {
      const res = await fetch("/api/sightings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.status === 409 && data.duplicate_warning) { setDupWarning({ message: data.message }); setLoading(false); return; }
      if (!res.ok) { setError(data.error || "Submission failed."); setLoading(false); return; }
      setResult({ points: data.points_awarded || 10, id: data.sighting?.id || "", hasVin, firstBonus: data.first_spotting_bonus || false });
      setSubmitted(true);
    } catch (e: unknown) {
      setError("Network error: " + (e instanceof Error ? e.message : String(e)));
    }
    setLoading(false);
  }

  function resetForm() {
    setSubmitted(false); setResult(null); setPhotos([]); setPhotoPreviews([]);
    setSelectedMake(null); setIsOtherBrand(false); setCustomBrand(""); setModelQuery(""); setSelectedModelId(null);
    setLocationText(""); setLatitude(""); setLongitude(""); setGpsStatus("idle");
    setAiResult(null); setAiError(""); setFormVisible(false);
    setForm({ country: "", numberplate: "", chassis_number: "", submodel: "", notes: "", color: "" });
  }

  if (submitted && result) {
    return (
      <main style={{ background: colors.bg, color: colors.textPrimary, fontFamily: "Georgia, serif", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 20px" }}>
          <div style={{ textAlign: "center", maxWidth: "480px", width: "100%" }}>
            <div style={{ width: "64px", height: "64px", background: "#E8F4EC", border: `2px solid ${colors.success}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: "28px", color: colors.success }}>✓</div>
            <h1 style={{ fontSize: "26px", fontWeight: "bold", marginBottom: "12px" }}>Spotting submitted!</h1>
            <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderLeft: `3px solid ${colors.success}`, padding: "20px 24px", marginBottom: "24px" }}>
              <p style={{ color: colors.textMuted, fontSize: "11px", letterSpacing: "2px", marginBottom: "8px", fontFamily: "Verdana, sans-serif", textTransform: "uppercase" }}>Points Earned</p>
              <p style={{ fontSize: "40px", fontWeight: "bold", color: colors.success, marginBottom: "4px" }}>+{result.points}</p>
              {result.firstBonus && <p style={{ color: colors.accent, fontSize: "12px", fontFamily: "Verdana, sans-serif" }}>Includes +100 first-spotting bonus!</p>}
            </div>
            {!result.hasVin && (
              <div style={{ background: "#FBF3E0", border: `1px solid ${colors.accent}`, padding: "16px 20px", marginBottom: "24px" }}>
                <p style={{ color: "#6A4A10", fontSize: "13px", lineHeight: "1.6" }}>
                  VIN unknown —{" "}
                  {result.id ? <Link href={`/spottings/${result.id}`} style={{ color: colors.accentBlue, textDecoration: "underline" }}>be the first to identify it</Link> : "be the first to identify it"}{" "}
                  and earn 50 more points.
                </p>
              </div>
            )}
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              {result.id && <Link href={`/spottings/${result.id}`} style={{ background: colors.accentNavy, color: "#FFFDF8", padding: "12px 24px", textDecoration: "none", fontSize: "13px", letterSpacing: "1px", fontFamily: "Verdana, sans-serif", textTransform: "uppercase" }}>View Spotting</Link>}
              <Link href="/spotters" style={{ border: `1px solid ${colors.accentNavy}`, color: colors.textPrimary, padding: "12px 24px", textDecoration: "none", fontSize: "13px", letterSpacing: "1px", fontFamily: "Verdana, sans-serif", textTransform: "uppercase" }}>Leaderboard</Link>
              <button onClick={resetForm} style={{ border: `1px solid ${colors.border}`, color: colors.textSecondary, padding: "12px 24px", background: "none", cursor: "pointer", fontFamily: "Verdana, sans-serif", fontSize: "13px", letterSpacing: "1px", textTransform: "uppercase" }}>Submit Another</button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: colors.bg, color: colors.textPrimary, fontFamily: "Georgia, serif", minHeight: "100vh" }}>
      <PullToRefresh />
      <div className="vv-form-container">
        <p style={{ color: colors.accent, letterSpacing: "3px", fontSize: "11px", marginBottom: "16px", fontFamily: "Verdana, sans-serif", textTransform: "uppercase" }}>Car Spotter</p>
        <h1 style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "12px" }}>Spot a car</h1>
        <p style={{ color: colors.textSecondary, fontSize: "14px", lineHeight: "1.7", marginBottom: "40px" }}>
          Spotted a rare car in the wild? Log it in 60 seconds and earn points.
        </p>

        {!user && (
          <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, padding: "14px 18px", marginBottom: "28px", fontSize: "13px", color: colors.textSecondary, fontFamily: "Verdana, sans-serif" }}>
            <Link href="/login" style={{ color: colors.accentBlue }}>Sign in</Link> to earn points and build your spotter reputation.
          </div>
        )}

        {error && <div style={{ background: "#FAE8E8", border: `1px solid ${colors.error}`, color: colors.error, padding: "12px 16px", fontSize: "13px", marginBottom: "24px", fontFamily: "Verdana, sans-serif" }}>{error}</div>}

        {dupWarning && (
          <div style={{ background: "#FBF3E0", border: `1px solid ${colors.accent}`, padding: "20px 24px", marginBottom: "24px" }}>
            <p style={{ color: "#6A4A10", fontSize: "14px", marginBottom: "16px" }}>{dupWarning.message}</p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button onClick={() => { setDupWarning(null); doSubmit(true); }} style={{ background: "#E8F4EC", color: colors.success, border: `1px solid ${colors.success}`, padding: "10px 20px", fontSize: "13px", cursor: "pointer", fontFamily: "Verdana, sans-serif" }}>Yes, submit anyway</button>
              <button onClick={() => setDupWarning(null)} style={{ background: "none", border: `1px solid ${colors.border}`, color: colors.textSecondary, padding: "10px 20px", fontSize: "13px", cursor: "pointer", fontFamily: "Verdana, sans-serif" }}>Cancel</button>
            </div>
          </div>
        )}

        <form onSubmit={e => { e.preventDefault(); doSubmit(false); }}>

          {/* ── STEP 1: PHOTO (always first) ── */}
          <h2 style={sectionHd}>Photo *</h2>

          {photos.length === 0 ? (
            <div style={{ marginBottom: "32px" }}>
              <label style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: "16px", border: `2px dashed ${colors.border}`, padding: "48px 24px",
                cursor: "pointer", background: colors.surface, textAlign: "center",
              }}>
                <span style={{ fontSize: "48px" }}>📷</span>
                <span style={{ fontFamily: "Verdana, sans-serif", fontSize: "13px", color: colors.textSecondary }}>
                  Take a photo or upload from gallery
                </span>
                <span style={{ fontFamily: "Verdana, sans-serif", fontSize: "11px", color: colors.textMuted }}>
                  JPEG / PNG / WebP — max 10 MB
                </span>
                <input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={e => handlePhotos(e.target.files)} style={{ display: "none" }} />
              </label>
              <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: colors.accentNavy, color: "#FFFDF8", padding: "12px 20px", fontSize: "12px", cursor: "pointer", fontFamily: "Verdana, sans-serif", letterSpacing: "1px", textTransform: "uppercase" }}>
                  📷 Camera
                  <input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={e => handlePhotos(e.target.files)} style={{ display: "none" }} />
                </label>
                <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: colors.surface, border: `1px solid ${colors.border}`, color: colors.textSecondary, padding: "12px 20px", fontSize: "12px", cursor: "pointer", fontFamily: "Verdana, sans-serif", letterSpacing: "1px" }}>
                  Gallery
                  <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e => handlePhotos(e.target.files)} style={{ display: "none" }} />
                </label>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: "32px" }}>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
                {photoPreviews.map((src, i) => (
                  <div key={i} style={{ position: "relative" }}>
                    <img src={src} alt={`Photo ${i + 1}`} style={{ width: "90px", height: "70px", objectFit: "cover", border: `1px solid ${colors.border}` }} />
                    <button type="button" onClick={() => removePhoto(i)}
                      style={{ position: "absolute", top: "2px", right: "2px", background: colors.error, border: "none", color: "#fff", width: "18px", height: "18px", fontSize: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      ×
                    </button>
                  </div>
                ))}
                {photos.length < 10 && (
                  <label style={{ width: "90px", height: "70px", border: `1px dashed ${colors.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: colors.textMuted, fontSize: "22px" }}>
                    +
                    <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e => addPhotos(e.target.files)} style={{ display: "none" }} />
                  </label>
                )}
              </div>
              <p style={hint}>{photos.length} photo{photos.length !== 1 ? "s" : ""} selected. Photos are compressed to 2048px automatically.</p>
            </div>
          )}

          {/* ── STEP 2: AI ANALYSIS ── */}
          {aiAnalysing && (
            <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderLeft: `3px solid ${colors.accent}`, padding: "20px 24px", marginBottom: "28px", display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "24px", height: "24px", border: `2px solid ${colors.accent}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
              <p style={{ fontFamily: "Verdana, sans-serif", fontSize: "13px", color: colors.textSecondary }}>Analysing your photo…</p>
            </div>
          )}

          {aiResult && !aiAnalysing && (
            <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderLeft: `3px solid ${aiResult.confidence > 0.7 ? colors.success : colors.accent}`, padding: "20px 24px", marginBottom: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <span style={{ fontSize: "20px" }}>{aiResult.confidence > 0.7 ? "✓" : "○"}</span>
                <p style={{ fontFamily: "Verdana, sans-serif", fontSize: "11px", color: colors.textMuted, letterSpacing: "2px", textTransform: "uppercase", margin: 0 }}>
                  {aiResult.make ? `AI suggests: ${aiResult.make} ${aiResult.model || ""}` : "Could not identify this car automatically"}
                </p>
              </div>
              <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "12px" }}>
                {aiResult.color && <p style={{ fontFamily: "Verdana, sans-serif", fontSize: "12px", color: colors.textSecondary, margin: 0 }}>Color: <strong>{aiResult.color}</strong></p>}
                {aiResult.approximate_year && <p style={{ fontFamily: "Verdana, sans-serif", fontSize: "12px", color: colors.textSecondary, margin: 0 }}>Year: <strong>{aiResult.approximate_year}</strong></p>}
                {aiResult.numberplate && <p style={{ fontFamily: "Verdana, sans-serif", fontSize: "12px", color: colors.textSecondary, margin: 0 }}>Plate: <strong>{aiResult.numberplate}</strong></p>}
              </div>
              {aiResult.make && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ flex: 1, height: "4px", background: colors.border }}>
                    <div style={{ width: `${Math.round(aiResult.confidence * 100)}%`, height: "100%", background: colors.accent }} />
                  </div>
                  <span style={{ fontFamily: "Verdana, sans-serif", fontSize: "11px", color: colors.accent }}>{Math.round(aiResult.confidence * 100)}% confident</span>
                </div>
              )}
              <p style={{ ...hint, marginTop: "8px", color: colors.textMuted }}>Fields are pre-filled — please verify and correct as needed.</p>
            </div>
          )}

          {aiError && !aiAnalysing && formVisible && (
            <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, padding: "12px 16px", marginBottom: "20px" }}>
              <p style={{ fontFamily: "Verdana, sans-serif", fontSize: "12px", color: colors.textMuted }}>
                {aiAvailable === false ? "Fill in the details below." : "Could not identify this car — please fill in the details below."}
              </p>
            </div>
          )}

          {/* ── FORM (shown after photo selected) ── */}
          {(formVisible || photos.length > 0) && !aiAnalysing && (
            <>
              <h2 style={sectionHd}>The Car</h2>

              {/* Brand */}
              <div style={{ marginBottom: "20px" }}>
                <label style={lbl}>Brand *</label>
                <select
                  value={isOtherBrand ? "__other__" : (selectedMake?.name || "")}
                  onChange={e => {
                    const name = e.target.value;
                    setModelQuery(""); setSelectedModelId(null);
                    if (!name) { setSelectedMake(null); setIsOtherBrand(false); setCustomBrand(""); return; }
                    if (name === "__other__") { setIsOtherBrand(true); setSelectedMake(null); setCustomBrand(""); return; }
                    setIsOtherBrand(false); setCustomBrand("");
                    const found = makes.find(m => m.name === name);
                    setSelectedMake(found || { id: null, name });
                  }}
                  style={{ ...inp, color: (selectedMake || isOtherBrand) ? colors.textPrimary : colors.textMuted }}
                >
                  <option value="">Select brand…</option>
                  {makes.map(m => <option key={m.id ?? m.name} value={m.name}>{m.name}</option>)}
                  <option value="__other__">Other / Not in list</option>
                </select>
                <p style={hint}>If brand is not in list, choose &apos;Other&apos; and enter free text for approval by administrator</p>
              </div>

              {isOtherBrand && (
                <div style={{ marginBottom: "20px" }}>
                  <label style={lbl}>Brand Name *</label>
                  <input type="text" value={customBrand} onChange={e => setCustomBrand(e.target.value)} placeholder="Enter brand name…" autoComplete="off" style={inp} />
                  <label style={{ ...lbl, marginTop: "12px" }}>Model Name *</label>
                  <input type="text" value={modelQuery} onChange={e => { setModelQuery(e.target.value); setSelectedModelId(null); }} placeholder="Enter model name…" autoComplete="off" style={inp} />
                  <p style={{ ...hint, color: colors.accent, marginTop: "8px" }}>
                    If your brand is not in the list, enter it here. Your spotting will be submitted for administrator approval before being published.
                  </p>
                </div>
              )}

              {/* Model autocomplete (shown when NOT using Other brand) */}
              {!isOtherBrand && (
                <div style={{ marginBottom: "8px" }} ref={modelRef}>
                  <label style={lbl}>Model *</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      value={modelQuery}
                      onChange={e => { setModelQuery(e.target.value); setSelectedModelId(null); setModelOpen(true); }}
                      placeholder={modelsLoading ? "Loading models…" : selectedMake ? "Type model name…" : "e.g. 488, Agera, 911"}
                      autoComplete="off"
                      style={inp}
                    />
                    {modelOpen && filteredModels.length > 0 && (
                      <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: colors.surface, border: `1px solid ${colors.border}`, zIndex: 9999, maxHeight: "220px", overflowY: "auto", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
                        {filteredModels.map(m => (
                          <div key={m.id}
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => selectModel(m)}
                            style={{ padding: "10px 16px", cursor: "pointer", fontSize: "13px", fontFamily: "Georgia, serif" }}
                            onPointerEnter={e => (e.currentTarget.style.background = colors.surfaceAlt)}
                            onPointerLeave={e => (e.currentTarget.style.background = "transparent")}
                          >
                            {m.model}
                          </div>
                        ))}
                        <div style={{ padding: "8px 16px", fontSize: "11px", color: colors.textMuted, fontFamily: "Verdana, sans-serif", borderTop: `1px solid ${colors.border}` }}>
                          No match? Type to use as-is
                        </div>
                      </div>
                    )}
                  </div>
                  {!modelsLoading && modelQuery.trim() && !selectedModelId && selectedMake && (
                    <p style={{ ...hint, color: colors.warning, marginTop: "6px" }}>Not in our database yet — submit anyway and we will review it.</p>
                  )}
                  {(!modelQuery.trim() || selectedModelId) && <p style={hint}>Enter the model name. Example: Agera, 288 GTO, Countach</p>}
                </div>
              )}

              {/* Submodel */}
              <div style={{ marginBottom: "8px", marginTop: "20px" }}>
                <label style={lbl}>Variant / Edition <span style={{ color: colors.textMuted, fontWeight: "normal" }}>(optional)</span></label>
                <input type="text" name="submodel" value={form.submodel} onChange={e => setForm(f => ({ ...f, submodel: e.target.value }))} placeholder="e.g. RS Edition, Spyder, Competition" style={inp} />
              </div>
              <p style={{ ...hint, marginBottom: "24px" }}>Optional: enter specific variant or edition.</p>

              {/* ── LOCATION ── */}
              <h2 style={sectionHd}>Location</h2>

              <div style={{ marginBottom: "20px" }} ref={locationRef}>
                <label style={lbl}>Location *</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <input
                      type="text"
                      value={locationText}
                      onChange={e => { setLocationText(e.target.value); setLatitude(""); setLongitude(""); searchLocation(e.target.value); }}
                      placeholder="e.g. Monaco, Monte Carlo"
                      style={inp}
                    />
                    {locationOpen && locationSuggestions.length > 0 && (
                      <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: colors.surface, border: `1px solid ${colors.border}`, zIndex: 9999, maxHeight: "200px", overflowY: "auto", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
                        {locationSuggestions.map((s, i) => (
                          <div key={i}
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => selectLocation(s)}
                            style={{ padding: "10px 16px", cursor: "pointer", fontSize: "13px", fontFamily: "Verdana, sans-serif" }}
                            onPointerEnter={e => (e.currentTarget.style.background = colors.surfaceAlt)}
                            onPointerLeave={e => (e.currentTarget.style.background = "transparent")}
                          >
                            {s.display_name.split(",").slice(0, 3).join(",")}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button type="button" onClick={detectGPS} title="Detect GPS location"
                    style={{ background: gpsStatus === "ok" ? "#E8F4EC" : colors.surface, border: `1px solid ${gpsStatus === "ok" ? colors.success : gpsStatus === "denied" ? colors.error : colors.border}`, color: gpsStatus === "ok" ? colors.success : gpsStatus === "denied" ? colors.error : colors.textMuted, padding: "12px 14px", cursor: "pointer", fontFamily: "Georgia, serif", fontSize: "16px", flexShrink: 0, minWidth: "48px" }}>
                    {gpsStatus === "loading" ? "…" : "📍"}
                  </button>
                </div>
                {gpsStatus === "ok" && <p style={{ color: colors.success, fontSize: "11px", marginTop: "6px", fontFamily: "Verdana, sans-serif" }}>GPS location detected</p>}
                {gpsStatus === "denied" && <p style={{ ...hint, marginTop: "6px" }}>GPS unavailable — enter location manually.</p>}
              </div>

              {/* ── EARN MORE POINTS ── */}
              <h2 style={sectionHd}>Earn More Points <span style={{ color: colors.textMuted, fontWeight: "normal" }}>(optional)</span></h2>

              <div style={{ marginBottom: "20px" }}>
                <label style={lbl}>Numberplate <span style={{ color: colors.success, fontWeight: "bold" }}>+15 pts</span></label>
                <input type="text" name="numberplate" value={form.numberplate} onChange={e => setForm(f => ({ ...f, numberplate: e.target.value }))} placeholder="e.g. GTO 288" style={inp} />
              </div>
              <div style={{ marginBottom: "32px" }}>
                <label style={lbl}>VIN / Chassis Number <span style={{ color: colors.success, fontWeight: "bold" }}>+30 pts</span></label>
                <input type="text" name="chassis_number" value={form.chassis_number} onChange={e => setForm(f => ({ ...f, chassis_number: e.target.value }))} placeholder="e.g. ZFFPA16B000040099" style={{ ...inp, fontFamily: "monospace", letterSpacing: "0.5px" }} />
              </div>
              <div style={{ marginBottom: "32px" }}>
                <label style={lbl}>Notes</label>
                <textarea name="notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any interesting context?" rows={3} style={{ ...inp, resize: "vertical" }} />
              </div>

              {/* Points preview */}
              <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderLeft: `3px solid ${colors.accent}`, padding: "20px 24px", marginBottom: "32px" }}>
                <p style={{ color: colors.textMuted, fontSize: "11px", letterSpacing: "2px", marginBottom: "12px", fontFamily: "Verdana, sans-serif", textTransform: "uppercase" }}>Points Preview</p>
                <p style={{ fontSize: "13px", color: colors.textPrimary, marginBottom: "12px", fontFamily: "Verdana, sans-serif" }}>
                  Your spotting will earn:{" "}
                  <span style={{ color: colors.success }}>10 pts base</span>
                  {hasPlate && <span style={{ color: colors.success }}> + 15 pts plate</span>}
                  {hasVin && <span style={{ color: colors.success }}> + 30 pts VIN</span>}
                  {" = "}
                  <span style={{ color: colors.success, fontWeight: "bold", fontSize: "16px" }}>{points} pts</span>
                </p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <Pill earned label="10 pts base" />
                  <Pill earned={hasPlate} label="+15 pts plate" />
                  <Pill earned={hasVin} label="+30 pts VIN" />
                </div>
              </div>

              <button type="submit" disabled={loading || uploading}
                style={{ background: (loading || uploading) ? colors.textMuted : colors.accentNavy, color: "#FFFDF8", padding: "16px 40px", fontSize: "14px", border: "none", cursor: (loading || uploading) ? "not-allowed" : "pointer", fontFamily: "Verdana, sans-serif", width: "100%", letterSpacing: "2px", textTransform: "uppercase" }}>
                {uploading ? "Uploading Photos…" : loading ? "Submitting…" : "Submit Spotting"}
              </button>
            </>
          )}
        </form>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}

function Pill({ earned, label }: { earned?: boolean; label: string }) {
  return (
    <span style={{ padding: "3px 10px", fontSize: "11px", background: earned ? "#E8F4EC" : colors.surfaceAlt, color: earned ? colors.success : colors.textMuted, border: `1px solid ${earned ? colors.success : colors.border}`, fontFamily: "Verdana, sans-serif" }}>
      {earned ? "✓ " : ""}{label}
    </span>
  );
}
