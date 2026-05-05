import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function getApprovedCars() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return [];
  try {
    const res = await fetch(
      `${url}/rest/v1/submissions?status=eq.approved&order=created_at.desc`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" }
    );
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

function generatePostText(car: any): string {
  const lines = [
    `New car added to VinVault Registry 🏎️`,
    ``,
    `Ferrari 288 GTO`,
    `Chassis: ${car.chassis_number}`,
    [car.exterior_color, car.original_market].filter(Boolean).join(" | "),
    ``,
    `View full history at vinvault.net/ferrari/288-gto/${car.chassis_number}`,
    ``,
    `#VinVault #Ferrari #288GTO #ClassicCar #CarRegistry #FerrariGTO #ClassicFerrari`,
  ];
  return lines.filter(l => l !== null).join("\n");
}

async function markPosted(formData: FormData) {
  "use server";
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return;
  const id = formData.get("id") as string;
  await fetch(`${url}/rest/v1/submissions?id=eq.${id}`, {
    method: "PATCH",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ instagram_posted: true }),
  });
  redirect("/admin/instagram-queue");
}

export default async function InstagramQueuePage() {
  const cars = await getApprovedCars();
  const unposted = cars.filter((c: any) => !c.instagram_posted);
  const posted = cars.filter((c: any) => c.instagram_posted);

  return (
    <main style={{ background: "#080F1A", color: "#E2EEF7", fontFamily: "Verdana, sans-serif", minHeight: "100vh" }}>
      <header className="vv-header">
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontSize: "24px", fontWeight: "bold" }}>
            <span style={{ color: "#4A90B8" }}>Vin</span><span style={{ color: "#E2EEF7" }}>Vault</span>
          </span>
          <span style={{ color: "#4A90B8", fontSize: "10px", letterSpacing: "4px", marginLeft: "10px" }}>REGISTRY</span>
        </Link>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <span style={{ color: "#E07070", fontSize: "11px", letterSpacing: "2px" }}>ADMIN</span>
          <Link href="/admin" style={{ color: "#4A90B8", fontSize: "13px", textDecoration: "none" }}>← Back to Admin</Link>
        </div>
      </header>

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px" }}>
        <p style={{ color: "#4A90B8", letterSpacing: "3px", fontSize: "11px", marginBottom: "16px" }}>SOCIAL MEDIA</p>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "8px" }}>Instagram Queue</h1>
        <p style={{ color: "#8BA5B8", fontSize: "14px", marginBottom: "12px" }}>
          Approved cars ready to post to Instagram.{" "}
          <strong style={{ color: "#E2EEF7" }}>{unposted.length}</strong> pending,{" "}
          <strong style={{ color: "#4AB87A" }}>{posted.length}</strong> posted.
        </p>
        <div style={{ background: "#0A1828", border: "1px solid #B8944A", padding: "12px 16px", marginBottom: "32px", fontSize: "13px", color: "#B8944A" }}>
          Note: To enable automatic Instagram posting, add the <code>instagram_posted</code> boolean column to the submissions table in Supabase, then connect the Meta Business API. Until then, use the post text below and mark each car as posted manually.
        </div>

        {unposted.length === 0 ? (
          <div style={{ border: "1px solid #1E3A5A", padding: "48px", textAlign: "center", color: "#4A6A8A", marginBottom: "40px" }}>
            <p>No cars waiting to be posted. All caught up! ✓</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "48px" }}>
            {unposted.map((car: any) => {
              const postText = generatePostText(car);
              return (
                <div key={car.id} style={{ background: "#0A1828", border: "1px solid #1E3A5A", padding: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <p style={{ fontFamily: "monospace", fontSize: "16px", letterSpacing: "1px", marginBottom: "4px" }}>{car.chassis_number}</p>
                      <p style={{ color: "#4A6A8A", fontSize: "12px" }}>
                        {[car.exterior_color, car.original_market].filter(Boolean).join(" · ") || "Ferrari 288 GTO"}
                        {" · "}Approved {new Date(car.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <form action={markPosted}>
                      <input type="hidden" name="id" value={car.id} />
                      <button
                        type="submit"
                        style={{ background: "#4A90B8", border: "none", color: "#fff", padding: "8px 20px", fontSize: "12px", letterSpacing: "1px", cursor: "pointer", fontFamily: "Verdana, sans-serif" }}
                      >
                        ✓ Mark as Posted
                      </button>
                    </form>
                  </div>

                  <div>
                    <p style={{ color: "#4A90B8", fontSize: "11px", letterSpacing: "2px", marginBottom: "8px" }}>POST TEXT</p>
                    <pre style={{
                      background: "#0D1E36",
                      border: "1px solid #1E3A5A",
                      padding: "16px",
                      fontSize: "13px",
                      color: "#8BA5B8",
                      lineHeight: "1.6",
                      whiteSpace: "pre-wrap",
                      fontFamily: "Verdana, sans-serif",
                      margin: 0,
                    }}>
                      {postText}
                    </pre>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {posted.length > 0 && (
          <div>
            <p style={{ color: "#4A6A8A", letterSpacing: "2px", fontSize: "11px", marginBottom: "16px" }}>ALREADY POSTED ({posted.length})</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {posted.map((car: any) => (
                <div key={car.id} style={{ background: "#0A1828", border: "1px solid #0D1E36", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ fontFamily: "monospace", fontSize: "13px", color: "#4A6A8A" }}>{car.chassis_number}</p>
                  <span style={{ color: "#4AB87A", fontSize: "11px" }}>✓ Posted</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer style={{ borderTop: "1px solid #1E3A5A", padding: "32px 40px", textAlign: "center", color: "#4A6A8A", fontSize: "13px" }}>
        <span style={{ color: "#4A90B8" }}>Vin</span>Vault Registry © 2026 · Admin
      </footer>
    </main>
  );
}
