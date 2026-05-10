"use client";

interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ width = "100%", height = "16px", className, style }: SkeletonProps) {
  return (
    <div
      className={`vv-skeleton${className ? ` ${className}` : ""}`}
      style={{ width, height, ...style }}
    />
  );
}

export function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
  return (
    <div className={className} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 && lines > 1 ? "60%" : "100%"}
          height="14px"
        />
      ))}
    </div>
  );
}

export function SkeletonImage({ width = "100%", height = "200px", className }: SkeletonProps) {
  return <Skeleton width={width} height={height} className={className} />;
}

export function SkeletonCard() {
  return (
    <div
      style={{
        border: "1px solid #E8E2D8",
        background: "#FFFDF8",
        padding: "0",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <SkeletonImage height="180px" />
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <Skeleton height="18px" width="60%" />
        <SkeletonText lines={2} />
        <Skeleton height="12px" width="40%" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "18px 12px",
        borderBottom: "1px solid #E8E2D8",
      }}
    >
      <Skeleton width="36px" height="28px" style={{ flexShrink: 0 }} />
      <Skeleton width="140px" height="14px" />
      <Skeleton width="100px" height="14px" />
      <Skeleton width="80px" height="14px" />
      <Skeleton width="60px" height="22px" style={{ marginLeft: "auto" }} />
    </div>
  );
}
