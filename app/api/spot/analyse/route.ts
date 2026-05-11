// Set ANTHROPIC_API_KEY in Coolify env vars to enable AI car identification
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface AIResult {
  make: string | null;
  model: string | null;
  confidence: number;
  numberplate: string | null;
  plate_confidence: number;
  color: string | null;
  approximate_year: string | null;
  notes: string | null;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ available: false, reason: "AI identification not configured" });
  }

  let body: { image: string; mediaType?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.image) {
    return NextResponse.json({ error: "Missing image data" }, { status: 400 });
  }

  // Strip data URI prefix if present
  const base64Data = body.image.replace(/^data:image\/[a-z]+;base64,/, "");
  const mediaType = (body.mediaType || "image/jpeg") as "image/jpeg" | "image/png" | "image/webp";

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        messages: [{
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64Data },
            },
            {
              type: "text",
              text: 'Analyse this car photo and respond ONLY with JSON in this exact format, no other text: {"make": "Ferrari", "model": "488 GTB", "confidence": 0.85, "numberplate": "AB 12345", "plate_confidence": 0.7, "color": "Red", "approximate_year": "2015-2020", "notes": "brief description"}. If you cannot identify the make set it to null. If no numberplate is visible set numberplate to null. Only include the JSON object, nothing else.',
            },
          ],
        }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ available: true, error: "AI API error: " + errText }, { status: 502 });
    }

    const data = await res.json();
    const text = data.content?.[0]?.text || "";

    let result: AIResult;
    try {
      // Extract JSON from the response (in case there's any extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      result = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json({ available: true, error: "Could not parse AI response", raw: text });
    }

    return NextResponse.json({ available: true, result });
  } catch (err: unknown) {
    return NextResponse.json({ available: true, error: String(err) }, { status: 500 });
  }
}
