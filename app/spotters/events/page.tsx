export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import EventsClient from "./EventsClient";

export const metadata: Metadata = {
  title: "Spotter Events — VinVault",
  description: "Upcoming car spotter events, Cars & Coffee meetups, and rallies. Submit your event to the VinVault community.",
};

interface SpotterEvent {
  id: string;
  name: string;
  description: string;
  location_name: string;
  country: string;
  latitude: number;
  longitude: number;
  event_date: string;
  event_time: string;
  organizer_email: string;
  host_name: string;
  host_url: string;
  event_url: string;
  expected_makes: string;
  town: string;
  is_approved: boolean;
  created_at: string;
}

async function getEvents(): Promise<SpotterEvent[]> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return [];
  try {
    const res = await fetch(
      `${url}/rest/v1/spotter_events?is_approved=eq.true&order=event_date.asc`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" }
    );
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export default async function EventsPage() {
  const events = await getEvents();
  const now = new Date().toISOString().split("T")[0];
  const upcoming = events.filter(e => e.event_date >= now);
  const past = events.filter(e => e.event_date < now).reverse();
  return <EventsClient upcoming={upcoming} past={past} />;
}
