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
    <a href="/login" style={{ border: "1px solid #E8E2D8", color: "#9A8A7A", padding: "8px 20px", textDecoration: "none", fontSize: "12px", letterSpacing: "1px" }}>
      CLAIM THIS CAR
    </a>
  );

  if (status === "done") return (
    <span style={{ background: "#E8F4EC", color: "#4AB87A", padding: "8px 20px", fontSize: "12px", letterSpacing: "1px" }}>CLAIM SUBMITTED</span>
  );

  if (status === "already") return (
    <span style={{ background: "#FBF3E0", color: "#B8944A", padding: "8px 20px", fontSize: "12px", letterSpacing: "1px" }}>CLAIM PENDING</span>
  );

  if (status === "form" || status === "submitting") return (
    <div style={{ background: "#FFFDF8", border: "1px solid #E8E2D8", padding: "20px", maxWidth: "480px", marginTop: "12px" }}>
      <p style={{ color: "#C9A84C", fontSize: "11px", letterSpacing: "2px", marginBottom: "12px" }}>CLAIM THIS CAR</p>
      <p style={{ color: "#6A5A4A", fontSize: "13px", lineHeight: "1.6", marginBottom: "16px" }}>
        Are you the owner or custodian of chassis {chassis}? Submit a claim for admin review.
      </p>
      <form onSubmit={submit}>
        <textarea value={message} onChange={e => setMessage(e.target.value)}
          placeholder="Brief note: how you can verify ownership (bill of sale, title, etc.)"
          rows={3} maxLength={1000}
          style={{ width: "100%", background: "#F8F6F1", border: "1px solid #E8E2D8", color: "#1A1A1A", padding: "10px 14px", fontSize: "13px", fontFamily: "Verdana, sans-serif", boxSizing: "border-box", resize: "vertical", marginBottom: "12px" }}
        />
        {error && <p style={{ color: "#E07070", fontSize: "13px", marginBottom: "8px" }}>{error}</p>}
        <div style={{ display: "flex", gap: "12px" }}>
          <button type="submit" disabled={status === "submitting"}
            style={{ background: "#C9A84C", color: "#fff", border: "none", padding: "10px 24px", fontSize: "13px", cursor: "pointer", fontFamily: "Verdana, sans-serif" }}>
            {status === "submitting" ? "SUBMITTING…" : "SUBMIT CLAIM"}
          </button>
          <button type="button" onClick={() => setStatus("idle")}
            style={{ background: "none", border: "1px solid #E8E2D8", color: "#6A5A4A", padding: "10px 20px", fontSize: "13px", cursor: "pointer", fontFamily: "Verdana, sans-serif" }}>
            CANCEL
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <button onClick={() => setStatus("form")}
      style={{ border: "1px solid #E8E2D8", color: "#6A5A4A", background: "none", padding: "8px 20px", fontSize: "12px", letterSpacing: "1px", cursor: "pointer", fontFamily: "Verdana, sans-serif" }}>
      CLAIM THIS CAR
    </button>
  );
}
