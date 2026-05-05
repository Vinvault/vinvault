import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function getSubmission(id: string) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) return null;
  const res = await fetch(`${supabaseUrl}/rest/v1/submissions?id=eq.${id}`, {
    headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data[0] || null;
}

async function updateAndApprove(formData: FormData) {
  "use server";
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) return;
  const id = formData.get("id") as string;

  const fields = [
    "chassis_number","engine_number","gearbox_number","production_date",
    "original_market","exterior_color","interior_color","condition_score",
    "matching_numbers","has_service_history","has_books","has_toolkit","provenance","source",
    "film_details","music_video_details",
  ];
  const boolFields = ["is_one_off","is_prototype","is_film_car","is_music_video_car"];
  const update: Record<string, string | boolean> = { status: "approved" };
  fields.forEach((f) => {
    const v = formData.get(f);
    if (v !== null) update[f] = v as string;
  });
  boolFields.forEach((f) => {
    update[f] = formData.get(f) === "true";
  });

  const res = await fetch(`${supabaseUrl}/rest/v1/submissions?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(update),
  });

  if (res.ok) {
    const [updated] = await res.json();
    await Promise.all([
      sendStatusEmail(updated?.submitter_email, "approved", updated?.chassis_number),
      notifyWatchers(updated?.chassis_number, "approval"),
    ]);
  }

  redirect("/admin");
}

async function rejectSubmission(formData: FormData) {
  "use server";
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) return;
  const id = formData.get("id") as string;

  const res = await fetch(`${supabaseUrl}/rest/v1/submissions?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({ status: "rejected" }),
  });

  if (res.ok) {
    const [updated] = await res.json();
    await sendStatusEmail(updated?.submitter_email, "rejected", updated?.chassis_number);
  }

  redirect("/admin");
}

async function sendStatusEmail(email: string | undefined, status: "approved" | "rejected", chassis: string) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey || !email) return;

  const registryUrl = `https://www.vinvault.net/ferrari/288-gto/${chassis}`;
  const isApproved = status === "approved";
  const subject = isApproved
    ? `Your submission has been approved — ${chassis}`
    : `Your submission for ${chassis} was not approved`;

  const htmlContent = isApproved ? `
<!DOCTYPE html><html><body style="margin:0;padding:0;background:#080F1A;font-family:Verdana,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 24px;">
  <div style="margin-bottom:32px;">
    <span style="font-size:22px;font-weight:bold;"><span style="color:#4A90B8">Vin</span><span style="color:#E2EEF7">Vault</span></span>
    <span style="color:#4A90B8;font-size:10px;letter-spacing:4px;margin-left:10px;">REGISTRY</span>
  </div>
  <div style="background:#0A1828;border:1px solid #1E3A5A;padding:32px;">
    <p style="color:#4AB87A;font-size:11px;letter-spacing:3px;margin:0 0 16px;">SUBMISSION APPROVED</p>
    <h1 style="color:#E2EEF7;font-size:24px;margin:0 0 16px;">Your chassis record is now live</h1>
    <p style="color:#8BA5B8;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Ferrari 288 GTO chassis <strong style="color:#E2EEF7;font-family:monospace;">${chassis}</strong> has been verified and published to the VinVault world registry.
    </p>
    <a href="${registryUrl}" style="display:inline-block;background:#4A90B8;color:#fff;padding:12px 28px;text-decoration:none;font-size:13px;letter-spacing:2px;">VIEW CHASSIS RECORD</a>
    <p style="color:#4A6A8A;font-size:13px;margin:24px 0 0;">Thank you for contributing to the historical record.</p>
  </div>
  <p style="color:#4A6A8A;font-size:12px;margin-top:24px;text-align:center;">VinVault Registry · <a href="https://www.vinvault.net" style="color:#4A6A8A;">vinvault.net</a></p>
</div></body></html>` : `
<!DOCTYPE html><html><body style="margin:0;padding:0;background:#080F1A;font-family:Verdana,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 24px;">
  <div style="margin-bottom:32px;">
    <span style="font-size:22px;font-weight:bold;"><span style="color:#4A90B8">Vin</span><span style="color:#E2EEF7">Vault</span></span>
    <span style="color:#4A90B8;font-size:10px;letter-spacing:4px;margin-left:10px;">REGISTRY</span>
  </div>
  <div style="background:#0A1828;border:1px solid #1E3A5A;padding:32px;">
    <p style="color:#B8944A;font-size:11px;letter-spacing:3px;margin:0 0 16px;">SUBMISSION UPDATE</p>
    <h1 style="color:#E2EEF7;font-size:24px;margin:0 0 16px;">We couldn't verify this submission</h1>
    <p style="color:#8BA5B8;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Your submission for chassis <strong style="color:#E2EEF7;font-family:monospace;">${chassis}</strong> could not be verified with the information provided.
    </p>
    <p style="color:#8BA5B8;font-size:15px;line-height:1.7;margin:0 0 24px;">
      If you have additional documentation — factory records, auction catalogues, or owner contacts — please resubmit with more details.
    </p>
    <a href="https://www.vinvault.net/submit?chassis=${encodeURIComponent(chassis)}" style="display:inline-block;background:#0A1828;border:1px solid #4A90B8;color:#4A90B8;padding:12px 28px;text-decoration:none;font-size:13px;letter-spacing:2px;">RESUBMIT WITH MORE DETAILS</a>
  </div>
  <p style="color:#4A6A8A;font-size:12px;margin-top:24px;text-align:center;">VinVault Registry · <a href="https://www.vinvault.net" style="color:#4A6A8A;">vinvault.net</a></p>
</div></body></html>`;

  const textContent = isApproved
    ? `Your Ferrari 288 GTO chassis record (${chassis}) has been approved.\n\nView it at: ${registryUrl}\n\nThank you for contributing to the registry.`
    : `Your submission for ${chassis} could not be verified. Please resubmit with additional documentation at https://www.vinvault.net/submit?chassis=${chassis}`;

  try {
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: { name: "VinVault Registry", email: "registry@vinvault.net" },
        to: [{ email }],
        subject,
        htmlContent,
        textContent,
      }),
    });
  } catch {}
}

