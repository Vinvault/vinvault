export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import SightingsClient from "./SightingsClient";

export const metadata: Metadata = {
  title: "Global Sightings — VinVault",
  description: "Track Ferrari 288 GTO sightings worldwide. Community-reported locations, photos, and spotter leaderboard.",
};

interface Sighting {
  id: string;
  chassis_number: string;
  latitude: number;
  longitude: number;
  location_name: string;
  country: string;
  spotted_at: string;
  spotter_email: string;
  photo_url: string;
  notes?: string;
  confidence_score: number;
  status: string;
}

async function getSightings(): Promise<Sighting[]> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return [];
  try {
    const res = await fetch(
      `${url}/rest/v1/sightings?status=in.(approved,pending_community)&order=spotted_at.desc&limit=200`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" }
    );
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export default async function SightingsPage() {
  const sightings = await getSightings();

  // Compute spotter leaderboard for this month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const thisMonthSightings = sightings.filter(s => s.spotted_at >= monthStart);

  const spotterCounts = new Map<string, number>();
  for (const s of thisMonthSightings) {
    if (s.spotter_email) {
      spotterCounts.set(s.spotter_email, (spotterCounts.get(s.spotter_email) ?? 0) + 1);
    }
  }
  const spotterStats = Array.from(spotterCounts.entries())
    .map(([email, count]) => ({ email, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return <SightingsClient sightings={sightings} spotterStats={spotterStats} />;
}
