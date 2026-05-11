"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { VERSION } from "@/app/version";
import { colors } from "./ui/tokens";

const NAV = [
  { href: "/ferrari/288-gto", label: "Registry" },
  { href: "/spotters", label: "Spotters" },
  { href: "/for-sale", label: "For Sale" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
];

export default function AppHeader({ adminBadge = false }: { adminBadge?: boolean }) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleSignOut = () => {
    createSupabaseBrowserClient().auth.signOut().then(() => { window.location.href = "/"; });
  };

  const navLinkStyle = (href: string): React.CSSProperties => ({
    fontFamily: 'Verdana, sans-serif',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: pathname === href || pathname.startsWith(href + '/') ? colors.accent : colors.textSecondary,
    textDecoration: 'none',
    padding: '4px 12px',
    borderBottom: pathname === href || pathname.startsWith(href + '/') ? `2px solid ${colors.accent}` : '2px solid transparent',
    transition: 'color 150ms ease, border-color 150ms ease',
  });

  const authBtnStyle: React.CSSProperties = {
    background: "none",
    border: `1px solid ${colors.accentNavy}`,
    color: colors.accentNavy,
    padding: "7px 18px",
    fontSize: "10px",
    cursor: "pointer",
    fontFamily: "Verdana, sans-serif",
    textDecoration: "none",
    letterSpacing: "1px",
    textTransform: "uppercase",
    borderRadius: 0,
  };

  return (
    <>
      <header className={`vv-header${scrolled ? " vv-header-scrolled" : ""}`}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "baseline", gap: "8px" }}>
          <span style={{
            fontSize: scrolled ? "16px" : "20px",
            fontFamily: "Georgia, serif",
            fontWeight: "bold",
            transition: "font-size 200ms ease",
          }}>
            <span style={{ color: colors.accent }}>Vin</span>
            <span style={{ color: colors.textPrimary }}>Vault</span>
          </span>
          <span style={{
            color: colors.textMuted,
            fontSize: "9px",
            fontFamily: "Verdana, sans-serif",
            letterSpacing: "3px",
            textTransform: "uppercase",
          }}>
            REGISTRY · {VERSION}
          </span>
          {adminBadge && (
            <span style={{ color: colors.error, fontSize: "9px", letterSpacing: "2px", fontFamily: "Verdana, sans-serif" }}>ADMIN</span>
          )}
        </Link>

        {/* Desktop nav */}
        <nav className="vv-nav" style={{ fontSize: "13px" }}>
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} style={navLinkStyle(item.href)}>
              {item.label}
            </Link>
          ))}

          {userEmail ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", marginLeft: "8px" }}>
              <button onClick={handleSignOut} style={authBtnStyle}>Sign Out</button>
              {username && (
                <span style={{ color: colors.textMuted, fontSize: "10px", fontFamily: "Verdana, sans-serif" }}>
                  {username}
                </span>
              )}
            </div>
          ) : (
            <Link href="/login" style={{ ...authBtnStyle, marginLeft: "8px" }}>Sign In</Link>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="vv-hamburger"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <span className={`vv-hline${mobileOpen ? " vv-hline-open-1" : ""}`} />
          <span className={`vv-hline${mobileOpen ? " vv-hline-open-2" : ""}`} />
          <span className={`vv-hline${mobileOpen ? " vv-hline-open-3" : ""}`} />
        </button>
      </header>

      {/* Mobile overlay */}
      <div className={`vv-mobile-overlay${mobileOpen ? " vv-mobile-overlay-open" : ""}`} aria-hidden={!mobileOpen}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "48px" }}>
          <span style={{ fontFamily: "Georgia, serif", fontSize: "20px", fontWeight: "bold" }}>
            <span style={{ color: colors.accent }}>Vin</span>
            <span style={{ color: "#FFFDF8" }}>Vault</span>
          </span>
          <button
            onClick={() => setMobileOpen(false)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#FFFDF8", fontSize: "28px", lineHeight: 1, padding: "4px 8px" }}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "24px",
                color: pathname === item.href || pathname.startsWith(item.href + '/') ? colors.accent : "#FFFDF8",
                textDecoration: "none",
                padding: "12px 0",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/spot"
            onClick={() => setMobileOpen(false)}
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "24px",
              color: pathname === "/spot" ? colors.accent : "#FFFDF8",
              textDecoration: "none",
              padding: "12px 0",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            Spot a Car
          </Link>
        </nav>

        <div style={{ marginTop: "auto", paddingTop: "32px" }}>
          {userEmail ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ color: colors.textMuted, fontSize: "12px", fontFamily: "Verdana, sans-serif" }}>{username}</span>
              <button
                onClick={() => { handleSignOut(); setMobileOpen(false); }}
                style={{ ...authBtnStyle, border: `1px solid ${colors.accent}`, color: colors.accent, width: "100%", textAlign: "center" }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              style={{ ...authBtnStyle, display: "block", textAlign: "center", border: `1px solid ${colors.accent}`, color: colors.accent }}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
