"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import AppHeader from "@/app/components/AppHeader";
import AppFooter from "@/app/components/AppFooter";
import { createSupabaseBrowserClient } from "@/lib/supabase";

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

  const handle = (e: any) => setForm({...form, [e.target.name]: e.target.value});
  const handleFlag = (e: any) => {
    const { name, type, checked, value } = e.target;
    setFlags(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async (e: any) => {
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
      // Upload photos if user is logged in and has selected files
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
    } catch (err: any) {
      setError("Submission failed: " + err.message);
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
    <div style={{marginBottom: '24px'}}>
      <label style={{display: 'block', color: '#8BA5B8', fontSize: '11px', letterSpacing: '2px', marginBottom: '8px'}}>{label}{required && ' *'}</label>
      <input type={type} name={name} placeholder={placeholder} value={(form as any)[name]} onChange={handle} required={required}
        style={{width: '100%', background: '#0D1E36', border: '1px solid #1E3A5A', color: '#E2EEF7', padding: '12px 16px', fontSize: '14px', fontFamily: 'Verdana, sans-serif', boxSizing: 'border-box' as const}}
      />
    </div>
  );

  const select = (label: string, name: string, options: string[]) => (
    <div style={{marginBottom: '24px'}}>
      <label style={{display: 'block', color: '#8BA5B8', fontSize: '11px', letterSpacing: '2px', marginBottom: '8px'}}>{label}</label>
      <select name={name} value={(form as any)[name]} onChange={handle}
        style={{width: '100%', background: '#0D1E36', border: '1px solid #1E3A5A', color: '#E2EEF7', padding: '12px 16px', fontSize: '14px', fontFamily: 'Verdana, sans-serif'}}>
        <option value="">Select...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  if (submitted) {
    return (
      <main style={{background: '#080F1A', color: '#E2EEF7', fontFamily: 'Verdana, sans-serif', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{textAlign: 'center', maxWidth: '500px'}}>
          <div style={{fontSize: '48px', marginBottom: '24px', color: '#4AB87A'}}>✓</div>
          <h1 style={{fontSize: '28px', marginBottom: '16px'}}>Submission Received</h1>
          <p style={{color: '#8BA5B8', lineHeight: '1.7', marginBottom: '32px'}}>Thank you for contributing to the Ferrari 288 GTO World Registry. Your submission will be reviewed by our community validators before being published.</p>
          <Link href="/registry/ferrari-288-gto" style={{background: '#4A90B8', color: '#fff', padding: '12px 28px', textDecoration: 'none'}}>Back to Registry</Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{background: '#080F1A', color: '#E2EEF7', fontFamily: 'Verdana, sans-serif', minHeight: '100vh'}}>
      <AppHeader />
      <nav style={{padding: '14px 40px', background: '#0A1828', borderBottom: '1px solid #1E3A5A', fontSize: '12px', color: '#4A6A8A', display: 'flex', gap: '6px', flexWrap: 'wrap'}}>
        <Link href="/" style={{color: '#4A6A8A', textDecoration: 'none'}}>Home</Link>
        <span style={{color: '#1E3A5A'}}>/</span>
        <Link href="/ferrari/288-gto" style={{color: '#4A6A8A', textDecoration: 'none'}}>Ferrari 288 GTO</Link>
        <span style={{color: '#1E3A5A'}}>/</span>
        <span style={{color: '#8BA5B8'}}>Submit a Car</span>
      </nav>
      <div className="vv-form-container">
        <p style={{color: '#4A90B8', letterSpacing: '3px', fontSize: '11px', marginBottom: '16px'}}>FERRARI 288 GTO · WORLD REGISTRY</p>
        <h1 style={{fontSize: '36px', fontWeight: 'bold', marginBottom: '16px'}}>Submit a Car</h1>
        <p style={{color: '#8BA5B8', lineHeight: '1.7', marginBottom: '48px'}}>Help us complete the registry. Fill in as much detail as you know — every field helps. All submissions are reviewed by community validators before being published.</p>
        {error && <div style={{background: '#2A0D0D', border: '1px solid #8A2A2A', color: '#E07070', padding: '12px 16px', fontSize: '13px', marginBottom: '24px'}}>{error}</div>}
        <form onSubmit={submit}>
          <h2 style={{color: '#4A90B8', fontSize: '11px', letterSpacing: '3px', marginBottom: '24px', borderBottom: '1px solid #1E3A5A', paddingBottom: '12px'}}>IDENTITY</h2>
          {field("CHASSIS NUMBER", "chassis_number", "e.g. ZFFPA16B000040001", "text", true)}
          {field("ENGINE NUMBER", "engine_number", "e.g. F114A000040001")}
          {field("GEARBOX NUMBER", "gearbox_number", "")}
          {field("PRODUCTION DATE", "production_date", "e.g. March 1984")}
          {select("ORIGINAL MARKET", "original_market", ["Italy", "USA", "Germany", "Japan", "UK", "France", "Switzerland", "Other"])}
          <h2 style={{color: '#4A90B8', fontSize: '11px', letterSpacing: '3px', marginBottom: '24px', borderBottom: '1px solid #1E3A5A', paddingBottom: '12px', marginTop: '40px'}}>APPEARANCE</h2>
          {field("EXTERIOR COLOR", "exterior_color", "e.g. Rosso Corsa")}
          {field("INTERIOR COLOR", "interior_color", "e.g. Nero")}
          <h2 style={{color: '#4A90B8', fontSize: '11px', letterSpacing: '3px', marginBottom: '24px', borderBottom: '1px solid #1E3A5A', paddingBottom: '12px', marginTop: '40px'}}>CONDITION</h2>
          {select("MATCHING NUMBERS", "matching_numbers", ["Yes", "No", "Unknown"])}
          {select("CONDITION SCORE", "condition_score", ["10 - Concours", "9 - Excellent", "8 - Very Good", "7 - Good", "6 - Fair", "5 - Poor"])}
          {select("SERVICE HISTORY", "has_service_history", ["Present", "Partial", "Missing"])}
          {select("ORIGINAL BOOKS", "has_books", ["Present", "Missing"])}
          {select("ORIGINAL TOOLKIT", "has_toolkit", ["Present", "Missing"])}
          <h2 style={{color: '#4A90B8', fontSize: '11px', letterSpacing: '3px', marginBottom: '24px', borderBottom: '1px solid #1E3A5A', paddingBottom: '12px', marginTop: '40px'}}>PROVENANCE & SOURCE</h2>
          <div style={{marginBottom: '24px'}}>
            <label style={{display: 'block', color: '#8BA5B8', fontSize: '11px', letterSpacing: '2px', marginBottom: '8px'}}>KNOWN HISTORY</label>
            <textarea name="provenance" value={form.provenance} onChange={handle} placeholder="Describe what you know about this car's history..." rows={5}
              style={{width: '100%', background: '#0D1E36', border: '1px solid #1E3A5A', color: '#E2EEF7', padding: '12px 16px', fontSize: '14px', fontFamily: 'Verdana, sans-serif', boxSizing: 'border-box' as const, resize: 'vertical'}}/>
          </div>
          {field("SOURCE / REFERENCE", "source", "e.g. Auction catalog, owner contact, magazine article")}
          {field("YOUR EMAIL", "submitter_email", "For follow-up questions", "email")}

          <h2 style={{color: '#4A90B8', fontSize: '11px', letterSpacing: '3px', marginBottom: '24px', borderBottom: '1px solid #1E3A5A', paddingBottom: '12px', marginTop: '40px'}}>SPECIAL DESIGNATIONS (OPTIONAL)</h2>
          <p style={{color: '#4A6A8A', fontSize: '12px', lineHeight: '1.6', marginBottom: '20px'}}>Check any special status flags that apply to this car. These will appear as badges on the car record.</p>

          {[
            { name: "is_one_off", label: "ONE-OFF — This is a unique, one-of-a-kind car" },
            { name: "is_prototype", label: "PROTOTYPE — This is a pre-production prototype" },
            { name: "is_film_car", label: "FILM CAR — This car appeared in a film or TV production" },
            { name: "is_music_video_car", label: "MUSIC VIDEO CAR — This car appeared in a music video" },
          ].map(({ name, label }) => (
            <div key={name} style={{marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px'}}>
              <input
                type="checkbox"
                id={name}
                name={name}
                checked={(flags as any)[name]}
                onChange={handleFlag}
                style={{marginTop: '2px', accentColor: '#4A90B8', width: '16px', height: '16px', flexShrink: 0}}
              />
              <label htmlFor={name} style={{color: '#8BA5B8', fontSize: '13px', cursor: 'pointer'}}>{label}</label>
            </div>
          ))}

          {flags.is_film_car && (
            <div style={{marginBottom: '24px', marginTop: '8px'}}>
              <label style={{display: 'block', color: '#8BA5B8', fontSize: '11px', letterSpacing: '2px', marginBottom: '8px'}}>FILM DETAILS</label>
              <textarea name="film_details" value={flags.film_details} onChange={handleFlag} placeholder="e.g. Ferrari 288 GTO used in Magnum P.I. (1984), driven by Tom Selleck" rows={3}
                style={{width: '100%', background: '#0D1E36', border: '1px solid #1E3A5A', color: '#E2EEF7', padding: '12px 16px', fontSize: '14px', fontFamily: 'Verdana, sans-serif', boxSizing: 'border-box' as const, resize: 'vertical'}}/>
            </div>
          )}

          {flags.is_music_video_car && (
            <div style={{marginBottom: '24px', marginTop: '8px'}}>
              <label style={{display: 'block', color: '#8BA5B8', fontSize: '11px', letterSpacing: '2px', marginBottom: '8px'}}>MUSIC VIDEO DETAILS</label>
              <textarea name="music_video_details" value={flags.music_video_details} onChange={handleFlag} placeholder="e.g. Appeared in the music video for '…'" rows={3}
                style={{width: '100%', background: '#0D1E36', border: '1px solid #1E3A5A', color: '#E2EEF7', padding: '12px 16px', fontSize: '14px', fontFamily: 'Verdana, sans-serif', boxSizing: 'border-box' as const, resize: 'vertical'}}/>
            </div>
          )}

          <h2 style={{color: '#4A90B8', fontSize: '11px', letterSpacing: '3px', marginBottom: '24px', borderBottom: '1px solid #1E3A5A', paddingBottom: '12px', marginTop: '40px'}}>PHOTOS (OPTIONAL)</h2>
          {userEmail ? (
            <div style={{marginBottom: '24px'}}>
              <label style={{display: 'block', color: '#8BA5B8', fontSize: '11px', letterSpacing: '2px', marginBottom: '8px'}}>UPLOAD PHOTOS</label>
              <label style={{display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#0A1828', border: '1px solid #1E3A5A', color: '#8BA5B8', padding: '10px 20px', fontSize: '13px', cursor: 'pointer', marginBottom: '12px'}}>
                + Choose Photos (max 10, 5 MB each)
                <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handlePhotoChange} style={{display: 'none'}} />
              </label>
              {photoError && <p style={{color: '#E07070', fontSize: '13px', marginBottom: '8px'}}>{photoError}</p>}
              {photoFiles.length > 0 && (
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px'}}>
                  {photoFiles.map((f, i) => (
                    <div key={i} style={{background: '#0A1828', border: '1px solid #1E3A5A', padding: '4px 10px', fontSize: '12px', color: '#8BA5B8', display: 'flex', alignItems: 'center', gap: '8px'}}>
                      {f.name}
                      <button type="button" onClick={() => setPhotoFiles(prev => prev.filter((_, j) => j !== i))}
                        style={{background: 'none', border: 'none', color: '#4A6A8A', cursor: 'pointer', fontSize: '14px', padding: '0', lineHeight: 1}}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{marginBottom: '24px', background: '#0A1828', border: '1px solid #1E3A5A', padding: '16px 20px'}}>
              <p style={{color: '#8BA5B8', fontSize: '13px', lineHeight: '1.7', margin: 0}}>
                <Link href="/login" style={{color: '#4A90B8', textDecoration: 'none'}}>Sign in</Link> to upload photos with your submission. You can also add photos later from the car detail page.
              </p>
            </div>
          )}

          <div style={{marginTop: '24px', padding: '20px', background: '#0A1828', border: '1px solid #1E3A5A', marginBottom: '32px'}}>
            <p style={{color: '#8BA5B8', fontSize: '13px', lineHeight: '1.7', margin: 0}}>By submitting you confirm this information is accurate to the best of your knowledge. False submissions will result in a ban from the registry.</p>
          </div>
          <button type="submit" disabled={loading || uploadingPhotos}
            style={{background: loading ? '#2A4A6A' : '#4A90B8', color: '#fff', padding: '16px 40px', fontSize: '15px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Verdana, sans-serif', width: '100%'}}>
            {uploadingPhotos ? 'UPLOADING PHOTOS...' : loading ? 'SUBMITTING...' : 'SUBMIT FOR REVIEW'}
          </button>
        </form>
      </div>
      <AppFooter />
    </main>
  );
}
