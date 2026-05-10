import Link from "next/link";
import { colors } from "./ui/tokens";

interface Crumb {
  label: string;
  href?: string;
}

export default function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        padding: "14px 40px",
        background: colors.surface,
        borderBottom: `1px solid ${colors.border}`,
        fontSize: "12px",
        color: colors.textMuted,
        display: "flex",
        alignItems: "center",
        gap: "6px",
        flexWrap: "wrap",
        fontFamily: "Verdana, sans-serif",
      }}
    >
      {crumbs.map((crumb, i) => (
        <span key={crumb.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {i > 0 && <span style={{ color: colors.border }}>/</span>}
          {crumb.href ? (
            <Link href={crumb.href} style={{ color: colors.textMuted, textDecoration: "none" }}>
              {crumb.label}
            </Link>
          ) : (
            <span style={{ color: colors.textSecondary }}>{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