async function notifyWatchers(chassis: string, event: string) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  const apiKey = process.env.BREVO_API_KEY;
  if (!url || !key || !apiKey) return;
  try {
    const res = await fetch(`${url}/rest/v1/car_watches?chassis_number=eq.${encodeURIComponent(chassis)}`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" });
    if (!res.ok) return;
    const watchers: { user_email: string }[] = await res.json();
    const registryUrl = `https://www.vinvault.net/ferrari/288-gto/${chassis}`;
    for (const w of watchers) {
      await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: { name: "VinVault Registry", email: "registry@vinvault.net" },
          to: [{ email: w.user_email }],
          subject: `Update on chassis ${chassis} — VinVault`,
          htmlContent: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#080F1A;font-family:Verdana,sans-serif;"><div style="max-width:600px;margin:0 auto;padding:40px 24px;"><div style="margin-bottom:32px;"><span style="font-size:22px;font-weight:bold;"><span style="color:#4A90B8">Vin</span><span style="color:#E2EEF7">Vault</span></span><span style="color:#4A90B8;font-size:10px;letter-spacing:4px;margin-left:10px;">REGISTRY</span></div><div style="background:#0A1828;border:1px solid #1E3A5A;padding:32px;"><p style="color:#4A90B8;font-size:11px;letter-spacing:3px;margin:0 0 16px;">WATCHED CAR UPDATE</p><h1 style="color:#E2EEF7;font-size:22px;margin:0 0 16px;">Chassis ${chassis} has been updated</h1><p style="color:#8BA5B8;font-size:15px;line-height:1.7;margin:0 0 24px;">A chassis you are watching has a new ${event} in the VinVault registry.</p><a href="${registryUrl}" style="display:inline-block;background:#4A90B8;color:#fff;padding:12px 28px;text-decoration:none;font-size:13px;letter-spacing:2px;">VIEW UPDATE</a></div><p style="color:#4A6A8A;font-size:12px;margin-top:24px;text-align:center;">VinVault Registry · <a href="https://www.vinvault.net" style="color:#4A6A8A;">vinvault.net</a></p></div></body></html>`,
          textContent: `Chassis ${chassis} has been updated: ${event}.\n\nView it at: ${registryUrl}`,
        }),
      });
    }
  } catch {}
}

const inputStyle = {
  width: "100%",
  background: "#0D1E36",
  border: "1px solid #1E3A5A",
  color: "#E2EEF7",
  padding: "10px 14px",
  fontSize: "13px",
  fontFamily: "Verdana, sans-serif",
  boxSizing: "border-box" as const,
};

function Field({ label, name, value, textarea }: { label: string; name: string; value?: string; textarea?: boolean }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ display: "block", color: "#8BA5B8", fontSize: "11px", letterSpacing: "2px", marginBottom: "6px" }}>{label}</label>
      {textarea ? (
        <textarea name={name} defaultValue={value || ""} rows={4} style={{ ...inputStyle, resize: "vertical" }} />
      ) : (
        <input type="text" name={name} defaultValue={value || ""} style={inputStyle} />
      )}
    </div>
  );
}

