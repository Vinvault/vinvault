import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ferrari 288 GTO — Specifications & History | VinVault",
  description: "Complete Ferrari 288 GTO specs: 2.8L twin-turbo V8, 400hp, 305 km/h top speed. Homologation special for Group B racing. 272 produced 1984–1985.",
  openGraph: {
    title: "Ferrari 288 GTO — Specifications & History",
    description: "Complete Ferrari 288 GTO specs: 2.8L twin-turbo V8, 400hp, 305 km/h. 272 produced 1984–1985.",
    siteName: "VinVault Registry",
  },
};

const SPECS = [
  { label: "Production years", value: "1984–1985" },
  { label: "Total produced", value: "272 units" },
  { label: "Engine", value: "2.8L twin-turbocharged V8 (F114A)" },
  { label: "Displacement", value: "2855 cc" },
  { label: "Power output", value: "400 hp (298 kW) at 7,000 rpm" },
  { label: "Torque", value: "496 Nm (366 lb-ft) at 3,800 rpm" },
  { label: "Transmission", value: "5-speed manual" },
  { label: "Top speed", value: "305 km/h (190 mph)" },
  { label: "0–100 km/h", value: "4.9 seconds" },
  { label: "0–400m", value: "12.7 seconds" },
  { label: "Kerb weight", value: "1,160 kg (2,557 lb)" },
  { label: "Body designer", value: "Pininfarina" },
  { label: "Chassis", value: "Steel tubular spaceframe" },
  { label: "Suspension (front)", value: "Double wishbones, coil springs" },
  { label: "Suspension (rear)", value: "Double wishbones, coil springs" },
  { label: "Brakes", value: "Ventilated discs all round" },
  { label: "Wheelbase", value: "2,400 mm" },
  { label: "Length", value: "4,290 mm" },
  { label: "Width", value: "1,910 mm" },
  { label: "Height", value: "1,120 mm" },
];

