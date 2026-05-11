import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const h = () => ({
  apikey: process.env.SUPABASE_SERVICE_KEY!,
  Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY!}`,
});

export async function GET(req: NextRequest) {
  const listingId = new URL(req.url).searchParams.get("listing_id");
  if (!listingId) return NextResponse.json({ error: "Missing listing_id" }, { status: 400 });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return NextResponse.json({ error: "Server error" }, { status: 500 });

  const listRes = await fetch(`${url}/rest/v1/garage_listings?id=eq.${listingId}&limit=1`, { headers: h(), cache: "no-store" });
  const listings = listRes.ok ? await listRes.json() : [];
  if (!listings[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const l = listings[0];

  const [carRes, profRes] = await Promise.all([
    fetch(`${url}/rest/v1/user_garage?id=eq.${l.garage_car_id}&limit=1`, { headers: h(), cache: "no-store" }),
    fetch(`${url}/rest/v1/spotter_profiles?user_email=eq.${encodeURIComponent(l.user_email)}&select=username&limit=1`, { headers: h(), cache: "no-store" }),
  ]);
  const cars = carRes.ok ? await carRes.json() : [];
  const profs = profRes.ok ? await profRes.json() : [];
  const car = cars[0] ?? {};
  const seller = profs[0]?.username ? `@${profs[0].username}` : "a VinVault member";

  const title = `${car.year ? car.year + " " : ""}${car.make_name} ${car.model}`;
  const subtitle = [car.color, car.mileage ? `${Number(car.mileage).toLocaleString()} km` : null].filter(Boolean).join(" · ");
  const tags = [car.make_name, car.model, "CarForSale", "VinVault", "ClassicCar", "RareCar", "CollectorCar"]
    .filter(Boolean).map((t: string) => `#${t.replace(/\s+/g, "")}`).join(" ");

  const caption = `🚗 FOR SALE via @vinvault\n\n${title}${subtitle ? "\n" + subtitle : ""}\n\nListed by ${seller}\n\nSign in to contact the seller:\nvinvault.net/for-sale/${listingId}\n\nView all cars for sale:\nvinvault.net/for-sale\n\n${tags}`;

  return NextResponse.json({
    caption,
    image_url: `/api/garage/instagram-card?listing_id=${listingId}`,
  });
}
