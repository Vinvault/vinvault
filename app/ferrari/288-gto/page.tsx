export const dynamic = 'force-dynamic';
import RegistryClient from './RegistryClient';

async function getApprovedSubmissions() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) return [];
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/submissions?status=eq.approved&order=created_at.desc`,
      {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
        cache: 'no-store',
      }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function Ferrari288GTOPage() {
  const cars = await getApprovedSubmissions();
  return <RegistryClient cars={cars} />;
}
