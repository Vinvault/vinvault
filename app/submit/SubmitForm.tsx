"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { colors } from "@/app/components/ui/tokens";
import Breadcrumb from "@/app/components/Breadcrumb";

const inp: React.CSSProperties = {
  width: '100%',
  background: colors.surface,
  border: `1px solid ${colors.border}`,
  color: colors.textPrimary,
  padding: '12px 16px',
  fontSize: '14px',
  fontFamily: 'Georgia, serif',
  boxSizing: 'border-box' as const,
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

const sectionHd: React.CSSProperties = {
  color: colors.accent,
  fontSize: '11px',
  letterSpacing: '3px',
  marginBottom: '24px',
  borderBottom: `1px solid ${colors.border}`,
  paddingBottom: '12px',
  marginTop: '40px',
  fontFamily: 'Verdana, sans-serif',
  textTransform: 'uppercase',
  fontWeight: 'normal',
};

export default function SubmitForm({ prefillChassis }: { prefillChassis?: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoError, setPhotoError] = useState("");
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserEmail(user?.email ?? null));
  }, []);

  const [form, setForm] = useState({
    chassis_number: prefillChassis || "",
    engine_number: "",
    gearbox_number: "",
    production_date: "",
    original_market: "",
    exterior_color: "",
    interior_color: "",
    matching_numbers: "",
    condition_score: "",
    has_service_history: "",
    has_books: "",
    has_toolkit: "",
    provenance: "",
    source: "",
    submitter_email: "",
  });

  const [flags, setFlags] = useState({
    is_one_off: false,
    is_prototype: false,
    is_film_car: false,
    film_details: "",
    is_music_video_car: false,
    music_video_details: "",
  });

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFlag = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, type } = e.target;
    const value = type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFlags(prev => ({ ...prev, [name]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (!form.chassis_number) {
      setError("Chassis number is required.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, ...flags }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError("Submission failed: " + data.error);
        setLoading(false);
        return;
      }
      if (userEmail && photoFiles.length > 0) {
        setUploadingPhotos(true);
        const chassis = form.chassis_number.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
        await Promise.all(
          photoFiles.map(async (file) => {
            const path = `${chassis}/${Date.now()}_${Math.random().toString(36).slice(2)}.${file.name.split(".").pop()}`;
            await supabase.storage.from("chassis-photos").upload(path, file);
          })
        );
        setUploadingPhotos(false);
      }
      setSubmitted(true);
    } catch (err: unknown) {
      setError("Submission failed: " + (err instanceof Error ? err.message : String(err)));
    }
    setLoading(false);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setPhotoError("");
    const valid = files.filter(f => {
      if (f.size > 5 * 1024 * 1024) { setPhotoError("Max 5 MB per photo."); return false; }
      if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) { setPhotoError("JPEG, PNG, or WebP only."); return false; }
      return true;
    });
    setPhotoFiles(valid.slice(0, 10));
  };

  const field = (label: string, name: string, placeholder = "", type = "text", required = false) => (
    <div style={{ marginBottom: '24px' }}>
      <label style={lbl}>{label}{required ? ' *' : ''}</label>
      <input type={type} name={name} placeholder={placeholder} value={(form as Record<string, string>)[name]} onChange={handle} required={required} style={inp} />
    </div>
  );

  const select = (label: string, name: string, options: string[]) => (
    <div style={{ marginBottom: '24px' }}>
      <label style={lbl}>{label}</label>
      <select name={name} value={(form as Record<string, string>)[name]} onChange={handle} style={{ ...inp, color: (form as Record<string, string>)[name] ? colors.textPrimary : colors.textMuted }}>
        <option value="">Select...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  if (submitted) {
    return (
      <main style={{ background: colors.bg, color: colors.textPrimary, fontFamily: 'Georgia, serif', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: '500px', padding: '40px 20px' }}>
          <div style={{ width: '64px', height: '64px', background: '#E8F4EC', border: `2px solid ${colors.success}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '28px', color: colors.success }}>✓</div>
          <h1 style={{ fontSize: '28px', marginBottom: '16px', fontWeight: 'bold' }}>Submission Received</h1>
          <p style={{ color: colors.textSecondary, lineHeight: '1.7', marginBottom: '32px' }}>
            Thank you for contributing to the Ferrari 288 GTO World Registry. Your submission will be reviewed by our community validators before being published.
          </p>
          <Link href="/ferrari/288-gto" style={{ background: colors.accentNavy, color: '#FFFDF8', padding: '12px 28px', textDecoration: 'none', fontFamily: 'Verdana, sans-serif', fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Back to Registry
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: colors.bg, color: colors.textPrimary, fontFamily: 'Georgia, serif', minHeight: '100vh' }}>
      <Breadcrumb crumbs={[{ label: "Home", href: "/" }, { label: "Ferrari 288 GTO", href: "/ferrari/288-gto" }, { label: "Submit a Car" }]} />
      <div className="vv-form-container">
        <p style={{ color: colors.accent, letterSpacing: '3px', fontSize: '11px', marginBottom: '16px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>Ferrari 288 GTO · World Registry</p>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px' }}>Submit a Car</h1>
        <p style={{ color: colors.textSecondary, lineHeight: '1.7', marginBottom: '48px' }}>
          Help us complete the registry. Fill in as much detail as you know — every field helps. All submissions are reviewed by community validators before being published.
        </p>
        {error && (
          <div style={{ background: '#FAE8E8', border: `1px solid ${colors.error}`, color: colors.error, padding: '12px 16px', fontSize: '13px', marginBottom: '24px', fontFamily: 'Verdana, sans-serif' }}>
            {error}
          </div>
        )}
        <form onSubmit={submit}>
          <h2 style={sectionHd}>Identity</h2>
          {field("Chassis Number", "chassis_number", "e.g. ZFFPA16B000040001", "text", true)}
          {field("Engine Number", "engine_number", "e.g. F114A000040001")}
          {field("Gearbox Number", "gearbox_number", "")}
          {field("Production Date", "production_date", "e.g. March 1984")}
          {select("Original Market", "original_market", ["Italy", "USA", "Germany", "Japan", "UK", "France", "Switzerland", "Other"])}

          <h2 style={sectionHd}>Appearance</h2>
          {field("Exterior Color", "exterior_color", "e.g. Rosso Corsa")}
          {field("Interior Color", "interior_color", "e.g. Nero")}

          <h2 style={sectionHd}>Condition</h2>
          {select("Matching Numbers", "matching_numbers", ["Yes", "No", "Unknown"])}
          {select("Condition Score", "condition_score", ["10 - Concours", "9 - Excellent", "8 - Very Good", "7 - Good", "6 - Fair", "5 - Poor"])}
          {select("Service History", "has_service_history", ["Present", "Partial", "Missing"])}
          {select("Original Books", "has_books", ["Present", "Missing"])}
          {select("Original Toolkit", "has_toolkit", ["Present", "Missing"])}

          <h2 style={sectionHd}>Provenance & Source</h2>
          <div style={{ marginBottom: '24px' }}>
            <label style={lbl}>Known History</label>
            <textarea name="provenance" value={form.provenance} onChange={handle} placeholder="Describe what you know about this car's history..." rows={5}
              style={{ ...inp, resize: 'vertical' }} />
          </div>
          {field("Source / Reference", "source", "e.g. Auction catalog, owner contact, magazine article")}
          {field("Your Email", "submitter_email", "For follow-up questions", "email")}

          <h2 style={sectionHd}>Special Designations <span style={{ color: colors.textMuted, fontWeight: 'normal' }}>(optional)</span></h2>
          <p style={{ color: colors.textMuted, fontSize: '12px', lineHeight: '1.6', marginBottom: '20px', fontFamily: 'Verdana, sans-serif' }}>
            Check any special status flags that apply to this car. These will appear as badges on the car record.
          </p>

          {[
            { name: "is_one_off", label: "One-Off — This is a unique, one-of-a-kind car" },
            { name: "is_prototype", label: "Prototype — This is a pre-production prototype" },
            { name: "is_film_car", label: "Film Car — This car appeared in a film or TV production" },
            { name: "is_music_video_car", label: "Music Video Car — This car appeared in a music video" },
          ].map(({ name, label }) => (
            <div key={name} style={{ marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <input
                type="checkbox"
                id={name}
                name={name}
                checked={(flags as Record<string, boolean | string>)[name] as boolean}
                onChange={handleFlag}
                style={{ marginTop: '2px', accentColor: colors.accent, width: '16px', height: '16px', flexShrink: 0 }}
              />
              <label htmlFor={name} style={{ color: colors.textSecondary, fontSize: '13px', cursor: 'pointer', fontFamily: 'Verdana, sans-serif' }}>{label}</label>
            </div>
          ))}

          {flags.is_film_car && (
            <div style={{ marginBottom: '24px', marginTop: '8px' }}>
              <label style={lbl}>Film Details</label>
              <textarea name="film_details" value={flags.film_details} onChange={handleFlag} placeholder="e.g. Ferrari 288 GTO used in Magnum P.I. (1984), driven by Tom Selleck" rows={3}
                style={{ ...inp, resize: 'vertical' }} />
            </div>
          )}

          {flags.is_music_video_car && (
            <div style={{ marginBottom: '24px', marginTop: '8px' }}>
              <label style={lbl}>Music Video Details</label>
              <textarea name="music_video_details" value={flags.music_video_details} onChange={handleFlag} placeholder="e.g. Appeared in the music video for '…'" rows={3}
                style={{ ...inp, resize: 'vertical' }} />
            </div>
          )}

          <h2 style={sectionHd}>Photos <span style={{ color: colors.textMuted, fontWeight: 'normal' }}>(optional)</span></h2>
          {userEmail ? (
            <div style={{ marginBottom: '24px' }}>
              <label style={lbl}>Upload Photos</label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: colors.surface, border: `1px solid ${colors.border}`, color: colors.textSecondary, padding: '10px 20px', fontSize: '13px', cursor: 'pointer', marginBottom: '12px', fontFamily: 'Verdana, sans-serif' }}>
                + Choose Photos (max 10, 5 MB each)
                <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handlePhotoChange} style={{ display: 'none' }} />
              </label>
              {photoError && <p style={{ color: colors.error, fontSize: '13px', marginBottom: '8px', fontFamily: 'Verdana, sans-serif' }}>{photoError}</p>}
              {photoFiles.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                  {photoFiles.map((f, i) => (
                    <div key={i} style={{ background: colors.surfaceAlt, border: `1px solid ${colors.border}`, padding: '4px 10px', fontSize: '12px', color: colors.textSecondary, display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Verdana, sans-serif' }}>
                      {f.name}
                      <button type="button" onClick={() => setPhotoFiles(prev => prev.filter((_, j) => j !== i))}
                        style={{ background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer', fontSize: '14px', padding: '0', lineHeight: 1 }}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ marginBottom: '24px', background: colors.surface, border: `1px solid ${colors.border}`, padding: '16px 20px' }}>
              <p style={{ color: colors.textSecondary, fontSize: '13px', lineHeight: '1.7', margin: 0 }}>
                <Link href="/login" style={{ color: colors.accentBlue, textDecoration: 'none' }}>Sign in</Link> to upload photos with your submission. You can also add photos later from the car detail page.
              </p>
            </div>
          )}

          <div style={{ marginTop: '24px', padding: '20px', background: colors.surfaceAlt, border: `1px solid ${colors.border}`, marginBottom: '32px' }}>
            <p style={{ color: colors.textSecondary, fontSize: '13px', lineHeight: '1.7', margin: 0 }}>
              By submitting you confirm this information is accurate to the best of your knowledge. False submissions will result in a ban from the registry.
            </p>
          </div>
          <button type="submit" disabled={loading || uploadingPhotos}
            style={{ background: loading ? colors.textMuted : colors.accentNavy, color: '#FFFDF8', padding: '16px 40px', fontSize: '14px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Verdana, sans-serif', width: '100%', letterSpacing: '2px', textTransform: 'uppercase' }}>
            {uploadingPhotos ? 'Uploading Photos...' : loading ? 'Submitting...' : 'Submit for Review'}
          </button>
        </form>
      </div>
    </main>
  );
}
