"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { colors } from "@/app/components/ui/tokens";

interface Make { id: string; name: string; }
interface Photo { id: string; photo_url: string; is_cover: boolean; caption: string | null; }
interface Doc { id: string; file_url: string; file_name: string; document_type: string; is_public: boolean; }

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", border: `1px solid ${colors.border}`,
  background: "#FFFDF8", fontFamily: "Georgia, serif", fontSize: "14px",
  color: colors.textPrimary, outline: "none", boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontFamily: "Verdana, sans-serif", fontSize: "10px",
  letterSpacing: "1px", textTransform: "uppercase", color: colors.textMuted, marginBottom: "6px",
};

export default function EditGarageCarPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [makes, setMakes] = useState<Make[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    make_id: "", make_name: "", model: "", submodel: "", year: "", color: "",
    vin: "", mileage: "", mileage_unit: "km", purchase_date: "", purchase_price: "",
    numberplate: "", notes: "", status: "current", date_sold: "",
  });

  const loadCar = useCallback(async () => {
    const res = await fetch(`/api/garage/cars/${id}`);
    if (!res.ok) { router.push("/profile"); return; }
    const car = await res.json();
    setForm({
      make_id: car.make_id || "",
      make_name: car.make_name || "",
      model: car.model || "",
      submodel: car.submodel || "",
      year: car.year?.toString() || "",
      color: car.color || "",
      vin: car.vin || "",
      mileage: car.mileage?.toString() || "",
      mileage_unit: car.mileage_unit || "km",
      purchase_date: car.purchase_date || "",
      purchase_price: car.purchase_price?.toString() || "",
      numberplate: car.numberplate || "",
      notes: car.notes || "",
      status: car.status || "current",
      date_sold: car.date_sold || "",
    });
    setPhotos(car.photos || []);
    setDocs(car.documents || []);
  }, [id, router]);

  useEffect(() => {
    async function init() {
      const supabase = createSupabaseBrowserClient();
      const [{ data: makesData }] = await Promise.all([
        supabase.from("makes").select("id,name").order("name"),
      ]);
      setMakes(makesData ?? []);
      await loadCar();
    }
    init();
  }, [loadCar]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const selectedMake = makes.find(m => m.id === form.make_id);
    await fetch(`/api/garage/cars/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, make_name: selectedMake?.name || form.make_name }),
    });
    setSaving(false);
    router.push("/profile");
  }

  async function uploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("is_cover", photos.length === 0 ? "true" : "false");
    const res = await fetch(`/api/garage/cars/${id}/photos`, { method: "POST", body: fd });
    if (res.ok) await loadCar();
    setUploading(false);
  }

  async function deletePhoto(photoId: string) {
    await fetch(`/api/garage/cars/${id}/photos`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ photo_id: photoId }) });
    await loadCar();
  }

  async function uploadDoc(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("document_type", "other");
    const res = await fetch(`/api/garage/cars/${id}/documents`, { method: "POST", body: fd });
    if (res.ok) await loadCar();
    setUploading(false);
  }

  async function deleteDoc(docId: string) {
    await fetch(`/api/garage/cars/${id}/documents`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ doc_id: docId }) });
    await loadCar();
  }

  const vin = form.vin.trim();

  return (
    <main style={{ background: colors.bg, minHeight: "100vh", color: colors.textPrimary }}>
      <nav aria-label="Breadcrumb" style={{ padding: "14px 40px", background: colors.surface, borderBottom: `1px solid ${colors.border}`, fontSize: "12px", color: colors.textMuted, display: "flex", gap: "6px", fontFamily: "Verdana, sans-serif" }}>
        <Link href="/" style={{ color: colors.textMuted, textDecoration: "none" }}>Home</Link>
        <span>/</span>
        <Link href="/profile" style={{ color: colors.textMuted, textDecoration: "none" }}>Profile</Link>
        <span>/</span>
        <span style={{ color: colors.textSecondary }}>Edit Car</span>
      </nav>

      <div className="vv-page-container" style={{ maxWidth: "720px" }}>
        <p style={{ color: colors.accent, letterSpacing: "3px", fontSize: "11px", marginBottom: "12px", fontFamily: "Verdana, sans-serif", textTransform: "uppercase" }}>My Garage</p>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "40px", fontFamily: "Georgia, serif" }}>Edit Car</h1>

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <label style={labelStyle}>Make</label>
            <select style={inputStyle} value={form.make_id} onChange={e => { const m = makes.find(mk => mk.id === e.target.value); set("make_id", e.target.value); set("make_name", m?.name || form.make_name); }}>
              <option value="">— Select make —</option>
              {makes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            {!form.make_id && (
              <input style={{ ...inputStyle, marginTop: "8px" }} value={form.make_name} onChange={e => set("make_name", e.target.value)} placeholder="Or type make name…" />
            )}
          </div>

          <div>
            <label style={labelStyle}>Model *</label>
            <input style={inputStyle} value={form.model} onChange={e => set("model", e.target.value)} required />
          </div>
          <div>
            <label style={labelStyle}>Submodel / Edition</label>
            <input style={inputStyle} value={form.submodel} onChange={e => set("submodel", e.target.value)} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Year</label>
              <input style={inputStyle} type="number" value={form.year} onChange={e => set("year", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Color</label>
              <input style={inputStyle} value={form.color} onChange={e => set("color", e.target.value)} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>VIN / Chassis Number</label>
            <input style={inputStyle} value={form.vin} onChange={e => set("vin", e.target.value)} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "12px", alignItems: "end" }}>
            <div>
              <label style={labelStyle}>Mileage</label>
              <input style={inputStyle} type="number" value={form.mileage} onChange={e => set("mileage", e.target.value)} />
            </div>
            <select style={{ ...inputStyle, width: "80px" }} value={form.mileage_unit} onChange={e => set("mileage_unit", e.target.value)}>
              <option value="km">km</option>
              <option value="mi">mi</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Status</label>
            <select style={inputStyle} value={form.status} onChange={e => set("status", e.target.value)}>
              <option value="current">Current Owner</option>
              <option value="for_sale">For Sale</option>
              <option value="previous">Previous Owner</option>
            </select>
          </div>

          {form.status === "previous" && (
            <div>
              <label style={labelStyle}>Date Sold</label>
              <input style={inputStyle} type="date" value={form.date_sold} onChange={e => set("date_sold", e.target.value)} />
            </div>
          )}

          <div>
            <label style={labelStyle}>Purchase Date 🔒</label>
            <input style={inputStyle} type="date" value={form.purchase_date} onChange={e => set("purchase_date", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Purchase Price 🔒</label>
            <input style={inputStyle} type="number" value={form.purchase_price} onChange={e => set("purchase_price", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Numberplate 🔒</label>
            <input style={inputStyle} value={form.numberplate} onChange={e => set("numberplate", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Notes 🔒</label>
            <textarea style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }} value={form.notes} onChange={e => set("notes", e.target.value)} />
          </div>

          <div style={{ display: "flex", gap: "16px", paddingTop: "8px" }}>
            <button type="submit" disabled={saving} style={{ background: colors.accent, color: "#1A1A1A", padding: "13px 32px", border: "none", cursor: "pointer", fontFamily: "Verdana, sans-serif", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <Link href="/profile" style={{ color: colors.textSecondary, textDecoration: "none", fontFamily: "Verdana, sans-serif", fontSize: "12px", display: "flex", alignItems: "center" }}>Cancel</Link>
          </div>
        </form>

        {/* Photos */}
        <div style={{ marginTop: "56px", paddingTop: "40px", borderTop: `1px solid ${colors.border}` }}>
          <p style={{ color: colors.accent, letterSpacing: "3px", fontSize: "11px", marginBottom: "16px", fontFamily: "Verdana, sans-serif", textTransform: "uppercase" }}>Photos</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "12px", marginBottom: "20px" }}>
            {photos.map(p => (
              <div key={p.id} style={{ position: "relative", aspectRatio: "4/3", background: colors.surfaceAlt, border: `1px solid ${colors.border}`, overflow: "hidden" }}>
                <img src={p.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                {p.is_cover && <span style={{ position: "absolute", top: "6px", left: "6px", background: colors.accent, color: "#1A1A1A", fontSize: "9px", padding: "2px 6px", fontFamily: "Verdana, sans-serif", letterSpacing: "1px" }}>COVER</span>}
                <button onClick={() => deletePhoto(p.id)} style={{ position: "absolute", top: "6px", right: "6px", background: "rgba(0,0,0,0.7)", color: "#fff", border: "none", cursor: "pointer", padding: "4px 8px", fontSize: "11px" }}>✕</button>
              </div>
            ))}
          </div>
          <label style={{ display: "inline-block", background: colors.surface, border: `1px solid ${colors.border}`, padding: "10px 20px", cursor: "pointer", fontFamily: "Verdana, sans-serif", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", color: colors.textSecondary }}>
            {uploading ? "Uploading…" : "+ Add Photo"}
            <input type="file" accept="image/*" onChange={uploadPhoto} style={{ display: "none" }} />
          </label>
        </div>

        {/* Documents */}
        <div style={{ marginTop: "40px", paddingTop: "40px", borderTop: `1px solid ${colors.border}` }}>
          <p style={{ color: colors.accent, letterSpacing: "3px", fontSize: "11px", marginBottom: "16px", fontFamily: "Verdana, sans-serif", textTransform: "uppercase" }}>Documents</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
            {docs.map(d => (
              <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: colors.surface, border: `1px solid ${colors.border}`, padding: "10px 16px" }}>
                <div>
                  <p style={{ fontFamily: "Verdana, sans-serif", fontSize: "12px", color: colors.textPrimary, margin: 0 }}>{d.file_name}</p>
                  <p style={{ fontFamily: "Verdana, sans-serif", fontSize: "10px", color: colors.textMuted, margin: 0, textTransform: "uppercase", letterSpacing: "1px" }}>{d.document_type} · {d.is_public ? "Public" : "Private"}</p>
                </div>
                <button onClick={() => deleteDoc(d.id)} style={{ background: "none", border: "none", cursor: "pointer", color: colors.textMuted, fontSize: "14px" }}>✕</button>
              </div>
            ))}
          </div>
          <label style={{ display: "inline-block", background: colors.surface, border: `1px solid ${colors.border}`, padding: "10px 20px", cursor: "pointer", fontFamily: "Verdana, sans-serif", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", color: colors.textSecondary }}>
            {uploading ? "Uploading…" : "+ Add Document"}
            <input type="file" onChange={uploadDoc} style={{ display: "none" }} />
          </label>
        </div>

        {/* Vehicle History */}
        <div style={{ marginTop: "40px", paddingTop: "40px", borderTop: `1px solid ${colors.border}` }}>
          <p style={{ color: colors.accent, letterSpacing: "3px", fontSize: "11px", marginBottom: "16px", fontFamily: "Verdana, sans-serif", textTransform: "uppercase" }}>Vehicle History Reports</p>
          {vin ? (
            <>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {[
                  { label: "CarVertical →", url: `https://www.carvertical.com/en/check?vin=${vin}` },
                  { label: "Carfax →", url: `https://www.carfax.com/VehicleHistory/ar20/select.cfx?vin=${vin}` },
                  { label: "NHTSA →", url: `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json` },
                ].map(link => (
                  <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" style={{ border: `1px solid ${colors.border}`, color: colors.accentBlue, fontFamily: "Verdana, sans-serif", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", padding: "8px 16px", textDecoration: "none" }}>
                    {link.label}
                  </a>
                ))}
              </div>
              <p style={{ color: colors.textMuted, fontSize: "11px", fontFamily: "Verdana, sans-serif", marginTop: "8px" }}>External services — VinVault is not affiliated with these providers</p>
            </>
          ) : (
            <p style={{ color: colors.textMuted, fontFamily: "Georgia, serif", fontSize: "14px", fontStyle: "italic" }}>Add your VIN above to access vehicle history reports.</p>
          )}
        </div>

        {/* Sell button */}
        <div style={{ marginTop: "40px", paddingTop: "40px", borderTop: `1px solid ${colors.border}`, display: "flex", gap: "16px" }}>
          <Link href={`/garage/${id}/sell`} style={{ border: `1px solid ${colors.accent}`, color: colors.accent, padding: "10px 24px", textDecoration: "none", fontFamily: "Verdana, sans-serif", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase" }}>
            List for Sale →
          </Link>
        </div>
      </div>
    </main>
  );
}
