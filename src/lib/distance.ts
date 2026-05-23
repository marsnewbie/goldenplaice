const EARTH_RADIUS_MILES = 3958.8;

export function haversineMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_MILES * c;
}

export interface PostcodeResult {
  lat: number;
  lng: number;
  postcode: string;
}

export async function lookupUkPostcode(postcode: string): Promise<PostcodeResult | null> {
  const normalized = postcode.replace(/\s+/g, " ").trim().toUpperCase();
  const encoded = encodeURIComponent(normalized);

  try {
    const res = await fetch(`https://api.postcodes.io/postcodes/${encoded}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) {
      const bulk = await fetch("https://api.postcodes.io/postcodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postcodes: [normalized] }),
      });
      if (!bulk.ok) return null;
      const bulkData = (await bulk.json()) as {
        result: Array<{ result: { latitude: number; longitude: number; postcode: string } | null }>;
      };
      const first = bulkData.result?.[0]?.result;
      if (!first) return null;
      return { lat: first.latitude, lng: first.longitude, postcode: first.postcode };
    }
    const data = (await res.json()) as {
      result: { latitude: number; longitude: number; postcode: string };
    };
    return {
      lat: data.result.latitude,
      lng: data.result.longitude,
      postcode: data.result.postcode,
    };
  } catch {
    return null;
  }
}

export function calculateDeliveryFee(
  miles: number,
  tiers: { maxMiles: number; fee: number }[],
  maxMiles: number
): { fee: number; available: boolean; message: string } {
  if (miles > maxMiles) {
    return {
      fee: 0,
      available: false,
      message: `Sorry, we only deliver within ${maxMiles} miles. Please choose collection instead.`,
    };
  }

  const sorted = [...tiers].sort((a, b) => a.maxMiles - b.maxMiles);
  for (const tier of sorted) {
    if (miles <= tier.maxMiles) {
      return {
        fee: tier.fee,
        available: true,
        message: `Delivery available — ${miles.toFixed(1)} miles (£${tier.fee.toFixed(2)} fee)`,
      };
    }
  }

  return {
    fee: 0,
    available: false,
    message: "Delivery not available for this address.",
  };
}
