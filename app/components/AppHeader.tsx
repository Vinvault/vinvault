"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

const NAV = [
  { href: "/ferrari/288-gto", label: "Registry" },
  { href: "/spotters", label: "Spotters" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
];

export default function AppHeader({ adminBadge = false }: { adminBadge?: boolean }) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function loadProfile(email: string) {
      setUserEmail(email);
      try {
        const { data } = await supabase.from("spotter_profiles").select("username").eq("user_email", email).limit(1).single();
        setUsername(data?.username ?? email.split("@")[0]);
      } catch {
        setUsername(email.split("@")[0]);
      }
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) loadProfile(user.email);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user?.email ?? null;
      if (email) { loadProfile(email); } else { setUserEmail(null); setUsername(null); }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = () => {
    createSupabaseBrowserClient().auth.signOut().then(() => { window.location.href = "/"; });
  };

  const authBtnStyle: React.CSSProperties = {
    background: "none",
    border: "1px solid #4A90B8",
    color: "#4A90B8",
    padding: "6px 14px",
    fontSize: "13px",
    cursor: "pointer",
    fontFamily: "Verdana, sans-serif",
    textDecoration: "none",
    letterSpacing: "0.5px",
  };

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
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMenuOpen(false)}
            style={{ color: "#8BA5B8", textDecoration: "none", padding: "6px 12px" }}
          >
            {item.label}
          </Link>
        ))}

        {userEmail ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <button onClick={handleSignOut} style={authBtnStyle}>Sign Out</button>
            {username && (
              <span style={{ color: "#E2EEF7", fontSize: "11px", letterSpacing: "0.5px" }}>
                {username}
              </span>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            style={authBtnStyle}
          >
            Sign In
          </Link>
        )}
      </nav>
    </header>
  );
}
