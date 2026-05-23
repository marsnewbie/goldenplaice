/** UK postcode utilities — uses postcodes.io (free, no API key). */

const UK_POSTCODE_REGEX =
  /\b([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})\b/i;

export function normalizePostcode(input: string): string {
  const clean = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (clean.length < 5 || clean.length > 7) {
    return input.trim().toUpperCase();
  }
  return `${clean.slice(0, -3)} ${clean.slice(-3)}`;
}

export function extractPostcodeFromText(text: string): string | null {
  const match = text.match(UK_POSTCODE_REGEX);
  return match ? normalizePostcode(match[1]) : null;
}

export interface PostcodeLocation {
  lat: number;
  lng: number;
  postcode: string;
  parish?: string;
  admin_district?: string;
}

async function fetchPostcodesIo<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: { Accept: "application/json", ...init?.headers },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function lookupUkPostcode(postcode: string): Promise<PostcodeLocation | null> {
  const normalized = normalizePostcode(postcode);

  const direct = await fetchPostcodesIo<{
    status: number;
    result: {
      latitude: number;
      longitude: number;
      postcode: string;
      parish?: string;
      admin_district?: string;
    } | null;
  }>(`https://api.postcodes.io/postcodes/${encodeURIComponent(normalized)}`);

  if (direct?.status === 200 && direct.result) {
    return {
      lat: direct.result.latitude,
      lng: direct.result.longitude,
      postcode: direct.result.postcode,
      parish: direct.result.parish,
      admin_district: direct.result.admin_district,
    };
  }

  const bulk = await fetchPostcodesIo<{
    status: number;
    result: Array<{
      result: {
        latitude: number;
        longitude: number;
        postcode: string;
        parish?: string;
        admin_district?: string;
      } | null;
    }>;
  }>("https://api.postcodes.io/postcodes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postcodes: [normalized] }),
  });

  const first = bulk?.result?.[0]?.result;
  if (first) {
    return {
      lat: first.latitude,
      lng: first.longitude,
      postcode: first.postcode,
      parish: first.parish,
      admin_district: first.admin_district,
    };
  }

  return null;
}

export interface PostcodeSuggestion {
  postcode: string;
  district?: string;
}

/** Autocomplete partial postcodes (postcodes.io). */
export async function autocompletePostcode(
  query: string,
  limit = 8
): Promise<PostcodeSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const data = await fetchPostcodesIo<{
    status: number;
    result: string[] | null;
  }>(
    `https://api.postcodes.io/postcodes/${encodeURIComponent(trimmed)}/autocomplete?limit=${limit}`
  );

  if (!data?.result?.length) return [];

  return data.result.map((pc) => ({ postcode: pc }));
}

/** Resolve postcode or full address text to coordinates. */
export async function resolveDeliveryLocation(input: string): Promise<PostcodeLocation | null> {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const extracted = extractPostcodeFromText(trimmed);
  if (extracted) {
    const fromPostcode = await lookupUkPostcode(extracted);
    if (fromPostcode) return fromPostcode;
  }

  if (/^[A-Z0-9\s-]+$/i.test(trimmed.replace(/\s/g, "")) && trimmed.length <= 8) {
    const direct = await lookupUkPostcode(trimmed);
    if (direct) return direct;
  }

  return geocodeUkAddress(trimmed);
}

/** OpenStreetMap Nominatim — free geocoding for full addresses (UK-biased). */
export async function geocodeUkAddress(address: string): Promise<PostcodeLocation | null> {
  const q = address.includes("UK") || address.includes("United Kingdom")
    ? address
    : `${address}, United Kingdom`;

  const params = new URLSearchParams({
    q,
    format: "json",
    limit: "1",
    countrycodes: "gb",
  });

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "GoldenPlaiceOrdering/1.0 (takeaway delivery check)",
        },
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    const results = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
    if (!results.length) return null;

    const hit = results[0];
    const postcode =
      extractPostcodeFromText(hit.display_name) ||
      extractPostcodeFromText(address) ||
      "";

    return {
      lat: parseFloat(hit.lat),
      lng: parseFloat(hit.lon),
      postcode: postcode || "—",
    };
  } catch {
    return null;
  }
}
