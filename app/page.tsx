export const revalidate = 60;
import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "VinVault — The World's Most Complete Classic Car Registry",
  description: "Community-verified chassis records for the rarest cars ever built. Every VIN documented, every history preserved. Starting with the Ferrari 288 GTO.",
  openGraph: {
    title: "VinVault — The World's Most Complete Classic Car Registry",
    description: "Community-verified chassis records for the rarest classic cars. Ferrari 288 GTO registry live now.",
    siteName: "VinVault Registry",
    type: "website",
    url: "https://www.vinvault.net",
  },
  twitter: {
    card: "summary_large_image",
    title: "VinVault — Classic Car Registry",
    description: "Community-verified chassis records for the rarest cars ever built.",
  },
};

async function getHomeData() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return {
    recent: [], documented: 0, sightings: [], stats: { chassis: 0, sightings: 0, spotters: 0, countries: 0 }, topSpotters: [], ghost: null,
  };

  const h = { apikey: key, Authorization: `Bearer ${key}` };

  try {
    const [recentRes, countRes, sightingsRes, profilesRes] = await Promise.all([
      fetch(`${url}/rest/v1/submissions?status=eq.approved&order=created_at.desc&limit=3`, { headers: h, next: { revalidate: 60 } }),
      fetch(`${url}/rest/v1/submissions?status=eq.approved&select=id`, { headers: { ...h, Prefer: "count=exact" }, next: { revalidate: 60 } }),
      fetch(`${url}/rest/v1/sightings?status=in.(approved,pending_community,verified)&order=spotted_at.desc&limit=20`, { headers: h, next: { revalidate: 60 } }),
      fetch(`${url}/rest/v1/spotter_profiles?order=total_points.desc&limit=5`, { headers: h, next: { revalidate: 60 } }),
    ]);

    const recent = recentRes.ok ? await recentRes.json() : [];
    const documented = parseInt(countRes.headers.get("content-range")?.split("/")[1] ?? "0", 10);
    const sightings = sightingsRes.ok ? await sightingsRes.json() : [];
    const topSpotters = profilesRes.ok ? await profilesRes.json() : [];

    const countries = new Set(sightings.map((s: any) => s.country).filter(Boolean)).size;
    const spotters = new Set(sightings.map((s: any) => s.spotter_email).filter(Boolean)).size;

    const ghost = sightings.length > 0 ? null : {
      chassis: "ZFFPA16B000040099",
      make: "Ferrari",
      model: "288 GTO",
      last_location: "Monaco",
      last_year: 2019,
      years_missing: new Date().getFullYear() - 2019,
    };

    return {
      recent,
      documented,
      sightings,
      stats: { chassis: documented, sightings: sightings.length || 0, spotters: Math.max(spotters, topSpotters.length), countries },
      topSpotters,
      ghost,
    };
  } catch {
    return { recent: [], documented: 0, sightings: [], stats: { chassis: 0, sightings: 0, spotters: 0, countries: 0 }, topSpotters: [], ghost: null };
  }
}

export default async function Home() {
  const data = await getHomeData();
  return <HomeClient {...data} />;
}
