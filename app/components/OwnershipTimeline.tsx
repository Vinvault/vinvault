"use client";
import Link from "next/link";
import { colors } from "./ui/tokens";

interface OwnershipEvent {
  year: number;
  yearEnd?: number;
  description: string;
  country?: string;
  isCurrent?: boolean;
}

interface OwnershipTimelineProps {
  events?: OwnershipEvent[];
  productionYear?: number;
  chassisNumber: string;
}

const CURRENT_YEAR = 2026;

export default function OwnershipTimeline({ events, productionYear = 1984, chassisNumber }: OwnershipTimelineProps) {
  const hasData = events && events.length > 0;
  const totalYears = CURRENT_YEAR - productionYear;

  if (!hasData) {
    return (
      <div style={{ margin: "0 0 32px" }}>
        <h2 style={{
          fontFamily: "Verdana, sans-serif", fontSize: "11px", letterSpacing: "3px",
          color: colors.accent, textTransform: "uppercase", marginBottom: "16px", fontWeight: "normal",
        }}>
          Ownership History
        </h2>
        <div style={{
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          borderLeft: `3px solid ${colors.accent}`,
          padding: "24px 28px",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px",
        }}>
          <div>
            <p style={{ fontFamily: "Georgia, serif", fontSize: "15px", color: colors.textSecondary, marginBottom: "6px", fontStyle: "italic" }}>
              Ownership history unknown for this chassis.
            </p>
            <p style={{ fontFamily: "Verdana, sans-serif", fontSize: "11px", color: colors.textMuted }}>
              Be the first to add provenance information and earn 50 points.
            </p>
          </div>
          <Link href={`/submit?chassis=${encodeURIComponent(chassisNumber)}`} style={{
            background: colors.accent, color: colors.accentNavy, padding: "10px 20px",
            textDecoration: "none", fontSize: "11px", letterSpacing: "2px",
            fontFamily: "Verdana, sans-serif", textTransform: "uppercase", fontWeight: "bold",
            flexShrink: 0,
          }}>
            Add History → +50 pts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ margin: "0 0 32px" }}>
      <h2 style={{
        fontFamily: "Verdana, sans-serif", fontSize: "11px", letterSpacing: "3px",
        color: colors.accent, textTransform: "uppercase", marginBottom: "20px", fontWeight: "normal",
      }}>
        Ownership History
      </h2>

      {/* Horizontal scrollable timeline */}
      <div style={{ overflowX: "auto", paddingBottom: "8px" }}>
        <div style={{ position: "relative", minWidth: "600px", padding: "48px 24px 24px" }}>
          {/* Year labels at top */}
          <div style={{ position: "absolute", top: "0", left: "24px", right: "24px", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "Verdana, sans-serif", fontSize: "10px", color: colors.textMuted }}>{productionYear}</span>
            <span style={{ fontFamily: "Verdana, sans-serif", fontSize: "10px", color: colors.textMuted }}>{CURRENT_YEAR}</span>
          </div>

          {/* Main timeline line */}
          <div style={{ position: "relative", height: "2px", background: colors.border, margin: "0 0 40px" }}>
            {/* Filled portion */}
            <div style={{ position: "absolute", left: 0, top: 0, height: "2px", background: colors.accent, width: "100%" }} />

            {/* Ownership dots */}
            {events.map((event, i) => {
              const leftPct = ((event.year - productionYear) / totalYears) * 100;
              return (
                <div key={i} style={{ position: "absolute", left: `${leftPct}%`, top: "50%", transform: "translate(-50%, -50%)" }}>
                  {/* Dot */}
                  <div style={{
                    width: event.isCurrent ? "14px" : "10px",
                    height: event.isCurrent ? "14px" : "10px",
                    borderRadius: "50%",
                    background: event.isCurrent ? colors.accent : colors.surface,
                    border: `2px solid ${colors.accent}`,
                    position: "relative",
                  }}>
                    {/* Label above dot */}
                    <div style={{
                      position: "absolute", bottom: "calc(100% + 8px)", left: "50%",
                      transform: "translateX(-50%)", whiteSpace: "nowrap",
                      textAlign: "center",
                    }}>
                      <p style={{ fontFamily: "Georgia, serif", fontSize: "11px", color: colors.textSecondary, maxWidth: "120px", whiteSpace: "normal", textAlign: "center" }}>
                        {event.description}
                      </p>
                    </div>
                    {/* Year below dot */}
                    <div style={{
                      position: "absolute", top: "calc(100% + 8px)", left: "50%",
                      transform: "translateX(-50%)", whiteSpace: "nowrap",
                    }}>
                      <p style={{ fontFamily: "Verdana, sans-serif", fontSize: "9px", color: colors.textMuted, letterSpacing: "0.5px" }}>
                        {event.year}{event.yearEnd ? `–${event.yearEnd}` : "–present"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
