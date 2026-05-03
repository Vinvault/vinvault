"use client";
import Link from "next/link";
import { useState } from "react";

export default function SubmitCar() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    chassis_number: "",
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

  const handle = (e: any) => setForm({...form, [e.target.name]: e.target.value});

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
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError("Submission failed: " + data.error);
        setLoading(false);
        return;
      }
      setSubmitted(true);
    } catch (err: any) {
      setError("Submission failed: " + err.message);
    }
    setLoading(false);
  };

  const field = (label: string, name: string, placeholder = "", type = "text", required = false) => (
    <div style={{marginBottom: '24px'}}>
      <label style={{display: 'block', color: '#8BA5B8', fontSize: '11px', letterSpacing: '2px', marginBottom: '8px'}}>{label}{required && ' *'}</label>
      <input type={type} name={name} placeholder={placeholder} value={(form as any)[name]} onChange={handle} required={required}
        style={{width: '100%', background: '#0D1E36', border: '1px solid #1E3A5A', color: '#E2EEF7', padding: '12px 16px', fontSize: '14px', fontFamily: 'Georgia, serif', boxSizing: 'border-box' as const}}
      />
    </div>
  );

  const select = (label: string, name: string, options: string[]) => (
    <div style={{marginBottom: '24px'}}>
      <label style={{display: 'block', color: '#8BA5B8', fontSize: '11px', letterSpacing: '2px', marginBottom: '8px'}}>{label}</label>
      <select name={name} value={(form as any)[name]} onChange={handle}
        style={{width: '100%', background: '#0D1E36', border: '1px solid #1E3A5A', color: '#E2EEF7', padding: '12px 16px', fontSize: '14px', fontFamily: 'Georgia, serif'}}>
        <option value="">Select...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  if (submitted) {
    return (
      <main style={{background: '#080F1A', color: '#E2EEF7', fontFamily: 'Georgia, serif', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
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
    <main style={{background: '#080F1A', color: '#E2EEF7', fontFamily: 'Georgia, serif', minHeight: '100vh'}}>
      <header className="vv-header">
        <Link href="/" style={{textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: '10px'}}>
          <span style={{fontSize: '24px', fontWeight: 'bold'}}><span style={{color: '#4A90B8'}}>Vin</span><span style={{color: '#E2EEF7'}}>Vault</span></span>
          <span style={{color: '#4A90B8', fontSize: '10px', letterSpacing: '4px'}}>REGISTRY</span>
        </Link>
        <div style={{color: '#8BA5B8', fontSize: '13px'}}>
          <Link href="/ferrari/288-gto" style={{color: '#4A90B8', textDecoration: 'none'}}>Ferrari 288 GTO</Link>{' → '}Submit a Car
        </div>
      </header>
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
              style={{width: '100%', background: '#0D1E36', border: '1px solid #1E3A5A', color: '#E2EEF7', padding: '12px 16px', fontSize: '14px', fontFamily: 'Georgia, serif', boxSizing: 'border-box' as const, resize: 'vertical'}}/>
          </div>
          {field("SOURCE / REFERENCE", "source", "e.g. Auction catalog, owner contact, magazine article")}
          {field("YOUR EMAIL", "submitter_email", "For follow-up questions", "email")}
          <div style={{marginTop: '40px', padding: '20px', background: '#0A1828', border: '1px solid #1E3A5A', marginBottom: '32px'}}>
            <p style={{color: '#8BA5B8', fontSize: '13px', lineHeight: '1.7', margin: 0}}>By submitting you confirm this information is accurate to the best of your knowledge. False submissions will result in a ban from the registry.</p>
          </div>
          <button type="submit" disabled={loading}
            style={{background: loading ? '#2A4A6A' : '#4A90B8', color: '#fff', padding: '16px 40px', fontSize: '15px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif', width: '100%'}}>
            {loading ? 'SUBMITTING...' : 'SUBMIT FOR REVIEW'}
          </button>
        </form>
      </div>
      <footer style={{borderTop: '1px solid #1E3A5A', padding: '32px 40px', textAlign: 'center', color: '#4A6A8A', fontSize: '13px'}}>
        <span style={{color: '#4A90B8'}}>Vin</span>Vault Registry © 2026 · vinvault.net
      </footer>
    </main>
  );
}
