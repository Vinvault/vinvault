"use client";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

const ENRICHABLE_FIELDS = [
  { key: "exterior_color", label: "Exterior color", placeholder: "e.g. Rosso Corsa" },
  { key: "interior_color", label: "Interior color", placeholder: "e.g. Tan leather" },
  { key: "original_market", label: "Original market", placeholder: "e.g. Italy, USA" },
  { key: "production_date", label: "Production date", placeholder: "e.g. March 1985" },
  { key: "engine_number", label: "Engine number", placeholder: "e.g. F114C..." },
  { key: "provenance", label: "Provenance / history", placeholder: "Known ownership history, events, etc." },
] as const;

type FieldKey = typeof ENRICHABLE_FIELDS[number]["key"];

interface Props {
  chassis: string;
  emptyFields: FieldKey[];
}

export default function RegistryEnrichForm({ chassis, emptyFields }: Props) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const supabase = createSupabaseBrowserClient();

  const fields = ENRICHABLE_FIELDS.filter(f => emptyFields.includes(f.key) && !done[f.key]);

  if (fields.length === 0) return null;

  async function submit(fieldKey: string) {
    const value = inputs[fieldKey]?.trim();
    if (!value) return;

    setSubmitting(fieldKey);
    setErrors(e => ({ ...e, [fieldKey]: "" }));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        setErrors(e => ({ ...e, [fieldKey]: "Sign in to contribute and earn points." }));
        setSubmitting(null); return;
      }

      const res = await fetch("/api/registry/contribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chassis, field: fieldKey, value, user_email: user.email }),
      });

      if (!res.ok) {
        const d = await res.json();
        setErrors(e => ({ ...e, [fieldKey]: d.error || "Submission failed." }));
        setSubmitting(null); return;
      }

      setDone(d => ({ ...d, [fieldKey]: true }));
    } catch {
      setErrors(e => ({ ...e, [fieldKey]: "Network error." }));
    }
    setSubmitting(null);
  }

  return (
    <div style={{ background: "#0A1828", border: "1px solid #1E3A5A", padding: "24px" }}>
      <p style={{ color: "#4A90B8", fontSize: "11px", letterSpacing: "3px", marginBottom: "6px" }}>ADD DETAILS — EARN POINTS</p>
      <p style={{ color: "#8BA5B8", fontSize: "13px", lineHeight: "1.6", marginBottom: "20px" }}>
        Help complete this chassis record. Each field earns <span style={{ color: "#4AB87A" }}>+20 points</span>.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {fields.map(field => (
          <div key={field.key}>
            <p style={{ color: "#E2EEF7", fontSize: "12px", letterSpacing: "1px", marginBottom: "6px" }}>
              {field.label.toUpperCase()}
            </p>
            {errors[field.key] && (
              <p style={{ color: "#E07070", fontSize: "12px", marginBottom: "4px" }}>{errors[field.key]}</p>
            )}
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                value={inputs[field.key] || ""}
                onChange={e => setInputs(i => ({ ...i, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                style={{ flex: 1, background: "#0D1E36", border: "1px solid #1E3A5A", color: "#E2EEF7", padding: "10px 14px", fontSize: "13px", fontFamily: "Verdana, sans-serif", outline: "none" }}
                disabled={submitting === field.key}
                onKeyDown={e => e.key === "Enter" && submit(field.key)}
              />
              <button
                type="button"
                onClick={() => submit(field.key)}
                disabled={submitting === field.key || !inputs[field.key]?.trim()}
                style={{ background: "#0A1828", border: "1px solid #4A90B8", color: "#4A90B8", padding: "10px 16px", fontSize: "12px", cursor: "pointer", fontFamily: "Verdana, sans-serif", letterSpacing: "1px", flexShrink: 0, opacity: inputs[field.key]?.trim() ? 1 : 0.5 }}
              >
                {submitting === field.key ? "..." : "+20"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {Object.values(done).some(Boolean) && (
        <p style={{ color: "#4AB87A", fontSize: "12px", marginTop: "16px" }}>
          Contribution saved! Points added to your profile.
        </p>
      )}
    </div>
  );
}
