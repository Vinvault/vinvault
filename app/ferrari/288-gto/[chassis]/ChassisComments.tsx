"use client";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

interface Comment {
  id: string;
  user_email: string;
  body: string;
  created_at: string;
}

export default function ChassisComments({ chassis }: { chassis: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email ?? null);
      const res = await fetch(`/api/chassis-comments?chassis=${encodeURIComponent(chassis)}`);
      if (res.ok) setComments(await res.json());
      setLoading(false);
    }
    load();
  }, [chassis]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/chassis-comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chassis_number: chassis, body: body.trim() }),
    });
    if (res.ok) {
      const c = await res.json();
      setComments(prev => [c, ...prev]);
      setBody("");
    } else {
      const d = await res.json();
      setError(d.error || "Failed to post comment.");
    }
    setSubmitting(false);
  }

  function maskEmail(email: string) {
    const [local, domain] = email.split("@");
    if (!local || !domain) return email;
    return `${local.slice(0, 2)}${"*".repeat(Math.max(1, local.length - 2))}@${domain}`;
  }

  return (
    <div style={{ marginBottom: "32px" }}>
      <h2 style={{ color: "#4A90B8", fontSize: "11px", letterSpacing: "3px", marginBottom: "20px" }}>DISCUSSION</h2>

      {userEmail ? (
        <form onSubmit={submit} style={{ marginBottom: "24px" }}>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Share what you know about this chassis…"
            maxLength={2000}
            rows={3}
            style={{ width: "100%", background: "#0D1E36", border: "1px solid #1E3A5A", color: "#E2EEF7", padding: "12px 16px", fontSize: "14px", fontFamily: "Georgia, serif", boxSizing: "border-box", resize: "vertical" }}
          />
          {error && <p style={{ color: "#E07070", fontSize: "13px", marginTop: "6px" }}>{error}</p>}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
            <span style={{ color: "#4A6A8A", fontSize: "12px" }}>{body.length}/2000</span>
            <button type="submit" disabled={submitting || !body.trim()}
              style={{ background: submitting ? "#2A4A6A" : "#4A90B8", color: "#fff", border: "none", padding: "10px 24px", fontSize: "13px", cursor: submitting ? "not-allowed" : "pointer", fontFamily: "Georgia, serif", letterSpacing: "1px" }}>
              {submitting ? "POSTING…" : "POST COMMENT"}
            </button>
          </div>
        </form>
      ) : (
        <p style={{ color: "#4A6A8A", fontSize: "14px", marginBottom: "24px", background: "#0A1828", padding: "16px 20px", border: "1px solid #1E3A5A" }}>
          <a href="/login" style={{ color: "#4A90B8", textDecoration: "none" }}>Sign in</a> to leave a comment.
        </p>
      )}

      {loading ? (
        <div style={{ color: "#4A6A8A", fontSize: "14px" }}>Loading comments…</div>
      ) : comments.length === 0 ? (
        <p style={{ color: "#4A6A8A", fontSize: "14px" }}>No comments yet. Be the first to share what you know.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {comments.map(c => (
            <div key={c.id} style={{ background: "#0A1828", border: "1px solid #1E3A5A", padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                <span style={{ color: "#4A90B8", fontSize: "12px" }}>{maskEmail(c.user_email)}</span>
                <span style={{ color: "#4A6A8A", fontSize: "12px" }}>
                  {new Date(c.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              <p style={{ color: "#E2EEF7", fontSize: "14px", lineHeight: "1.7", margin: 0, whiteSpace: "pre-wrap" }}>{c.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
