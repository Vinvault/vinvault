export const revalidate = 60;
import RegistryClient from './RegistryClient';
import type { Metadata } from 'next';

async function getApprovedClaims(): Promise<string[]> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) return [];
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/car_claims?status=eq.approved&select=chassis_number`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }, next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data: { chassis_number: string }[] = await res.json();
    return data.map((d) => d.chassis_number);
  } catch {
    return [];
  }
}

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
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function Ferrari288GTOPage() {
  const [cars, ownedChassis] = await Promise.all([
    getApprovedSubmissions(),
    getApprovedClaims(),
  ]);
  return <RegistryClient cars={cars} ownedChassis={new Set(ownedChassis)} />;
}