export default function Ferrari288GTOInfoPage() {
  return (
    <main style={{ background: "#080F1A", color: "#E2EEF7", fontFamily: "Verdana, sans-serif", minHeight: "100vh" }}>
      <header className="vv-header">
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "baseline", gap: "10px" }}>
          <span style={{ fontSize: "24px", fontWeight: "bold" }}>
            <span style={{ color: "#4A90B8" }}>Vin</span><span style={{ color: "#E2EEF7" }}>Vault</span>
          </span>
          <span style={{ color: "#4A90B8", fontSize: "10px", letterSpacing: "4px" }}>REGISTRY</span>
        </Link>
        <nav className="vv-nav" style={{ fontSize: "13px" }}>
          <Link href="/ferrari/288-gto" style={{ color: "#8BA5B8", textDecoration: "none", padding: "6px 12px" }}>Registry</Link>
          <Link href="/submit" style={{ color: "#4A90B8", textDecoration: "none", border: "1px solid #4A90B8", padding: "6px 16px" }}>Submit</Link>
        </nav>
      </header>

      {/* Breadcrumb */}
      <div style={{ padding: "14px 40px", background: "#0A1828", borderBottom: "1px solid #1E3A5A", fontSize: "12px", color: "#4A6A8A" }}>
        <Link href="/" style={{ color: "#4A6A8A", textDecoration: "none" }}>Home</Link>
        {" / "}
        <Link href="/ferrari/288-gto" style={{ color: "#4A6A8A", textDecoration: "none" }}>Ferrari 288 GTO</Link>
        {" / "}
        <span style={{ color: "#8BA5B8" }}>Model Info</span>
      </div>

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "48px 40px" }}>
        <p style={{ color: "#4A90B8", letterSpacing: "3px", fontSize: "11px", marginBottom: "16px" }}>FERRARI · 1984–1985</p>
        <h1 style={{ fontSize: "clamp(28px, 6vw, 44px)", fontWeight: "bold", marginBottom: "16px" }}>Ferrari 288 GTO</h1>
        <p style={{ color: "#8BA5B8", fontSize: "17px", lineHeight: "1.8", marginBottom: "48px", maxWidth: "680px" }}>
          The Ferrari 288 GTO was a homologation special built to compete in the FIA Group B racing category — a class so extreme it was cancelled before the car ever raced. The result was one of the most significant and coveted Ferraris ever built.
        </p>

        {/* Value */}
        <div style={{ background: "#0A1828", border: "1px solid #4A90B8", padding: "20px 28px", marginBottom: "48px", display: "flex", gap: "40px", flexWrap: "wrap" }}>
          <div>
            <p style={{ color: "#4A6A8A", fontSize: "11px", letterSpacing: "2px", marginBottom: "4px" }}>CURRENT MARKET VALUE</p>
            <p style={{ fontSize: "22px", fontWeight: "bold", color: "#4A90B8" }}>€2.5M – €4.0M</p>
          </div>
          <div>
            <p style={{ color: "#4A6A8A", fontSize: "11px", letterSpacing: "2px", marginBottom: "4px" }}>PRODUCTION</p>
            <p style={{ fontSize: "22px", fontWeight: "bold" }}>272 units</p>
          </div>
          <div>
            <p style={{ color: "#4A6A8A", fontSize: "11px", letterSpacing: "2px", marginBottom: "4px" }}>SIGNIFICANCE</p>
            <p style={{ fontSize: "14px", color: "#8BA5B8", paddingTop: "4px" }}>Group B homologation special</p>
          </div>
        </div>

        {/* History */}
        <div style={{ marginBottom: "48px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px", borderTop: "1px solid #1E3A5A", paddingTop: "32px" }}>History & Significance</h2>
          <div style={{ color: "#8BA5B8", fontSize: "15px", lineHeight: "1.9", display: "flex", flexDirection: "column", gap: "16px" }}>
            <p>
              In the early 1980s, Ferrari's race engineers designed the 288 GTO around one goal: homologation for FIA Group B, which required manufacturers to produce at least 200 road-legal examples. Ferrari exceeded this, building 272.
            </p>
            <p>
              To qualify as a Group B car, the 288 GTO had to use a production-based engine displacement below 3.0 litres. Ferrari's solution was to take the Dino 308's V8, bore it out to 2,855 cc, and fit twin IHI turbochargers — producing 400 hp in road form and a reported 650+ hp in full race tune.
            </p>
            <p>
              The car features a 2,400 mm wheelbase (100 mm longer than the 308 GTB), a composite and kevlar body designed by Pininfarina, and a longitudinally mounted engine — the first mid-engine Ferrari with this layout.
            </p>
            <p>
              Group B was cancelled in 1986 following a series of fatal accidents in rallying, and the 288 GTO never competed. This paradoxically enhanced its mystique and collectibility. Ferrari engineers immediately redirected their work into the F40.
            </p>
            <p>
              Today, the 288 GTO is considered one of the most important Ferraris ever built — a car that changed the direction of both Ferrari's road car programme and its approach to performance engineering.
            </p>
          </div>
        </div>

        {/* Specs */}
        <div style={{ marginBottom: "48px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "24px", borderTop: "1px solid #1E3A5A", paddingTop: "32px" }}>Technical Specifications</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "0" }}>
            {SPECS.map(s => (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #0D1E36", gap: "12px" }}>
                <span style={{ color: "#8BA5B8", fontSize: "14px" }}>{s.label}</span>
                <span style={{ fontSize: "14px", textAlign: "right", fontWeight: "bold" }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Registry CTA */}
        <div style={{ background: "#0A1828", border: "1px solid #1E3A5A", padding: "28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <p style={{ color: "#4A90B8", fontSize: "11px", letterSpacing: "2px", marginBottom: "8px" }}>WORLD REGISTRY</p>
            <p style={{ color: "#8BA5B8", fontSize: "14px" }}>Browse every documented 288 GTO chassis, or submit a car to help complete the record.</p>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link href="/ferrari/288-gto" style={{ background: "#4A90B8", color: "#fff", padding: "12px 24px", textDecoration: "none", fontSize: "13px", letterSpacing: "2px" }}>
              VIEW REGISTRY
            </Link>
            <Link href="/submit" style={{ border: "1px solid #1E3A5A", color: "#8BA5B8", padding: "12px 24px", textDecoration: "none", fontSize: "13px" }}>
              Submit a Car
            </Link>
          </div>
        </div>
      </div>

      <footer className="vv-footer">
        <span><span style={{ color: "#4A90B8" }}>Vin</span>Vault Registry © 2026</span>
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
          <Link href="/ferrari/288-gto" style={{ color: "#4A6A8A", textDecoration: "none" }}>Registry</Link>
          <Link href="/about" style={{ color: "#4A6A8A", textDecoration: "none" }}>About</Link>
          <Link href="/submit" style={{ color: "#4A6A8A", textDecoration: "none" }}>Submit</Link>
        </div>
      </footer>
    </main>
  );
}
