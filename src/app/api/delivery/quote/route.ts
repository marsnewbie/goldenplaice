import { NextResponse } from "next/server";
import { calculateDeliveryFee, drivingDistanceMiles } from "@/lib/distance";
import { getShopCoordinates } from "@/lib/shop-location";
import { resolveDeliveryLocation } from "@/lib/uk-postcode";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      postcode?: string;
      address?: string;
    };

    const query = [body.address, body.postcode].filter(Boolean).join(", ").trim();
    if (!query) {
      return NextResponse.json(
        { error: "Please enter your postcode or full delivery address." },
        { status: 400 }
      );
    }

    const shop = await getShopCoordinates();
    const location = await resolveDeliveryLocation(query);

    if (!location) {
      return NextResponse.json(
        {
          error:
            "We couldn't find that address. Try a UK postcode (e.g. SP4 7AB) or include postcode in your address.",
        },
        { status: 400 }
      );
    }

    const { miles, method } = await drivingDistanceMiles(
      shop.lat,
      shop.lng,
      location.lat,
      location.lng
    );

    const result = calculateDeliveryFee(
      miles,
      shop.deliveryTiers,
      shop.maxDeliveryMiles
    );

    const roundedMiles = Math.round(miles * 10) / 10;
    const methodNote = method === "driving" ? "road" : "straight-line";

    return NextResponse.json({
      miles: roundedMiles,
      fee: result.fee,
      available: result.available,
      message: result.available
        ? `${result.message} (${methodNote} distance)`
        : result.message,
      postcode: location.postcode,
      resolvedAddress: location.admin_district || location.parish || undefined,
      shopPostcode: shop.postcode,
    });
  } catch (e) {
    console.error("Delivery quote error:", e);
    return NextResponse.json({ error: "Failed to calculate delivery" }, { status: 500 });
  }
}
