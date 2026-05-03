"use client";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main style={{ background: "#080F1A", color: "#E2EEF7", fontFamily: "Georgia, serif", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header className="vv-header">
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "baseline", gap: "10px" }}>
          <span style={{ fontSize: "24px", fontWeight: "bold" }}>
            <span style={{ color: "#4A90B8" }}>Vin</span><span style={{ color: "#E2EEF7" }}>Vault</span>
          </span>
          <span style={{ color: "#4A90B8", fontSize: "10px", letterSpacing: "4px" }}>REGISTRY</span>
        </Link>
      </header>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 20px" }}>
        <div style={{ textAlign: "center", maxWidth: "520px" }}>
          <p style={{ color: "#E07070", letterSpacing: "4px", fontSize: "11px", marginBottom: "24px" }}>SOMETHING WENT WRONG</p>
          <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "16px" }}>An error occurred</h1>
          <p style={{ color: "#8BA5B8", fontSize: "15px", lineHeight: "1.7", marginBottom: "40px" }}>
            An unexpected error occurred while loading this page. This has been logged. You can try again or return to the homepage.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={reset}
              style={{ background: "#4A90B8", color: "#fff", padding: "12px 28px", border: "none", fontSize: "13px", letterSpacing: "2px", cursor: "pointer", fontFamily: "Georgia, serif" }}
            >
              TRY AGAIN
            </button>
            <Link href="/" style={{ border: "1px solid #4A90B8", color: "#4A90B8", padding: "12px 28px", textDecoration: "none", fontSize: "13px" }}>
              HOME
            </Link>
          </div>
        </div>
      </div>

      <footer style={{ borderTop: "1px solid #1E3A5A", padding: "28px 40px", textAlign: "center", color: "#4A6A8A", fontSize: "13px" }}>
        <span style={{ color: "#4A90B8" }}>Vin</span>Vault Registry © 2026
      </footer>
    </main>
  );
}
