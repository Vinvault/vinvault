"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { colors } from "./ui/tokens";

const TABS = [
  {
    href: "/ferrari/288-gto",
    label: "Registry",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="2" width="7" height="7" rx="0" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="11" y="2" width="7" height="7" rx="0" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="2" y="11" width="7" height="7" rx="0" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="11" y="11" width="7" height="7" rx="0" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    href: "/spotters",
    label: "Spotters",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M3 7V5a2 2 0 012-2h1.5l1 2h5l1-2H15a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    href: "/spot",
    label: "SPOT",
    center: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="11" cy="11" r="3" fill="currentColor"/>
        <line x1="11" y1="2" x2="11" y2="5" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="11" y1="17" x2="11" y2="20" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="2" y1="11" x2="5" y2="11" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="17" y1="11" x2="20" y2="11" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profile",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M3 17c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="vv-bottom-nav"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "56px",
        background: colors.surface,
        borderTop: `1px solid ${colors.border}`,
        zIndex: 90,
        alignItems: "stretch",
        justifyContent: "stretch",
      }}
    >
      {TABS.map((tab) => {
        const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
        if (tab.center) {
          return (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                textDecoration: "none",
                gap: "2px",
                position: "relative",
                marginBottom: "8px",
              }}
            >
              <div style={{
                background: colors.accent,
                color: colors.accentNavy,
                width: "52px",
                height: "52px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "absolute",
                bottom: "8px",
                borderRadius: 0,
                boxShadow: "0 -2px 12px rgba(201,168,76,0.25)",
                gap: "2px",
              }}>
                {tab.icon}
                <span style={{
                  fontFamily: "Verdana, sans-serif",
                  fontSize: "8px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  color: colors.accentNavy,
                }}>
                  {tab.label}
                </span>
              </div>
            </Link>
          );
        }
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              textDecoration: "none",
              color: isActive ? colors.accent : colors.textMuted,
              gap: "3px",
              padding: "8px 0",
            }}
          >
            {tab.icon}
            <span style={{
              fontFamily: "Verdana, sans-serif",
              fontSize: "9px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
