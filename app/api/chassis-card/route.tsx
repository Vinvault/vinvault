import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

async function getCarData(chassis: string) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  try {
    const res = await fetch(
      `${url}/rest/v1/submissions?chassis_number=eq.${encodeURIComponent(chassis)}&status=eq.approved&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data[0] ?? null;
  } catch { return null; }
}

async function getSightingsCount(chassis: string): Promise<number> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return 0;
  try {
    const res = await fetch(
      `${url}/rest/v1/sightings?chassis_number=eq.${encodeURIComponent(chassis)}&select=id`,
      { headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: "count=exact" } }
    );
    return parseInt(res.headers.get("content-range")?.split("/")[1] ?? "0", 10);
  } catch { return 0; }
}

export async function GET(req: NextRequest) {
  const chassis = new URL(req.url).searchParams.get("chassis") ?? "UNKNOWN";
  const [car, sightings] = await Promise.all([getCarData(chassis), getSightingsCount(chassis)]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          background: "#1A1A1A",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Left panel */}
        <div style={{
          width: "700px",
          padding: "56px 64px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span style={{ fontFamily: "Georgia, serif", fontSize: "22px", fontWeight: "bold", color: "#C9A84C" }}>Vin</span>
            <span style={{ fontFamily: "Georgia, serif", fontSize: "22px", fontWeight: "bold", color: "#FFFDF8" }}>Vault</span>
            <span style={{ fontFamily: "Verdana, sans-serif", fontSize: "9px", letterSpacing: "3px", color: "#9A8A7A", marginLeft: "4px" }}>REGISTRY</span>
          </div>

          {/* Chassis number */}
          <div>
            <p style={{ fontFamily: "Verdana, sans-serif", fontSize: "11px", letterSpacing: "3px", color: "#C9A84C", textTransform: "uppercase", marginBottom: "12px" }}>
              Ferrari 288 GTO · Chassis Record
            </p>
            <p style={{
              fontFamily: "Verdana, sans-serif",
              fontSize: "32px",
              fontWeight: "bold",
              color: "#C9A84C",
              letterSpacing: "2px",
              marginBottom: "8px",
            }}>
              {chassis}
            </p>
            <p style={{ fontFamily: "Georgia, serif", fontSize: "44px", fontWeight: "bold", color: "#FFFDF8", lineHeight: 1.1, marginBottom: "24px" }}>
              Ferrari 288 GTO
            </p>

            {/* Specs */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {car?.exterior_color && (
                <div style={{ display: "flex", gap: "12px" }}>
                  <span style={{ fontFamily: "Verdana, sans-serif", fontSize: "11px", color: "#9A8A7A", width: "120px" }}>COLOR</span>
                  <span style={{ fontFamily: "Georgia, serif", fontSize: "13px", color: "#FFFDF8" }}>{car.exterior_color}</span>
                </div>
              )}
              {car?.original_market && (
                <div style={{ display: "flex", gap: "12px" }}>
                  <span style={{ fontFamily: "Verdana, sans-serif", fontSize: "11px", color: "#9A8A7A", width: "120px" }}>MARKET</span>
                  <span style={{ fontFamily: "Georgia, serif", fontSize: "13px", color: "#FFFDF8" }}>{car.original_market}</span>
                </div>
              )}
              {car?.production_date && (
                <div style={{ display: "flex", gap: "12px" }}>
                  <span style={{ fontFamily: "Verdana, sans-serif", fontSize: "11px", color: "#9A8A7A", width: "120px" }}>PRODUCED</span>
                  <span style={{ fontFamily: "Georgia, serif", fontSize: "13px", color: "#FFFDF8" }}>{car.production_date}</span>
                </div>
              )}
              <div style={{ display: "flex", gap: "12px" }}>
                <span style={{ fontFamily: "Verdana, sans-serif", fontSize: "11px", color: "#9A8A7A", width: "120px" }}>SPOTTINGS</span>
                <span style={{ fontFamily: "Georgia, serif", fontSize: "13px", color: "#FFFDF8" }}>{sightings} documented sightings</span>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <p style={{ fontFamily: "Verdana, sans-serif", fontSize: "11px", letterSpacing: "2px", color: "#C9A84C" }}>
            vinvault.net
          </p>
        </div>

        {/* Right panel */}
        <div style={{
          flex: 1,
          background: "#111111",
          borderLeft: "3px solid #C9A84C",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "16px",
        }}>
          {/* Geometric pattern */}
          <div style={{
            width: "160px",
            height: "160px",
            border: "2px solid #C9A84C",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}>
            <div style={{
              width: "100px",
              height: "100px",
              border: "2px solid #C9A84C",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <div style={{
                width: "48px",
                height: "48px",
                background: "#C9A84C",
              }} />
            </div>
          </div>
          <p style={{ fontFamily: "Verdana, sans-serif", fontSize: "9px", letterSpacing: "3px", color: "#9A8A7A", textTransform: "uppercase" }}>
            Registry Verified
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#2A7A4A" }} />
            <span style={{ fontFamily: "Verdana, sans-serif", fontSize: "11px", color: "#2A7A4A", letterSpacing: "1px" }}>APPROVED</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
