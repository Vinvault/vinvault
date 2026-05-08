export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import SpottersClient from "./SpottersClient";

export const metadata: Metadata = {
  title: "Car Spotters Community",
  description: "Join the VinVault car spotting community. Submit spottings of rare and collectible cars. Build your reputation. Earn badges.",
};

export interface Sighting {
  id: string;
  chassis_number: string;
  make_id: string;
  model_id: string;
  spotter_email: string;
  spotter_username: string;
  spotted_at: string;
  latitude: number;
  longitude: number;
  location_name: string;
  country: string;
  photo_url: string;
  notes?: string;
  status: string;
  confidence_score: number;
}

export interface SpotterProfile {
  user_email: string;
  username: string;
  country: string;
  trust_level: number;
  total_sightings: number;
  verified_sightings: number;
  total_points: number;
}

export interface GhostCar {
  chassis: string;
  make: string;
  model: string;
  last_location: string;
  last_year: number;
  years_missing: number;
}

export interface PageData {
  sightings: Sighting[];
  profiles: SpotterProfile[];
  makes: Record<string, string>;
  models: Record<string, string>;
  stats: { total: number; spotters: number; countries: number; chassis: number };
  ghost: GhostCar | null;
}

async function getData(): Promise<PageData> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  const empty: PageData = { sightings: [], profiles: [], makes: {}, models: {}, stats: { total: 0, spotters: 0, countries: 0, chassis: 0 }, ghost: null };
  if (!url || !key) return empty;

  const h = { apikey: key, Authorization: `Bearer ${key}` };

  const [sightingsRes, profilesRes, makesRes, modelsRes, ghostChassisRes] = await Promise.all([
    fetch(`${url}/rest/v1/sightings?status=in.(approved,pending_community,verified,pending)&order=spotted_at.desc&limit=50`, { headers: h, cache: "no-store" }),
    fetch(`${url}/rest/v1/spotter_profiles?order=total_points.desc&limit=50`, { headers: h, cache: "no-store" }),
    fetch(`${url}/rest/v1/makes?select=id,name&limit=100`, { headers: h, cache: "no-store" }),
    fetch(`${url}/rest/v1/models?select=id,model,make&limit=200`, { headers: h, cache: "no-store" }),
    fetch(`${url}/rest/v1/submissions?status=eq.approved&select=chassis_number&limit=5`, { headers: h, cache: "no-store" }),
  ]);

  const sightings: Sighting[] = sightingsRes.ok ? await sightingsRes.json() : [];
  const profiles: SpotterProfile[] = profilesRes.ok ? await profilesRes.json() : [];
  const makesRaw: { id: string; name: string }[] = makesRes.ok ? await makesRes.json() : [];
  const modelsRaw: { id: string; model: string; make: string }[] = modelsRes.ok ? await modelsRes.json() : [];
  const ghostCandidates: { chassis_number: string }[] = ghostChassisRes.ok ? await ghostChassisRes.json() : [];

  const makes: Record<string, string> = {};
  for (const m of makesRaw) makes[m.id] = m.name;

  const models: Record<string, string> = {};
  for (const m of modelsRaw) models[m.id] = m.model;

  const sightedChassis = new Set(sightings.map(s => s.chassis_number));
  const ghostCandidate = ghostCandidates.find(c => !sightedChassis.has(c.chassis_number));

  const stats = {
    total: sightings.length,
    spotters: new Set(sightings.map(s => s.spotter_email).filter(Boolean)).size || profiles.length,
    countries: new Set(sightings.map(s => s.country).filter(Boolean)).size,
    chassis: new Set(sightings.map(s => s.chassis_number)).size,
  };

  // Merge profile count into stats
  if (profiles.length > stats.spotters) stats.spotters = profiles.length;

  const ghost: GhostCar | null = ghostCandidate ? {
    chassis: ghostCandidate.chassis_number,
    make: "Ferrari",
    model: "288 GTO",
    last_location: "Unknown",
    last_year: 2019,
    years_missing: new Date().getFullYear() - 2019,
  } : {
    chassis: "ZFFPA16B000040099",
    make: "Ferrari",
    model: "288 GTO",
    last_location: "Monaco",
    last_year: 2019,
    years_missing: new Date().getFullYear() - 2019,
  };

  return { sightings, profiles, makes, models, stats, ghost };
}

export default async function SpottersPage() {
  const data = await getData();
  return <SpottersClient data={data} />;
}
