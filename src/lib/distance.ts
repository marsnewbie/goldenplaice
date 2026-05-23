import { lookupUkPostcode, resolveDeliveryLocation } from "@/lib/uk-postcode";

export { lookupUkPostcode, resolveDeliveryLocation };

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

/** Driving distance via OSRM (free public instance). Falls back to haversine. */
export async function drivingDistanceMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): Promise<{ miles: number; method: "driving" | "straight" }> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?overview=false`;
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as {
        code: string;
        routes?: Array<{ distance: number }>;
      };
      if (data.code === "Ok" && data.routes?.[0]) {
        const miles = data.routes[0].distance / 1609.344;
        return { miles, method: "driving" };
      }
    }
  } catch {
    // fallback below
  }
  return {
    miles: haversineMiles(lat1, lng1, lat2, lng2),
    method: "straight",
  };
}

export function calculateDeliveryFee(
  miles: number,
  tiers: { maxMiles: number; fee: number }[],
  maxMiles: number
): { fee: number; available: boolean; message: string } {
  const rounded = Math.round(miles * 10) / 10;

  if (rounded > maxMiles) {
    return {
      fee: 0,
      available: false,
      message: `Sorry, we only deliver within ${maxMiles} miles (you are ${rounded.toFixed(1)} miles away). Please choose collection.`,
    };
  }

  const sorted = [...tiers].sort((a, b) => a.maxMiles - b.maxMiles);
  for (const tier of sorted) {
    if (rounded <= tier.maxMiles) {
      return {
        fee: tier.fee,
        available: true,
        message: `Delivery available — ${rounded.toFixed(1)} miles by road (£${tier.fee.toFixed(2)} delivery fee)`,
      };
    }
  }

  return {
    fee: 0,
    available: false,
    message: "Delivery not available for this address.",
  };
}
