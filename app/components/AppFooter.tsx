import Link from "next/link";

export default function AppFooter() {
  return (
    <footer style={{ borderTop: "1px solid #1E3A5A", padding: "28px 40px", textAlign: "center", color: "#4A6A8A", fontSize: "13px" }}>
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "center", marginBottom: "10px" }}>
        <Link href="/ferrari/288-gto" style={{ color: "#4A6A8A", textDecoration: "none" }}>Registry</Link>
        <Link href="/spotters" style={{ color: "#4A6A8A", textDecoration: "none" }}>Spotters</Link>
        <Link href="/vin-lookup" style={{ color: "#4A6A8A", textDecoration: "none" }}>VIN Lookup</Link>
        <Link href="/about" style={{ color: "#4A6A8A", textDecoration: "none" }}>About</Link>
        <Link href="/faq" style={{ color: "#4A6A8A", textDecoration: "none" }}>FAQ</Link>
        <Link href="/leaderboard" style={{ color: "#4A6A8A", textDecoration: "none" }}>Leaderboard</Link>
        <Link href="/submit" style={{ color: "#4A6A8A", textDecoration: "none" }}>Submit</Link>
        <Link href="/privacy" style={{ color: "#4A6A8A", textDecoration: "none" }}>Privacy</Link>
        <Link href="/terms" style={{ color: "#4A6A8A", textDecoration: "none" }}>Terms</Link>
      </div>
      <div>© 2026 <span style={{ color: "#4A90B8" }}>Vin</span>Vault — Curated Automotive Registry</div>
    </footer>
  );
}
