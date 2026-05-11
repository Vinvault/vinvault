import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const h = () => ({
  apikey: process.env.SUPABASE_SERVICE_KEY!,
  Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY!}`,
});

async function getListing(listingId: string) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;

  const res = await fetch(`${url}/rest/v1/garage_listings?id=eq.${listingId}&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) return null;
  const listings = await res.json();
  if (!listings[0]) return null;
  const l = listings[0];

  const [carRes, photosRes, profRes] = await Promise.all([
    fetch(`${url}/rest/v1/user_garage?id=eq.${l.garage_car_id}&limit=1`, { headers: h() }),
    fetch(`${url}/rest/v1/garage_photos?garage_car_id=eq.${l.garage_car_id}&is_cover=eq.true&limit=1`, { headers: h() }),
    fetch(`${url}/rest/v1/spotter_profiles?user_email=eq.${encodeURIComponent(l.user_email)}&select=username&limit=1`, { headers: h() }),
  ]);

  const cars = carRes.ok ? await carRes.json() : [];
  const photos = photosRes.ok ? await photosRes.json() : [];
  const profs = profRes.ok ? await profRes.json() : [];

  return {
    ...l,
    car: cars[0] ?? {},
    cover_photo: photos[0]?.photo_url ?? null,
    seller_username: profs[0]?.username ?? null,
  };
}

function fmtPrice(price: number, currency: string) {
  const symbols: Record<string, string> = { EUR: "€", DKK: "DKK ", SEK: "SEK ", GBP: "£", USD: "$" };
  return `${symbols[currency] ?? ""}${Math.round(price).toLocaleString()}`;
}

export async function GET(req: NextRequest) {
  const listingId = new URL(req.url).searchParams.get("listing_id");
  if (!listingId) return new Response("Missing listing_id", { status: 400 });

  const data = await getListing(listingId);
  if (!data) return new Response("Listing not found", { status: 404 });

  const car = data.car;
  const title = `${car.year ? car.year + " " : ""}${car.make_name} ${car.model}`;
  const subtitle = [car.color, car.mileage ? `${Number(car.mileage).toLocaleString()} km` : null].filter(Boolean).join(" · ");
  const price = fmtPrice(Number(data.asking_price), data.currency);
  const location = [data.location_city, data.location_country].filter(Boolean).join(", ");
  const seller = data.seller_username ? `@${data.seller_username}` : "a VinVault member";
  const listingUrl = `vinvault.net/for-sale/${listingId}`;

  // Generate caption for response header
  const tags = [car.make_name, car.model, "CarForSale", "VinVault", "ClassicCar", "RareCar", "CollectorCar"]
    .filter(Boolean).map(t => `#${t.replace(/\s+/g, "")}`).join(" ");
  const caption = `🚗 FOR SALE via @vinvault\n\n${title}\n${subtitle}\n\nListed by ${seller}\n\nSign in to contact the seller:\n${listingUrl}\n\nView all cars for sale:\nvinvault.net/for-sale\n\n${tags}`;

  const imageResponse = new ImageResponse(
    (
      <div
        style={{
          width: "1080px",
          height: "1080px",
          background: "#1A1A1A",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Top 60%: car photo or placeholder */}
        <div style={{
          height: "648px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111111",
          overflow: "hidden",
          position: "relative",
        }}>
          {data.cover_photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.cover_photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: "120px" }}>
              🚗
            </div>
          )}
          {/* Gold gradient overlay at bottom of photo */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "120px", background: "linear-gradient(to top, #1A1A1A, transparent)" }} />
        </div>

        {/* Bottom 40%: info panel */}
        <div style={{
          flex: 1,
          padding: "28px 40px 32px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#1A1A1A",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
              <span style={{ fontSize: "24px", fontWeight: "bold", color: "#C9A84C" }}>Vin</span>
              <span style={{ fontSize: "24px", fontWeight: "bold", color: "#FFFDF8" }}>Vault</span>
            </div>
            {/* FOR SALE badge */}
            <div style={{ background: "#C9A84C", color: "#1A1A1A", padding: "6px 16px", fontSize: "12px", fontFamily: "Verdana, sans-serif", letterSpacing: "2px" }}>
              FOR SALE
            </div>
          </div>

          <div>
            <p style={{ fontSize: "48px", fontWeight: "bold", color: "#FFFDF8", lineHeight: 1.1, margin: "0 0 8px" }}>{title}</p>
            {subtitle && <p style={{ fontSize: "22px", color: "#9A8A7A", margin: "0 0 12px", fontFamily: "Verdana, sans-serif" }}>{subtitle}</p>}
            <p style={{ fontSize: "36px", fontWeight: "bold", color: "#C9A84C", margin: "0 0 8px" }}>{price}</p>
            {location && <p style={{ fontSize: "18px", color: "#9A8A7A", margin: "0", fontFamily: "Verdana, sans-serif" }}>{location}</p>}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <p style={{ fontSize: "14px", color: "#FFFDF8", fontFamily: "Verdana, sans-serif", margin: "0 0 4px" }}>Listed by {seller}</p>
              <p style={{ fontSize: "14px", color: "#C9A84C", fontFamily: "Verdana, sans-serif", margin: 0 }}>{listingUrl}</p>
            </div>
            <div style={{ width: "48px", height: "48px", border: "2px solid #C9A84C", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "24px", height: "24px", background: "#C9A84C" }} />
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1080 }
  );

  // Clone to add caption header
  const headers = new Headers(imageResponse.headers);
  headers.set("X-Caption", encodeURIComponent(caption));
  headers.set("X-Caption-Json", encodeURIComponent(JSON.stringify({ caption, image_url: `/api/garage/instagram-card?listing_id=${listingId}` })));

  return new Response(imageResponse.body, { status: 200, headers });
}
