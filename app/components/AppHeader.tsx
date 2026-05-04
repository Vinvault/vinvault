"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

interface NavItem {
  href: string;
  label: string;
  highlight?: boolean;
}

interface AppHeaderProps {
  nav?: NavItem[];
  adminBadge?: boolean;
}

const DEFAULT_NAV: NavItem[] = [
  { href: "/ferrari/288-gto", label: "Registry" },
  { href: "/about", label: "About" },
  { href: "/submit", label: "Submit", highlight: true },
];

export default function AppHeader({ nav = DEFAULT_NAV, adminBadge = false }: AppHeaderProps) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserEmail(user?.email ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const shortEmail = userEmail
    ? userEmail.length > 22
      ? userEmail.split("@")[0].slice(0, 14) + "…"
      : userEmail
    : null;

  return (
    <header className="vv-header">
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "baseline", gap: "10px" }}>
          <span style={{ fontSize: "24px", fontWeight: "bold" }}>
            <span style={{ color: "#4A90B8" }}>Vin</span><span style={{ color: "#E2EEF7" }}>Vault</span>
          </span>
          <span style={{ color: "#4A90B8", fontSize: "10px", letterSpacing: "4px" }}>REGISTRY</span>
        </Link>
        {adminBadge && (
          <span style={{ color: "#E07070", fontSize: "10px", letterSpacing: "2px", marginLeft: "8px" }}>ADMIN</span>
        )}
      </div>

      {/* Hamburger - mobile only */}
      <button
        className="vv-hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        <span className={`vv-hline${menuOpen ? " vv-hline-open-1" : ""}`} />
        <span className={`vv-hline${menuOpen ? " vv-hline-open-2" : ""}`} />
        <span className={`vv-hline${menuOpen ? " vv-hline-open-3" : ""}`} />
      </button>

      <nav className={`vv-nav${menuOpen ? " vv-nav-open" : ""}`} style={{ fontSize: "13px" }}>
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMenuOpen(false)}
            style={{
              color: item.highlight ? "#4A90B8" : "#8BA5B8",
              textDecoration: "none",
              padding: "6px 12px",
              ...(item.highlight ? { border: "1px solid #4A90B8" } : {}),
            }}
          >
            {item.label}
          </Link>
        ))}

        {userEmail ? (
          <>
            <Link
              href="/profile"
              onClick={() => setMenuOpen(false)}
              style={{
                color: "#8BA5B8",
                textDecoration: "none",
                padding: "6px 12px",
                fontSize: "13px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "200px",
                whiteSpace: "nowrap",
              }}
              title={userEmail}
            >
              {shortEmail}
            </Link>
            <button
              onClick={handleSignOut}
              style={{
                background: "none",
                border: "1px solid #1E3A5A",
                color: "#4A6A8A",
                padding: "6px 14px",
                fontSize: "13px",
                cursor: "pointer",
                fontFamily: "Georgia, serif",
              }}
            >
              Sign Out
            </button>
          </>
        ) : (
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            style={{ color: "#8BA5B8", textDecoration: "none", padding: "6px 12px" }}
          >
            Sign In
          </Link>
        )}
      </nav>
    </header>
  );
}