export default async function SubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await getSubmission(id);

  if (!s) {
    return (
      <main style={{ background: "#080F1A", color: "#E2EEF7", fontFamily: "Verdana, sans-serif", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "28px", marginBottom: "16px" }}>Not found</h1>
          <Link href="/admin" style={{ color: "#4A90B8" }}>Back to Admin</Link>
        </div>
      </main>
    );
  }

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

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "40px" }}>
        <p style={{ color: "#4A90B8", letterSpacing: "3px", fontSize: "11px", marginBottom: "16px" }}>SUBMISSION REVIEW</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "bold", fontFamily: "monospace" }}>{s.chassis_number}</h1>
          <span style={{
            background: s.status === "approved" ? "#0D2A1A" : s.status === "rejected" ? "#2A0D0D" : "#2A1A0D",
            color: s.status === "approved" ? "#4AB87A" : s.status === "rejected" ? "#E07070" : "#B8944A",
            padding: "8px 20px", fontSize: "12px", letterSpacing: "2px",
          }}>{s.status?.toUpperCase()}</span>
        </div>

        <p style={{ color: "#8BA5B8", fontSize: "13px", marginBottom: "32px" }}>
          Submitted by: <strong style={{ color: "#E2EEF7" }}>{s.submitter_email || "Anonymous"}</strong> on{" "}
          {new Date(s.created_at).toLocaleString()}
        </p>

        {/* Edit form */}
        <form action={updateAndApprove}>
          <input type="hidden" name="id" value={s.id} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "40px", marginBottom: "32px" }}>
            <div>
              <p style={{ color: "#4A90B8", fontSize: "11px", letterSpacing: "3px", marginBottom: "20px", borderBottom: "1px solid #1E3A5A", paddingBottom: "10px" }}>IDENTITY</p>
              <Field label="CHASSIS NUMBER" name="chassis_number" value={s.chassis_number} />
              <Field label="ENGINE NUMBER" name="engine_number" value={s.engine_number} />
              <Field label="GEARBOX NUMBER" name="gearbox_number" value={s.gearbox_number} />
              <Field label="PRODUCTION DATE" name="production_date" value={s.production_date} />
              <Field label="ORIGINAL MARKET" name="original_market" value={s.original_market} />
              <Field label="MATCHING NUMBERS" name="matching_numbers" value={s.matching_numbers} />
            </div>
            <div>
              <p style={{ color: "#4A90B8", fontSize: "11px", letterSpacing: "3px", marginBottom: "20px", borderBottom: "1px solid #1E3A5A", paddingBottom: "10px" }}>CONDITION</p>
              <Field label="EXTERIOR COLOR" name="exterior_color" value={s.exterior_color} />
              <Field label="INTERIOR COLOR" name="interior_color" value={s.interior_color} />
              <Field label="CONDITION SCORE" name="condition_score" value={s.condition_score} />
              <Field label="SERVICE HISTORY" name="has_service_history" value={s.has_service_history} />
              <Field label="BOOKS" name="has_books" value={s.has_books} />
              <Field label="TOOLKIT" name="has_toolkit" value={s.has_toolkit} />
            </div>
          </div>

          <Field label="PROVENANCE" name="provenance" value={s.provenance} textarea />
          <Field label="SOURCE" name="source" value={s.source} />

          <div style={{ marginTop: "32px", marginBottom: "24px" }}>
            <p style={{ color: "#4A90B8", fontSize: "11px", letterSpacing: "3px", marginBottom: "16px", borderBottom: "1px solid #1E3A5A", paddingBottom: "10px" }}>SPECIAL DESIGNATIONS</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "16px" }}>
              {([
                { name: "is_one_off", label: "One-Off" },
                { name: "is_prototype", label: "Prototype" },
                { name: "is_film_car", label: "Film Car" },
                { name: "is_music_video_car", label: "Music Video Car" },
              ] as { name: string; label: string }[]).map(({ name, label }) => (
                <div key={name} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <select
                    name={name}
                    defaultValue={s[name] ? "true" : "false"}
                    style={{ background: "#0D1E36", border: "1px solid #1E3A5A", color: "#E2EEF7", padding: "8px 12px", fontSize: "12px", fontFamily: "Verdana, sans-serif" }}
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                  <label style={{ color: "#8BA5B8", fontSize: "12px", letterSpacing: "1px" }}>{label.toUpperCase()}</label>
                </div>
              ))}
            </div>
            <Field label="FILM DETAILS" name="film_details" value={s.film_details} textarea />
            <Field label="MUSIC VIDEO DETAILS" name="music_video_details" value={s.music_video_details} textarea />
          </div>

          <div style={{ display: "flex", gap: "16px", marginTop: "32px", flexWrap: "wrap" }}>
            <button
              type="submit"
              style={{ background: "#0D2A1A", color: "#4AB87A", border: "1px solid #4AB87A", padding: "14px 32px", fontSize: "13px", letterSpacing: "2px", cursor: "pointer", fontFamily: "Verdana, sans-serif" }}
            >
              ✓ SAVE & APPROVE
            </button>
          </div>
        </form>

        <form action={rejectSubmission} style={{ marginTop: "12px" }}>
          <input type="hidden" name="id" value={s.id} />
          <button
            type="submit"
            style={{ background: "#2A0D0D", color: "#E07070", border: "1px solid #E07070", padding: "14px 32px", fontSize: "13px", letterSpacing: "2px", cursor: "pointer", fontFamily: "Verdana, sans-serif" }}
          >
            ✗ REJECT
          </button>
        </form>
      </div>

      <footer style={{ borderTop: "1px solid #1E3A5A", padding: "28px 40px", textAlign: "center", color: "#4A6A8A", fontSize: "13px" }}>
        © 2026 <span style={{ color: "#4A90B8" }}>Vin</span>Vault — Curated Automotive Registry
      </footer>
    </main>
  );
}
