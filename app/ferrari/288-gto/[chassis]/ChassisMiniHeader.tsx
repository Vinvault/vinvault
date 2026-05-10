"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { colors } from "@/app/components/ui/tokens";

interface Props {
  chassis: string;
  color?: string;
  market?: string;
}

export default function ChassisMiniHeader({ chassis, color, market }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 220);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{
      position: "fixed",
      top: visible ? "48px" : "-56px",
      left: 0,
      right: 0,
      zIndex: 80,
      background: colors.surface,
      borderBottom: `1px solid ${colors.border}`,
      borderTop: `2px solid ${colors.accent}`,
      height: "48px",
      display: "flex",
      alignItems: "center",
      padding: "0 40px",
      gap: "16px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
      transition: "top 220ms ease",
    }}>
      <span style={{
        fontFamily: "monospace",
        fontSize: "13px",
        fontWeight: "bold",
        color: colors.textPrimary,
        letterSpacing: "0.5px",
        flexShrink: 0,
      }}>
        {chassis}
      </span>
      {(color || market) && (
        <span style={{
          fontFamily: "Verdana, sans-serif",
          fontSize: "10px",
          color: colors.textMuted,
          letterSpacing: "0.5px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {[color, market].filter(Boolean).join(" · ")}
        </span>
      )}
      <div style={{ marginLeft: "auto", display: "flex", gap: "8px", flexShrink: 0 }}>
        <Link
          href={`/spot?make=Ferrari&model=288GTO&chassis=${encodeURIComponent(chassis)}`}
          style={{
            background: colors.accent,
            color: colors.accentNavy,
            padding: "6px 16px",
            textDecoration: "none",
            fontFamily: "Verdana, sans-serif",
            fontSize: "10px",
            letterSpacing: "1px",
            textTransform: "uppercase",
            fontWeight: "bold",
          }}
        >
          Spot This Car
        </Link>
      </div>
    </div>
  );
}
