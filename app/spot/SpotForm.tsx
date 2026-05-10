"use client";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { colors } from "@/app/components/ui/tokens";

interface Make { id: string | null; name: string; }
interface Model { id: string; model: string; make: string; }

const MAKES_FALLBACK = [
  "Abarth","AC Cars","Alfa Romeo","Alpine","Ariel","Arrinera","Aston Martin","Audi","BAC",
  "Bentley","BMW","Brabham","Bugatti","Buick","Cadillac","Callaway","Caparo","Caterham",
  "Chevrolet","Chrysler","Citroën","Corvette","Czinger","Dallara","Datsun","De Tomaso",
  "Dodge","Donkervoort","Eagle","Elfin","Enzo Ferrari","Exige","Factory Five","Ferrari",
  "Fiat","Ford","GMA","Hennessey","Honda","Huayra","Hypercars","Italdesign","Jaguar",
  "Jeep","KTM","Koenigsegg","Lamborghini","Lancia","Land Rover","Lexus","Ligier",
  "Lister","Local Motors","Lola","Lotus","Lykan","Maserati","Mazda","McClaren",
  "McLaren","Mercedes-AMG","Mercedes-Benz","Mercury","MG","Mini","Mitsubishi",
  "Morgan","Mosler","Nissan","Noble","Oldsmobile","Opel","Pagani","Panoz","Peugeot",
  "Pininfarina","Plymouth","Pontiac","Porsche","Radical","RAM","Renault","Rimac",
  "Rolls-Royce","Ruf","Saab","Saleen","Shelby","Singer","Spyker","SSC","Subaru",
  "Suzuki","Talbot","Tesla","Toyota","TVR","Ultima","Vauxhall","Vector","Venturi",
  "Volkswagen","Volvo","W Motors","Wiesmann","Zenvo","Zimmer",
];

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

async function compressImage(file: File, maxPx = 2048, quality = 0.82): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => resolve(blob ? new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }) : file),
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

const inp: React.CSSProperties = {
  width: '100%',
  background: colors.surface,
  border: `1px solid ${colors.border}`,
  color: colors.textPrimary,
  padding: '12px 16px',
  fontSize: '15px',
  fontFamily: 'Georgia, serif',
  boxSizing: 'border-box',
  outline: 'none',
};

const lbl: React.CSSProperties = {
  display: 'block',
  color: colors.textMuted,
  fontSize: '11px',
  letterSpacing: '2px',
  marginBottom: '8px',
  fontFamily: 'Verdana, sans-serif',
  textTransform: 'uppercase',
};

const hint: React.CSSProperties = {
  color: colors.textMuted,
  fontSize: '11px',
  marginTop: '6px',
  fontFamily: 'Verdana, sans-serif',
};

const sectionHd: React.CSSProperties = {
  color: colors.accent,
  fontSize: '11px',
  letterSpacing: '3px',
  borderBottom: `1px solid ${colors.border}`,
  paddingBottom: '12px',
  marginBottom: '24px',
  marginTop: '40px',
  fontFamily: 'Verdana, sans-serif',
  textTransform: 'uppercase',
  fontWeight: 'normal',
};

const dropRow: React.CSSProperties = {
  padding: '10px 16px',
  cursor: 'pointer',
  fontSize: '13px',
};

