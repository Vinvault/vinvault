"use client";
import { useState } from "react";

export function ShareButton({ chassis }: { chassis: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `https://www.vinvault.net/ferrari/288-gto/${chassis}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      prompt("Copy this link:", url);
    }
  };

  return (
    <button
      onClick={handleShare}
      style={{ background: "none", border: "1px solid #1E3A5A", color: copied ? "#4AB87A" : "#8BA5B8", padding: "7px 16px", fontSize: "12px", letterSpacing: "1px", cursor: "pointer", fontFamily: "Verdana, sans-serif", transition: "color 0.2s" }}
    >
      {copied ? "Copied!" : "Share"}
    </button>
  );
}

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{ background: "none", border: "1px solid #1E3A5A", color: "#8BA5B8", padding: "7px 16px", fontSize: "12px", letterSpacing: "1px", cursor: "pointer", fontFamily: "Verdana, sans-serif" }}
    >
      Print
    </button>
  );
}
