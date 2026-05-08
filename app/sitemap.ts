import type { MetadataRoute } from "next";

const BASE = "https://www.vinvault.net";

async function getApprovedChassis(): Promise<string[]> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return [];
  try {
    const res = await fetch(
      `${url}/rest/v1/submissions?status=eq.approved&select=chassis_number`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" }
    );
    if (!res.ok) return [];
    const data: { chassis_number: string }[] = await res.json();
    return data.map((d) => d.chassis_number).filter(Boolean);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const chassis = await getApprovedChassis();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/ferrari/288-gto`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/spotters`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/vin-lookup`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/submit`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/spot`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/ferrari/288-gto/info`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  const chassisPages: MetadataRoute.Sitemap = chassis.map((c) => ({
    url: `${BASE}/ferrari/288-gto/${encodeURIComponent(c)}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...chassisPages];
}
