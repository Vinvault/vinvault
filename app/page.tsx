export const dynamic = "force-dynamic";
import HomeClient from "./HomeClient";
import type { Metadata } from "next";

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
  if (!url || !key) return { recent: [], totalCount: 0, verifiedCount: 0 };

  const headers = { apikey: key, Authorization: `Bearer ${key}` };

  try {
    const [recentRes, countRes] = await Promise.all([
      fetch(`${url}/rest/v1/submissions?status=eq.approved&order=created_at.desc&limit=3`, {
        headers, cache: "no-store",
      }),
      fetch(`${url}/rest/v1/submissions?status=eq.approved&select=id`, {
        headers: { ...headers, Prefer: "count=exact" }, cache: "no-store",
      }),
    ]);

    const recent = recentRes.ok ? await recentRes.json() : [];
    const totalCount = parseInt(countRes.headers.get("content-range")?.split("/")[1] ?? "0", 10);

    return { recent, totalCount, verifiedCount: totalCount };
  } catch {
    return { recent: [], totalCount: 0, verifiedCount: 0 };
  }
}

export default async function Home() {
  const { recent, totalCount, verifiedCount } = await getHomeData();

  return (
    <HomeClient
      recent={recent}
      recentCount={totalCount}
      modelCount={1}
      verifiedCount={verifiedCount}
    />
  );
}
