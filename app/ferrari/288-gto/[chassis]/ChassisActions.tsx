"use client";
import Link from "next/link";
import { useState } from "react";
import { colors } from "@/app/components/ui/tokens";

const actionBtn: React.CSSProperties = {
  background: "none",
  border: `1px solid ${colors.border}`,
  color: colors.textMuted,
  padding: "7px 16px",
  fontSize: "11px",
  letterSpacing: "1px",
  cursor: "pointer",
  fontFamily: "Verdana, sans-serif",
  transition: "all 150ms ease",
  textTransform: "uppercase",
};

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
      title="Share — copies URL to clipboard"
      style={{ ...actionBtn, color: copied ? colors.success : colors.textMuted, borderColor: copied ? colors.success : colors.border }}
    >
      {copied ? "✓ Copied!" : "Share"}
    </button>
  );
}

export function ChassisCardButton({ chassis }: { chassis: string }) {
  return (
    <a
      href={`/api/chassis-card?chassis=${encodeURIComponent(chassis)}`}
      target="_blank"
      rel="noopener noreferrer"
      title="Generate shareable chassis card — great for Instagram, Twitter, or car forums"
      style={{ ...actionBtn, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <rect x="1" y="1" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M4 6h4M6 4v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
      Card
    </a>
  );
}

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={actionBtn}
    >
      Print
    </button>
  );
}
