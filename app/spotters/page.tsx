export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import SpottersClient from "./SpottersClient";

export const metadata: Metadata = {
  title: "Car Spotters Community",
  description: "Join the VinVault car spotting community. Submit spottings of rare and collectible cars. Build your reputation. Earn badges.",
};

interface Sighting {
  id: string;
  chassis_number: string;
  make_id: string;
  model_id: string;
  latitude: number;
  longitude: number;
  location_name: string;
  country: string;
  spotted_at: string;
  spotter_email: string;
  spotter_username: string;
  photo_url: string;
  notes?: string;
  confidence_score: number;
  status: string;
}

interface SpotterProfile {
  user_email: string;
  username: string;
  country: string;
  trust_level: number;
  total_sightings: number;
  verified_sightings: number;
  total_points: number;
}

interface LeaderboardEntry {
  username: string;
  country: string;
  trust_level: number;
  count: number;
  points: number;
}

async function getData() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return { sightings: [], leaderboard: [] };

  const headers = { apikey: key, Authorization: `Bearer ${key}` };

  const [sightingsRes, profilesRes] = await Promise.all([
    fetch(`${url}/rest/v1/sightings?status=in.(approved,pending_community,verified)&order=spotted_at.desc&limit=100`, { headers, cache: "no-store" }),
    fetch(`${url}/rest/v1/spotter_profiles?order=verified_sightings.desc&limit=20`, { headers, cache: "no-store" }),
  ]);

  const sightings: Sighting[] = sightingsRes.ok ? await sightingsRes.json() : [];
  const profiles: SpotterProfile[] = profilesRes.ok ? await profilesRes.json() : [];

  // Build monthly leaderboard — prefer profile data, fall back to sighting email counts
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const thisMonth = sightings.filter(s => s.spotted_at >= monthStart);

  const profileMap = new Map(profiles.map(p => [p.user_email, p]));
  const countMap = new Map<string, number>();
  for (const s of thisMonth) {
    if (s.spotter_email) countMap.set(s.spotter_email, (countMap.get(s.spotter_email) ?? 0) + 1);
  }

  const leaderboard: LeaderboardEntry[] = Array.from(countMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([email, count], i) => {
      const p = profileMap.get(email);
      return {
        username: p?.username ?? email.split("@")[0],
        country: p?.country ?? "",
        trust_level: p?.trust_level ?? 1,
        count,
        points: count * 10,
      };
    });

  // If no activity this month, fall back to all-time from profiles
  const finalLeaderboard = leaderboard.length > 0
    ? leaderboard
    : profiles.slice(0, 10).map(p => ({
        username: p.username,
        country: p.country,
        trust_level: p.trust_level,
        count: p.verified_sightings,
        points: p.total_points,
      }));

  return { sightings, leaderboard: finalLeaderboard };
}

export default async function SpottersPage() {
  const { sightings, leaderboard } = await getData();
  return <SpottersClient sightings={sightings} leaderboard={leaderboard} />;
}