export default function SpotForm() {
  const [user, setUser] = useState<{ email: string; username?: string } | null>(null);
  const [makes, setMakes] = useState<Make[]>(MAKES_FALLBACK.map(n => ({ id: null, name: n })));
  const [allModels, setAllModels] = useState<Model[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "loading" | "ok" | "denied">("idle");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ points: number; id: string; hasVin: boolean; firstBonus: boolean } | null>(null);
  const [dupWarning, setDupWarning] = useState<{ message: string } | null>(null);

  const [selectedMake, setSelectedMake] = useState<Make | null>(null);
  const [isOtherBrand, setIsOtherBrand] = useState(false);
  const [customBrand, setCustomBrand] = useState("");

  const [modelQuery, setModelQuery] = useState("");
  const [modelOpen, setModelOpen] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const modelRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    city: "",
    country: "",
    latitude: "",
    longitude: "",
    numberplate: "",
    chassis_number: "",
    submodel: "",
    notes: "",
  });

  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user?.email) return;
      try {
        const { data } = await supabase.from("spotter_profiles").select("username").eq("user_email", user.email).limit(1).single();
        setUser({ email: user.email, username: data?.username });
      } catch {
        setUser({ email: user.email });
      }
    });
    fetch("/api/admin/makes").then(r => r.ok ? r.json() : [])
      .then((dbMakes: { id: string; name: string }[]) => {
        const dbNames = new Set(dbMakes.map(m => m.name));
        const fallbackEntries: Make[] = MAKES_FALLBACK
          .filter(n => !dbNames.has(n))
          .map(n => ({ id: null, name: n }));
        const merged: Make[] = [
          ...dbMakes.map(m => ({ id: m.id, name: m.name })),
          ...fallbackEntries,
        ].sort((a, b) => a.name.localeCompare(b.name));
        setMakes(merged);
      })
      .catch(() => {
        setMakes(MAKES_FALLBACK.map(n => ({ id: null, name: n })));
      });
  }, []);

  useEffect(() => {
    if (!selectedMake) { setAllModels([]); return; }
    setModelsLoading(true);
    fetch(`/api/admin/models?make=${encodeURIComponent(selectedMake.name)}`)
      .then(r => r.ok ? r.json() : [])
      .then(setAllModels)
      .catch(() => setAllModels([]))
      .finally(() => setModelsLoading(false));
  }, [selectedMake?.name]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (modelRef.current && !modelRef.current.contains(e.target as Node)) setModelOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filteredModels = selectedMake
    ? allModels.filter(m => {
        const nameMatch = modelQuery.trim()
          ? m.model.toLowerCase().includes(modelQuery.trim().toLowerCase())
          : true;
        return m.make === selectedMake.name && nameMatch;
      })
    : [];

  const selectModel = (model: Model) => {
    setModelQuery(model.model);
    setSelectedModelId(model.id);
    setModelOpen(false);
  };

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
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

  const handlePhotos = async (files: FileList | null) => {
    const arr = Array.from(files || []);
    const valid = arr.filter(f =>
      f.size <= 10 * 1024 * 1024 && ["image/jpeg", "image/png", "image/webp"].includes(f.type)
    ).slice(0, 10);
    if (valid.length < arr.length) setError("Some photos were skipped (max 10 MB each, JPEG/PNG/WebP only).");
    else setError("");
    const compressed = await Promise.all(valid.map(compressImage));
    setPhotos(compressed);
    Promise.all(compressed.map(f => new Promise<string>(resolve => {
      const r = new FileReader(); r.onload = ev => resolve(ev.target?.result as string); r.readAsDataURL(f);
    }))).then(setPhotoPreviews);
  };

  const addPhotos = async (files: FileList | null) => {
    const arr = Array.from(files || []);
    const valid = arr.filter(f => f.size <= 10 * 1024 * 1024 && ["image/jpeg","image/png","image/webp"].includes(f.type));
    const compressed = await Promise.all(valid.map(compressImage));
    const combined = [...photos, ...compressed].slice(0, 10);
    setPhotos(combined);
    Promise.all(combined.map(f => new Promise<string>(resolve => {
      const r = new FileReader(); r.onload = ev => resolve(ev.target?.result as string); r.readAsDataURL(f);
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
    if (isOtherBrand && !customBrand.trim()) { setError("Please enter the brand name."); return; }
    if (!modelQuery.trim()) { setError("Please enter a model name."); return; }
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
      if (res.status === 409 && data.duplicate_warning) {
        setDupWarning({ message: data.message });
        setLoading(false); return;
      }
      if (!res.ok) { setError(data.error || "Submission failed."); setLoading(false); return; }
      setResult({
        points: data.points_awarded || 10,
        id: data.sighting?.id || "",
        hasVin,
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
      <main style={{ background: colors.bg, color: colors.textPrimary, fontFamily: 'Georgia, serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
          <div style={{ textAlign: 'center', maxWidth: '480px', width: '100%' }}>
            <div style={{ width: '64px', height: '64px', background: '#E8F4EC', border: `2px solid ${colors.success}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '28px', color: colors.success }}>✓</div>
            <h1 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '12px' }}>Spotting submitted!</h1>
            <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderLeft: `3px solid ${colors.success}`, padding: '20px 24px', marginBottom: '24px' }}>
              <p style={{ color: colors.textMuted, fontSize: '11px', letterSpacing: '2px', marginBottom: '8px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>Points Earned</p>
              <p style={{ fontSize: '40px', fontWeight: 'bold', color: colors.success, marginBottom: '4px', fontFamily: 'Georgia, serif' }}>+{result.points}</p>
              {result.firstBonus && <p style={{ color: colors.accent, fontSize: '12px', fontFamily: 'Verdana, sans-serif' }}>Includes +100 first-spotting bonus!</p>}
            </div>
            {!result.hasVin && (
              <div style={{ background: '#FBF3E0', border: `1px solid ${colors.accent}`, padding: '16px 20px', marginBottom: '24px' }}>
                <p style={{ color: '#6A4A10', fontSize: '13px', lineHeight: '1.6' }}>
                  VIN unknown —{" "}
                  {result.id
                    ? <Link href={`/spottings/${result.id}`} style={{ color: colors.accentBlue, textDecoration: 'underline' }}>be the first to identify it</Link>
                    : "be the first to identify it"}{" "}
                  and earn 50 more points.
                </p>
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {result.id && (
                <Link href={`/spottings/${result.id}`}
                  style={{ background: colors.accentNavy, color: '#FFFDF8', padding: '12px 24px', textDecoration: 'none', fontSize: '13px', letterSpacing: '1px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>
                  View Spotting
                </Link>
              )}
              <Link href="/spotters" style={{ border: `1px solid ${colors.accentNavy}`, color: colors.textPrimary, padding: '12px 24px', textDecoration: 'none', fontSize: '13px', letterSpacing: '1px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>
                Leaderboard
              </Link>
              <button onClick={() => {
                setSubmitted(false); setResult(null); setPhotos([]); setPhotoPreviews([]);
                setSelectedMake(null); setIsOtherBrand(false); setCustomBrand(""); setModelQuery(""); setSelectedModelId(null);
                setForm({ city: "", country: "", latitude: "", longitude: "", numberplate: "", chassis_number: "", submodel: "", notes: "" });
              }}
                style={{ border: `1px solid ${colors.border}`, color: colors.textSecondary, padding: '12px 24px', background: 'none', cursor: 'pointer', fontFamily: 'Verdana, sans-serif', fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Submit Another
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: colors.bg, color: colors.textPrimary, fontFamily: 'Georgia, serif', minHeight: '100vh' }}>
      <div className="vv-form-container">
        <p style={{ color: colors.accent, letterSpacing: '3px', fontSize: '11px', marginBottom: '16px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>Car Spotter</p>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '12px' }}>Spot a car</h1>
        <p style={{ color: colors.textSecondary, fontSize: '14px', lineHeight: '1.7', marginBottom: '40px' }}>
          Spotted a rare car in the wild? Log it in 60 seconds and earn points.
        </p>

        {!user && (
          <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, padding: '14px 18px', marginBottom: '28px', fontSize: '13px', color: colors.textSecondary, fontFamily: 'Verdana, sans-serif' }}>
            <Link href="/login" style={{ color: colors.accentBlue }}>Sign in</Link> to earn points and build your spotter reputation.
          </div>
        )}

        {error && (
          <div style={{ background: '#FAE8E8', border: `1px solid ${colors.error}`, color: colors.error, padding: '12px 16px', fontSize: '13px', marginBottom: '24px', fontFamily: 'Verdana, sans-serif' }}>
            {error}
          </div>
        )}

        {dupWarning && (
          <div style={{ background: '#FBF3E0', border: `1px solid ${colors.accent}`, padding: '20px 24px', marginBottom: '24px' }}>
            <p style={{ color: '#6A4A10', fontSize: '14px', marginBottom: '16px' }}>{dupWarning.message}</p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={() => { setDupWarning(null); doSubmit(true); }}
                style={{ background: '#E8F4EC', color: colors.success, border: `1px solid ${colors.success}`, padding: '10px 20px', fontSize: '13px', cursor: 'pointer', fontFamily: 'Verdana, sans-serif' }}>
                Yes, submit anyway
              </button>
              <button onClick={() => setDupWarning(null)}
                style={{ background: 'none', border: `1px solid ${colors.border}`, color: colors.textSecondary, padding: '10px 20px', fontSize: '13px', cursor: 'pointer', fontFamily: 'Verdana, sans-serif' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <form onSubmit={e => { e.preventDefault(); doSubmit(false); }}>

          {/* THE CAR */}
          <h2 style={sectionHd}>The Car</h2>

          {/* Brand */}
          <div style={{ marginBottom: '20px' }}>
            <label style={lbl}>Brand *</label>
            <select
              value={selectedMake?.name || ""}
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
              {makes.map(m => (
                <option key={m.id ?? m.name} value={m.name}>{m.name}</option>
              ))}
              <option value="__other__">Other / New Brand…</option>
            </select>
          </div>

          {isOtherBrand && (
            <div style={{ marginBottom: '20px' }}>
              <label style={lbl}>Brand Name *</label>
              <input
                type="text"
                value={customBrand}
                onChange={e => setCustomBrand(e.target.value)}
                placeholder="Enter brand name e.g. Ultima, Factory Five…"
                autoComplete="off"
                style={inp}
              />
              <p style={{ ...hint, color: colors.warning }}>This brand will be reviewed and added to our database.</p>
            </div>
          )}

          {/* Model */}
          <div style={{ marginBottom: '8px' }} ref={modelRef}>
            <label style={lbl}>Model *</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={modelQuery}
                onChange={e => { setModelQuery(e.target.value); setSelectedModelId(null); setModelOpen(true); }}
                onFocus={() => setModelOpen(true)}
                placeholder={modelsLoading ? "Loading models…" : selectedMake ? "Type model name…" : "e.g. 488, Agera, 911"}
                autoComplete="off"
                style={inp}
              />
              {modelOpen && filteredModels.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: colors.surface, border: `1px solid ${colors.border}`, zIndex: 20, maxHeight: '220px', overflowY: 'auto', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
                  {filteredModels.map(m => (
                    <div key={m.id}
                      onMouseDown={() => selectModel(m)}
                      style={dropRow}
                      onMouseEnter={e => (e.currentTarget.style.background = colors.surfaceAlt)}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {m.model}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {!modelsLoading && modelQuery.trim() && !selectedModelId && (isOtherBrand || (selectedMake && !isOtherBrand)) && (
            <p style={{ ...hint, color: colors.warning, marginTop: '6px' }}>
              Not in our database yet — submit anyway and we will review it.
            </p>
          )}
          {(!modelQuery.trim() || selectedModelId) && (
            <p style={hint}>Enter the model name. Example: Agera, 288 GTO, Countach</p>
          )}

          {/* Submodel */}
          <div style={{ marginBottom: '8px', marginTop: '20px' }}>
            <label style={lbl}>Variant / Edition <span style={{ color: colors.textMuted, fontWeight: 'normal' }}>(optional)</span></label>
            <input
              type="text"
              name="submodel"
              value={form.submodel}
              onChange={handle}
              placeholder="e.g. RS Edition Ghost"
              style={inp}
            />
          </div>
          <p style={{ ...hint, marginBottom: '24px' }}>Optional: enter specific variant or edition. Example: RS Edition Ghost, Spyder, Competition</p>

          {/* PHOTOS */}
          <h2 style={sectionHd}>Photos *</h2>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ ...lbl, marginBottom: '12px' }}>
              {photos.length === 0 ? "Add up to 10 photos" : `${photos.length} photo${photos.length === 1 ? "" : "s"} selected`}
            </label>

            {/* Primary camera input — rear camera on mobile */}
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: colors.accentNavy, color: '#FFFDF8', padding: '12px 24px', fontSize: '13px', cursor: 'pointer', marginBottom: '8px', marginRight: '8px', fontFamily: 'Verdana, sans-serif', letterSpacing: '1px', textTransform: 'uppercase' }}>
              📷 Camera
              <input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={e => handlePhotos(e.target.files)} style={{ display: 'none' }} />
            </label>

            {/* Gallery picker */}
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: colors.surface, border: `1px solid ${colors.border}`, color: colors.textSecondary, padding: '12px 20px', fontSize: '13px', cursor: 'pointer', marginBottom: '16px', fontFamily: 'Verdana, sans-serif', letterSpacing: '1px' }}>
              + Gallery
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e => handlePhotos(e.target.files)} style={{ display: 'none' }} />
            </label>

            {photoPreviews.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {photoPreviews.map((src, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={src} alt={`Photo ${i + 1}`} style={{ width: '90px', height: '70px', objectFit: 'cover', border: `1px solid ${colors.border}` }} />
                    <button type="button" onClick={() => removePhoto(i)}
                      style={{ position: 'absolute', top: '2px', right: '2px', background: colors.error, border: 'none', color: '#fff', width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      ×
                    </button>
                  </div>
                ))}
                {photos.length < 10 && (
                  <label style={{ width: '90px', height: '70px', border: `1px dashed ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: colors.textMuted, fontSize: '22px' }}>
                    +
                    <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e => addPhotos(e.target.files)} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
            )}
            <p style={{ ...hint, marginTop: '8px' }}>Photos are compressed to 2048px automatically. JPEG/PNG/WebP, max 10 MB each.</p>
          </div>

          {/* LOCATION */}
          <h2 style={sectionHd}>Location</h2>

          <div style={{ marginBottom: '20px' }}>
            <label style={lbl}>City / Location *</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="text" name="city" value={form.city} onChange={handle} placeholder="e.g. Monaco, Circuit de Monaco" required style={{ ...inp, flex: 1 }} />
              <button type="button" onClick={detectGPS} title="Detect GPS location"
                style={{
                  background: gpsStatus === "ok" ? '#E8F4EC' : colors.surface,
                  border: `1px solid ${gpsStatus === "ok" ? colors.success : gpsStatus === "denied" ? colors.error : colors.border}`,
                  color: gpsStatus === "ok" ? colors.success : gpsStatus === "denied" ? colors.error : colors.textMuted,
                  padding: '12px 14px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '16px', flexShrink: 0, minWidth: '48px',
                }}>
                {gpsStatus === "loading" ? "…" : "📍"}
              </button>
            </div>
            {gpsStatus === "ok" && <p style={{ color: colors.success, fontSize: '11px', marginTop: '6px', fontFamily: 'Verdana, sans-serif' }}>GPS: {parseFloat(form.latitude).toFixed(4)}, {parseFloat(form.longitude).toFixed(4)}</p>}
            {gpsStatus === "denied" && <p style={{ color: colors.textMuted, fontSize: '11px', marginTop: '6px', fontFamily: 'Verdana, sans-serif' }}>GPS unavailable — country location will be used.</p>}
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={lbl}>Country *</label>
            <select name="country" value={form.country} onChange={handle} required style={{ ...inp, color: form.country ? colors.textPrimary : colors.textMuted }}>
              <option value="">Select country...</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* EARN MORE POINTS */}
          <h2 style={sectionHd}>Earn More Points <span style={{ color: colors.textMuted, fontWeight: 'normal' }}>(optional)</span></h2>

          <div style={{ marginBottom: '20px' }}>
            <label style={lbl}>Numberplate <span style={{ color: colors.success, fontWeight: 'bold' }}>+15 pts</span></label>
            <input type="text" name="numberplate" value={form.numberplate} onChange={handle}
              placeholder="e.g. GTO 288 — add a plate to earn +15 points" style={inp} />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={lbl}>VIN / Chassis Number <span style={{ color: colors.success, fontWeight: 'bold' }}>+30 pts</span></label>
            <input type="text" name="chassis_number" value={form.chassis_number} onChange={handle}
              placeholder="e.g. ZFFPA16B000040099 — add VIN to earn +30 points"
              style={{ ...inp, fontFamily: 'monospace', letterSpacing: '0.5px' }} />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={lbl}>Notes</label>
            <textarea name="notes" value={form.notes} onChange={handle}
              placeholder="Any interesting context? Was it being driven or parked?" rows={3}
              style={{ ...inp, resize: 'vertical' }} />
          </div>

          {/* POINTS PREVIEW */}
          <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderLeft: `3px solid ${colors.accent}`, padding: '20px 24px', marginBottom: '32px' }}>
            <p style={{ color: colors.textMuted, fontSize: '11px', letterSpacing: '2px', marginBottom: '12px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>Points Preview</p>
            <p style={{ fontSize: '13px', color: colors.textPrimary, marginBottom: '12px', fontFamily: 'Verdana, sans-serif' }}>
              Your spotting will earn:{" "}
              <span style={{ color: colors.success }}>10 pts base</span>
              {hasPlate && <span style={{ color: colors.success }}> + 15 pts plate</span>}
              {hasVin && <span style={{ color: colors.success }}> + 30 pts VIN</span>}
              {" = "}
              <span style={{ color: colors.success, fontWeight: 'bold', fontSize: '16px' }}>{points} pts</span>
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Pill earned label="10 pts base" />
              <Pill earned={hasPlate} label="+15 pts plate" />
              <Pill earned={hasVin} label="+30 pts VIN" />
            </div>
          </div>

          <button type="submit" disabled={loading || uploading}
            style={{ background: (loading || uploading) ? colors.textMuted : colors.accentNavy, color: '#FFFDF8', padding: '16px 40px', fontSize: '14px', border: 'none', cursor: (loading || uploading) ? 'not-allowed' : 'pointer', fontFamily: 'Verdana, sans-serif', width: '100%', letterSpacing: '2px', textTransform: 'uppercase' }}>
            {uploading ? 'Uploading Photos...' : loading ? 'Submitting...' : 'Submit Spotting'}
          </button>
        </form>
      </div>
    </main>
  );
}

function Pill({ earned, label }: { earned?: boolean; label: string }) {
  return (
    <span style={{
      padding: '3px 10px',
      fontSize: '11px',
      background: earned ? '#E8F4EC' : colors.surfaceAlt,
      color: earned ? colors.success : colors.textMuted,
      border: `1px solid ${earned ? colors.success : colors.border}`,
      fontFamily: 'Verdana, sans-serif',
    }}>
      {earned ? "✓ " : ""}{label}
    </span>
  );
}
