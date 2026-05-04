"use client";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function ClaimButton({ chassis }: { chassis: string }) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "form" | "submitting" | "done" | "already">("idle");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserEmail(user?.email ?? null));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!userEmail) return;
    setStatus("submitting");
    setError("");
    const res = await fetch("/api/car-claims", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chassis_number: chassis, message }),
    });
    const data = await res.json();
    if (res.status === 409) { setStatus("already"); return; }
    if (!res.ok) { setError(data.error || "Failed to submit."); setStatus("form"); return; }
    setStatus("done");
  }

  if (!userEmail) return (
    <a href="/login" style={{ border: "1px solid #1E3A5A", color: "#4A6A8A", padding: "8px 20px", textDecoration: "none", fontSize: "12px", letterSpacing: "1px" }}>
      CLAIM THIS CAR
    </a>
  );

  if (status === "done") return (
    <span style={{ background: "#0D2A1A", color: "#4AB87A", padding: "8px 20px", fontSize: "12px", letterSpacing: "1px" }}>CLAIM SUBMITTED</span>
  );

  if (status === "already") return (
    <span style={{ background: "#2A1A0D", color: "#B8944A", padding: "8px 20px", fontSize: "12px", letterSpacing: "1px" }}>CLAIM PENDING</span>
  );

  if (status === "form" || status === "submitting") return (
    <div style={{ background: "#0A1828", border: "1px solid #1E3A5A", padding: "20px", maxWidth: "480px", marginTop: "12px" }}>
      <p style={{ color: "#4A90B8", fontSize: "11px", letterSpacing: "2px", marginBottom: "12px" }}>CLAIM THIS CAR</p>
      <p style={{ color: "#8BA5B8", fontSize: "13px", lineHeight: "1.6", marginBottom: "16px" }}>
        Are you the owner or custodian of chassis {chassis}? Submit a claim for admin review.
      </p>
      <form onSubmit={submit}>
        <textarea value={message} onChange={e => setMessage(e.target.value)}
          placeholder="Brief note: how you can verify ownership (bill of sale, title, etc.)"
          rows={3} maxLength={1000}
          style={{ width: "100%", background: "#0D1E36", border: "1px solid #1E3A5A", color: "#E2EEF7", padding: "10px 14px", fontSize: "13px", fontFamily: "Georgia, serif", boxSizing: "border-box", resize: "vertical", marginBottom: "12px" }}
        />
        {error && <p style={{ color: "#E07070", fontSize: "13px", marginBottom: "8px" }}>{error}</p>}
        <div style={{ display: "flex", gap: "12px" }}>
          <button type="submit" disabled={status === "submitting"}
            style={{ background: "#4A90B8", color: "#fff", border: "none", padding: "10px 24px", fontSize: "13px", cursor: "pointer", fontFamily: "Georgia, serif" }}>
            {status === "submitting" ? "SUBMITTING…" : "SUBMIT CLAIM"}
          </button>
          <button type="button" onClick={() => setStatus("idle")}
            style={{ background: "none", border: "1px solid #1E3A5A", color: "#8BA5B8", padding: "10px 20px", fontSize: "13px", cursor: "pointer", fontFamily: "Georgia, serif" }}>
            CANCEL
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <button onClick={() => setStatus("form")}
      style={{ border: "1px solid #1E3A5A", color: "#8BA5B8", background: "none", padding: "8px 20px", fontSize: "12px", letterSpacing: "1px", cursor: "pointer", fontFamily: "Georgia, serif" }}>
      CLAIM THIS CAR
    </button>
  );
}
