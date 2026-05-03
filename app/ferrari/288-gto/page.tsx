export const dynamic = 'force-dynamic';
import RegistryClient from './RegistryClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Ferrari 288 GTO World Registry — VinVault",
  description: "Complete Ferrari 288 GTO chassis registry. 272 cars produced 1984–1985. Community-verified records of every chassis — history, color, market, and provenance.",
  openGraph: {
    title: "Ferrari 288 GTO World Registry",
    description: "272 cars produced 1984–1985. Browse and contribute to the complete chassis registry.",
    siteName: "VinVault Registry",
    type: "website",
  },
};

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
