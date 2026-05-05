"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("vv_cookie_consent");
      if (!consent) setVisible(true);
    } catch {}
  }, []);

  const accept = () => {
    try { localStorage.setItem("vv_cookie_consent", "accepted"); } catch {}
    setVisible(false);
  };

  const decline = () => {
    try { localStorage.setItem("vv_cookie_consent", "declined"); } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: "0",
      left: "0",
      right: "0",
      zIndex: 1000,
      background: "#0A1828",
      borderTop: "1px solid #1E3A5A",
      padding: "16px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "16px",
      flexWrap: "wrap",
      fontFamily: "Verdana, sans-serif",
    }}>
      <p style={{ color: "#8BA5B8", fontSize: "13px", lineHeight: "1.6", margin: 0, maxWidth: "680px" }}>
        VinVault uses essential cookies for authentication and optional analytics cookies to improve the service.{" "}
        <Link href="/privacy" style={{ color: "#4A90B8", textDecoration: "none" }}>Privacy Policy</Link>
      </p>
      <div style={{ display: "flex", gap: "12px", flexShrink: 0 }}>
        <button
          onClick={decline}
          style={{ background: "none", border: "1px solid #1E3A5A", color: "#4A6A8A", padding: "8px 20px", fontSize: "12px", letterSpacing: "1px", cursor: "pointer", fontFamily: "Verdana, sans-serif" }}
        >
          Decline
        </button>
        <button
          onClick={accept}
          style={{ background: "#4A90B8", border: "none", color: "#fff", padding: "8px 20px", fontSize: "12px", letterSpacing: "1px", cursor: "pointer", fontFamily: "Verdana, sans-serif" }}
        >
          Accept
        </button>
      </div>
    </div>
  );
}
