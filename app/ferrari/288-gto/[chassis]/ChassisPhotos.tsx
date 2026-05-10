"use client";
import { useEffect, useState, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

interface Photo { name: string; url: string; }

export default function ChassisPhotos({ chassis }: { chassis: string }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email ?? null);
      const { data } = await supabase.storage.from("chassis-photos").list(chassis, { sortBy: { column: "created_at", order: "desc" } });
      if (data) {
        const withUrls = data
          .filter(f => f.name !== ".emptyFolderPlaceholder")
          .map(f => ({
            name: f.name,
            url: supabase.storage.from("chassis-photos").getPublicUrl(`${chassis}/${f.name}`).data.publicUrl,
          }));
        setPhotos(withUrls);
      }
    }
    load();
  }, [chassis]);

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Max file size is 5 MB."); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setError("Only JPEG, PNG, or WebP."); return; }
    setUploading(true);
    setError("");
    const ext = file.name.split(".").pop();
    const path = `${chassis}/${Date.now()}.${ext}`;
    const { error: err } = await supabase.storage.from("chassis-photos").upload(path, file);
    if (err) { setError(err.message); setUploading(false); return; }
    const url = supabase.storage.from("chassis-photos").getPublicUrl(path).data.publicUrl;
    setPhotos(prev => [{ name: path.split("/").pop()!, url }, ...prev]);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div style={{ marginBottom: "32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2 style={{ color: "#C9A84C", fontSize: "11px", letterSpacing: "3px" }}>PHOTOS</h2>
        {userEmail && (
          <label style={{ background: "#FFFDF8", border: "1px solid #E8E2D8", color: "#6A5A4A", padding: "6px 16px", fontSize: "12px", cursor: "pointer", letterSpacing: "1px" }}>
            {uploading ? "UPLOADING…" : "+ ADD PHOTO"}
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} disabled={uploading} style={{ display: "none" }} />
          </label>
        )}
      </div>

      {error && <p style={{ color: "#E07070", fontSize: "13px", marginBottom: "12px" }}>{error}</p>}

      {photos.length === 0 ? (
        <p style={{ color: "#9A8A7A", fontSize: "14px", background: "#FFFDF8", padding: "24px", border: "1px solid #E8E2D8", textAlign: "center" }}>
          No photos yet.{userEmail ? " Upload the first one." : " Sign in to upload photos."}
        </p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
          {photos.map(p => (
            <div key={p.name} style={{ aspectRatio: "4/3", background: "#FFFDF8", border: "1px solid #E8E2D8", overflow: "hidden", cursor: "pointer" }}
              onClick={() => setLightbox(p.url)}>
              <img src={p.url} alt={`Chassis ${chassis}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
            </div>
          ))}
        </div>
      )}

      {lightbox && (
        <div onClick={() => setLightbox(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <img src={lightbox} alt="Full size" style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain" }} />
        </div>
      )}
    </div>
  );
}
