"use client";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

interface Props {
  sightingId: string;
  missingPlate: boolean;
  missingVin: boolean;
  missingRegistryLink: boolean;
}

export default function EnrichForm({ sightingId, missingPlate, missingVin, missingRegistryLink }: Props) {
  const [plateInput, setPlateInput] = useState("");
  const [vinInput, setVinInput] = useState("");
  const [registryInput, setRegistryInput] = useState("");
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const supabase = createSupabaseBrowserClient();

  async function enrich(field: string, value: string, action: string) {
    if (!value.trim()) return;
    setSubmitting(field);
    setErrors(e => ({ ...e, [field]: "" }));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        setErrors(e => ({ ...e, [field]: "Sign in to contribute and earn points." }));
        setSubmitting(null); return;
      }

      // Patch the sighting
      const patchBody: Record<string, string> = {};
      if (field === "plate") patchBody.numberplate_seen = value.trim();
      if (field === "vin") patchBody.chassis_number = value.trim().toUpperCase();
      if (field === "registry") patchBody.registry_entry_id = value.trim();

      const res = await fetch(`/api/sightings/enrich`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sightingId, ...patchBody, user_email: user.email, action }),
      });

      if (!res.ok) {
        const d = await res.json();
        setErrors(e => ({ ...e, [field]: d.error || "Failed to submit." }));
        setSubmitting(null); return;
      }

      setDone(d => ({ ...d, [field]: true }));
    } catch {
      setErrors(e => ({ ...e, [field]: "Network error." }));
    }
    setSubmitting(null);
  }

  const inp: React.CSSProperties = {
    flex: 1, background: "#0D1E36", border: "1px solid #1E3A5A",
    color: "#E2EEF7", padding: "10px 14px", fontSize: "13px",
    fontFamily: "Verdana, sans-serif", outline: "none",
  };
  const btn: React.CSSProperties = {
    background: "#0A1828", border: "1px solid #4A90B8", color: "#4A90B8",
    padding: "10px 16px", fontSize: "12px", cursor: "pointer",
    fontFamily: "Verdana, sans-serif", letterSpacing: "1px", flexShrink: 0,
  };

  const items = [
    missingPlate && !done.plate && {
      key: "plate", label: "Add the numberplate", pts: 15, action: "add_numberplate",
      input: plateInput, setInput: setPlateInput, placeholder: "e.g. GTO 288",
    },
    missingVin && !done.vin && {
      key: "vin", label: "Identify the VIN / chassis number", pts: 50, action: "identify_vin",
      input: vinInput, setInput: setVinInput, placeholder: "e.g. ZFFPA16B000040099",
    },
    missingRegistryLink && !done.registry && {
      key: "registry", label: "Link to registry entry (chassis number)", pts: 20, action: "add_registry_field",
      input: registryInput, setInput: setRegistryInput, placeholder: "e.g. ZFFPA16B000040099",
    },
  ].filter(Boolean) as { key: string; label: string; pts: number; action: string; input: string; setInput: (v: string) => void; placeholder: string }[];

  const anyDone = Object.values(done).some(Boolean);

  if (items.length === 0 && !anyDone) return null;

  return (
    <div style={{ background: "#0A1828", border: "1px solid #1E3A5A", padding: "24px" }}>
      <p style={{ color: "#4A90B8", fontSize: "11px", letterSpacing: "3px", marginBottom: "6px" }}>COMMUNITY ENRICHMENT</p>
      <p style={{ color: "#8BA5B8", fontSize: "13px", lineHeight: "1.6", marginBottom: "20px" }}>
        Help complete this record and earn points.
      </p>

      {anyDone && (
        <div style={{ background: "#0D2A1A", border: "1px solid #1E5A3A", padding: "12px 16px", marginBottom: "16px" }}>
          <p style={{ color: "#4AB87A", fontSize: "13px" }}>Thanks for contributing! Points added to your profile.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {items.map(item => (
          <div key={item.key}>
            <p style={{ color: "#E2EEF7", fontSize: "13px", marginBottom: "8px" }}>
              {item.label} — <span style={{ color: "#4AB87A", fontWeight: "bold" }}>+{item.pts} pts</span>
            </p>
            {errors[item.key] && (
              <p style={{ color: "#E07070", fontSize: "12px", marginBottom: "6px" }}>{errors[item.key]}</p>
            )}
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                value={item.input}
                onChange={e => item.setInput(e.target.value)}
                placeholder={item.placeholder}
                style={inp}
                disabled={submitting === item.key}
              />
              <button
                type="button"
                onClick={() => enrich(item.key, item.input, item.action)}
                disabled={submitting === item.key || !item.input.trim()}
                style={{ ...btn, opacity: item.input.trim() ? 1 : 0.5 }}
              >
                {submitting === item.key ? "..." : "SUBMIT"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
