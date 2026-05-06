export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProfileClient from "./ProfileClient";

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

interface SpotterProfile {
  id: string;
  user_email: string;
  username: string;
  bio: string;
  country: string;
  trust_level: number;
  total_sightings: number;
  verified_sightings: number;
  total_points: number;
  is_banned: boolean;
  created_at: string;
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `${decodeURIComponent(username)} — VinVault Spotter`,
    description: `Car spotter profile for ${decodeURIComponent(username)} on VinVault.`,
  };
}

async function getProfile(username: string): Promise<SpotterProfile | null> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  try {
    const res = await fetch(
      `${url}/rest/v1/spotter_profiles?username=eq.${encodeURIComponent(username)}&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" }
    );
    if (!res.ok) return null;
    const rows: SpotterProfile[] = await res.json();
    return rows[0] ?? null;
  } catch { return null; }
}

async function getSightings(email: string): Promise<Sighting[]> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return [];
  try {
    const res = await fetch(
      `${url}/rest/v1/sightings?spotter_email=eq.${encodeURIComponent(email)}&order=spotted_at.desc&limit=100`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" }
    );
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

function computeBadges(profile: SpotterProfile, sightings: Sighting[]) {
  const badges: { id: string; label: string; description: string; earned: boolean }[] = [];

  const verified = sightings.filter(s => s.status === "approved" || s.status === "verified" || s.status === "pending_community");
  const countries = new Set(sightings.map(s => s.country).filter(Boolean));
  const ferrariFraction = sightings.length > 0
    ? sightings.filter(s => s.chassis_number?.startsWith("GT")).length
    : 0;

  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

  badges.push({
    id: "first_spotter",
    label: "First Spotter",
    description: "First verified sighting of any chassis",
    earned: verified.length >= 1,
  });
  badges.push({
    id: "ghost_hunter",
    label: "Ghost Hunter",
    description: "Spotted a car not seen in 5+ years",
    earned: false,
  });
  badges.push({
    id: "world_traveler",
    label: "World Traveler",
    description: "Sightings in 5+ countries",
    earned: countries.size >= 5,
  });
  badges.push({
    id: "tifosi",
    label: "Tifosi",
    description: "50+ Ferrari sightings",
    earned: profile.verified_sightings >= 50,
  });
  badges.push({
    id: "identifier",
    label: "Identifier",
    description: "Successfully matched unknown chassis to registry",
    earned: false,
  });

  return badges;
}

export default async function SpotterProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const decoded = decodeURIComponent(username);

  const profile = await getProfile(decoded);
  if (!profile || profile.is_banned) notFound();

  const sightings = await getSightings(profile.user_email);
  const badges = computeBadges(profile, sightings);
  const countries = [...new Set(sightings.map(s => s.country).filter(Boolean))];

  return <ProfileClient profile={profile} sightings={sightings} badges={badges} countries={countries} />;
}
