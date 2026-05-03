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
  ];
  const update: Record<string, string> = { status: "approved" };
  fields.forEach((f) => {
    const v = formData.get(f);
    if (v !== null) update[f] = v as string;
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
    await sendStatusEmail(updated?.submitter_email, "approved", updated?.chassis_number);
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
  const subject = status === "approved"
    ? `Your VinVault submission has been approved — ${chassis}`
    : `Your VinVault submission — ${chassis}`;
  const body = status === "approved"
    ? `Your Ferrari 288 GTO chassis record (${chassis}) has been approved and is now live in the VinVault registry.\n\nView it at: https://www.vinvault.net/ferrari/288-gto/${chassis}\n\nThank you for contributing to the registry.`
    : `Your Ferrari 288 GTO chassis submission (${chassis}) could not be verified with the information provided and has been rejected.\n\nIf you have additional documentation, please resubmit with more details.\n\nThank you for contributing to VinVault.`;

  try {
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: { name: "VinVault Registry", email: "registry@vinvault.net" },
        to: [{ email }],
        subject,
        textContent: body,
      }),
    });
  } catch {}
}

const inputStyle = {
  width: "100%",
  background: "#0D1E36",
  border: "1px solid #1E3A5A",
  color: "#E2EEF7",
  padding: "10px 14px",
  fontSize: "13px",
  fontFamily: "Georgia, serif",
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
      <main style={{ background: "#080F1A", color: "#E2EEF7", fontFamily: "Georgia, serif", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "28px", marginBottom: "16px" }}>Not found</h1>
          <Link href="/admin" style={{ color: "#4A90B8" }}>Back to Admin</Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: "#080F1A", color: "#E2EEF7", fontFamily: "Georgia, serif", minHeight: "100vh" }}>
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

          <div style={{ display: "flex", gap: "16px", marginTop: "32px", flexWrap: "wrap" }}>
            <button
              type="submit"
              style={{ background: "#0D2A1A", color: "#4AB87A", border: "1px solid #4AB87A", padding: "14px 32px", fontSize: "13px", letterSpacing: "2px", cursor: "pointer", fontFamily: "Georgia, serif" }}
            >
              ✓ SAVE & APPROVE
            </button>
          </div>
        </form>

        <form action={rejectSubmission} style={{ marginTop: "12px" }}>
          <input type="hidden" name="id" value={s.id} />
          <button
            type="submit"
            style={{ background: "#2A0D0D", color: "#E07070", border: "1px solid #E07070", padding: "14px 32px", fontSize: "13px", letterSpacing: "2px", cursor: "pointer", fontFamily: "Georgia, serif" }}
          >
            ✗ REJECT
          </button>
        </form>
      </div>

      <footer style={{ borderTop: "1px solid #1E3A5A", padding: "32px 40px", textAlign: "center", color: "#4A6A8A", fontSize: "13px" }}>
        <span style={{ color: "#4A90B8" }}>Vin</span>Vault Registry © 2026 · Admin
      </footer>
    </main>
  );
}
