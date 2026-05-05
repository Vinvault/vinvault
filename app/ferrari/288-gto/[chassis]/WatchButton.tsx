"use client";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function WatchButton({ chassis }: { chassis: string }) {
  const [watching, setWatching] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) { setLoading(false); return; }
      setUserEmail(user.email);
      const res = await fetch(`/api/car-watches?chassis=${encodeURIComponent(chassis)}`);
      if (res.ok) { const d = await res.json(); setWatching(d.watching); }
      setLoading(false);
    }
    load();
  }, [chassis]);

  async function toggle() {
    if (!userEmail) { window.location.href = "/login"; return; }
    const method = watching ? "DELETE" : "POST";
    const res = await fetch("/api/car-watches", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chassis_number: chassis }),
    });
    if (res.ok) setWatching(!watching);
  }

  if (loading) return null;

  return (
    <button onClick={toggle}
      style={{
        border: `1px solid ${watching ? "#4AB87A" : "#1E3A5A"}`,
        color: watching ? "#4AB87A" : "#8BA5B8",
        background: watching ? "#0D2A1A" : "none",
        padding: "8px 20px", fontSize: "12px", letterSpacing: "1px",
        cursor: "pointer", fontFamily: "Verdana, sans-serif",
      }}>
      {watching ? "✓ WATCHING" : "WATCH"}
    </button>
  );
}
