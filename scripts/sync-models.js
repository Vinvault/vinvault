#!/usr/bin/env node
// Syncs car models from CarQuery + NHTSA APIs into the VinVault models table.

const SUPA_URL = "http://10.0.4.2:8000";
const KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3NzIzNTY0MCwiZXhwIjo0OTMyOTA5MjQwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.yBI3tXv3HWWvxBzi1SW8ssy1RehtyP2oJLo6SNUUD-E";

const PRIORITY_MAKES = [
  "Ferrari", "Lamborghini", "Porsche", "McLaren", "Aston Martin",
  "Koenigsegg", "Pagani", "Maserati", "Bugatti", "Bentley",
  "Rolls-Royce", "Jaguar", "Lotus", "TVR", "De Tomaso",
  "BMW", "Mercedes-Benz", "Alfa Romeo", "Lancia",
];

const supaHeaders = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
};

async function fetchCarQueryModels(makeName) {
  try {
    const url = `http://www.carqueryapi.com/api/0.3/?cmd=getModels&make=${encodeURIComponent(makeName)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!res.ok) return [];
    const data = await res.json();
    const rows = data.Models || [];
    // Group by model_name, track earliest year
    const map = new Map();
    for (const r of rows) {
      const name = (r.model_name || "").trim();
      if (!name) continue;
      const year = parseInt(r.model_year, 10);
      if (!map.has(name) || (year > 0 && year < map.get(name).year)) {
        map.set(name, { name, year: year > 0 ? year : null, body: r.model_body || null });
      }
    }
    return Array.from(map.values());
  } catch (e) {
    return [];
  }
}

async function fetchNHTSAModels(makeName) {
  try {
    const url = `https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/${encodeURIComponent(makeName)}?format=json`;
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.Results || []).map(r => (r.Model_Name || "").trim()).filter(Boolean);
  } catch {
    return [];
  }
}

async function getExistingModels(makeName) {
  const res = await fetch(
    `${SUPA_URL}/rest/v1/models?make=eq.${encodeURIComponent(makeName)}&select=model`,
    { headers: supaHeaders }
  );
  if (!res.ok) return new Set();
  const rows = await res.json();
  return new Set(rows.map(r => r.model.toLowerCase()));
}

async function insertModels(rows) {
  if (rows.length === 0) return 0;
  const res = await fetch(`${SUPA_URL}/rest/v1/models`, {
    method: "POST",
    headers: { ...supaHeaders, Prefer: "return=minimal" },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("  Insert error:", err.slice(0, 200));
    return 0;
  }
  return rows.length;
}

async function syncMake(makeName) {
  process.stdout.write(`  ${makeName}: fetching...`);

  const [cqModels, nhtsa] = await Promise.all([
    fetchCarQueryModels(makeName),
    fetchNHTSAModels(makeName),
  ]);

  // Merge: CarQuery has year data; add NHTSA names that CarQuery missed
  const merged = new Map();
  for (const m of cqModels) {
    merged.set(m.name.toLowerCase(), { name: m.name, year: m.year, body: m.body });
  }
  for (const name of nhtsa) {
    if (!merged.has(name.toLowerCase())) {
      merged.set(name.toLowerCase(), { name, year: null, body: null });
    }
  }

  const existing = await getExistingModels(makeName);
  const toInsert = [];

  for (const [key, m] of merged) {
    if (existing.has(key)) continue;
    toInsert.push({
      make: makeName,
      model: m.name,
      full_model_name: `${makeName} ${m.name}`,
      production_start_year: m.year || 1950,
      production_end_year: null,
      body_style: m.body || null,
      is_active: true,
    });
  }

  const inserted = await insertModels(toInsert);
  console.log(` CQ:${cqModels.length} NHTSA:${nhtsa.length} new:${inserted} (skipped:${merged.size - toInsert.length} existing)`);
  return inserted;
}

async function main() {
  console.log("=== VinVault Model Sync ===\n");
  let total = 0;
  for (const make of PRIORITY_MAKES) {
    const n = await syncMake(make);
    total += n;
    // Small delay to be polite to public APIs
    await new Promise(r => setTimeout(r, 500));
  }
  console.log(`\n✅ Done — ${total} new models inserted across ${PRIORITY_MAKES.length} makes.`);
}

main().catch(console.error);
