"use client";
import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div style={{ color: "#4AB87A", fontSize: "15px", padding: "16px", border: "1px solid #4AB87A", background: "#E8F4EC" }}>
        ✓ You're subscribed. We'll let you know when new records are added.
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", gap: "0", maxWidth: "440px", margin: "0 auto" }}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        style={{
          flex: 1,
          background: "#F8F6F1",
          border: "1px solid #E8E2D8",
          borderRight: "none",
          color: "#1A1A1A",
          padding: "12px 16px",
          fontSize: "14px",
          fontFamily: "Verdana, sans-serif",
          outline: "none",
          minWidth: 0,
        }}
      />
      <button
        type="submit"
        disabled={status === "loading"}
        style={{
          background: status === "loading" ? "#A88A3A" : "#C9A84C",
          border: "none",
          color: "#fff",
          padding: "12px 24px",
          fontSize: "13px",
          letterSpacing: "1px",
          cursor: status === "loading" ? "not-allowed" : "pointer",
          fontFamily: "Verdana, sans-serif",
          flexShrink: 0,
        }}
      >
        {status === "loading" ? "..." : "Subscribe"}
      </button>
      {status === "error" && (
        <p style={{ color: "#E07070", fontSize: "12px", marginTop: "8px", width: "100%" }}>Something went wrong. Try again.</p>
      )}
    </form>
  );
}
