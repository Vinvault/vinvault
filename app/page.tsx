export const dynamic = "force-dynamic";
import HomeClient from "./HomeClient";

async function getHomeData() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return { recent: [], totalCount: 0, verifiedCount: 0 };

  const headers = { apikey: key, Authorization: `Bearer ${key}` };

  try {
    const [recentRes, countRes] = await Promise.all([
      fetch(`${url}/rest/v1/submissions?status=eq.approved&order=created_at.desc&limit=5`, {
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
