import Link from "next/link";
import { colors } from "./ui/tokens";

const FOOTER_LINKS = [
  { href: "/ferrari/288-gto", label: "Registry" },
  { href: "/spotters", label: "Spotters" },
  { href: "/vin-lookup", label: "VIN Lookup" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/submit", label: "Submit" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

const linkStyle: React.CSSProperties = {
  color: "#9A8A7A",
  textDecoration: "none",
  fontFamily: "Verdana, sans-serif",
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "1px",
  transition: "color 150ms ease",
};

export default function AppFooter() {
  return (
    <footer className="vv-footer">
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontFamily: "Georgia, serif", fontSize: "20px", fontWeight: "bold" }}>
          <span style={{ color: colors.accent }}>Vin</span>
          <span style={{ color: "#FFFDF8" }}>Vault</span>
        </span>
        <span style={{ color: "#6A5A4A", fontSize: "9px", fontFamily: "Verdana, sans-serif", letterSpacing: "3px" }}>
          CURATED AUTOMOTIVE REGISTRY
        </span>
      </div>

      <div style={{
        width: "100%",
        maxWidth: "720px",
        height: "1px",
        background: "rgba(255,255,255,0.08)",
      }} />

      <nav style={{ display: "flex", gap: "24px", flexWrap: "wrap", justifyContent: "center" }}>
        {FOOTER_LINKS.map((link) => (
          <Link key={link.href} href={link.href} style={linkStyle}>
            {link.label}
          </Link>
        ))}
      </nav>

      <div style={{
        width: "100%",
        maxWidth: "720px",
        height: "1px",
        background: "rgba(255,255,255,0.08)",
      }} />

      <p style={{ color: "#6A5A4A", fontSize: "11px", fontFamily: "Verdana, sans-serif", margin: 0 }}>
        © 2026 VinVault — All rights reserved
      </p>
    </footer>
  );
}
