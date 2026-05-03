import Link from "next/link";

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
        background: "#0A1828",
        borderBottom: "1px solid #1E3A5A",
        fontSize: "12px",
        color: "#4A6A8A",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        flexWrap: "wrap",
      }}
    >
      {crumbs.map((crumb, i) => (
        <span key={crumb.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {i > 0 && <span style={{ color: "#1E3A5A" }}>/</span>}
          {crumb.href ? (
            <Link href={crumb.href} style={{ color: "#4A6A8A", textDecoration: "none" }}>
              {crumb.label}
            </Link>
          ) : (
            <span style={{ color: "#8BA5B8" }}>{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
