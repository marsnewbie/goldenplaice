import { NextResponse } from "next/server";
import {
  calculateDeliveryFee,
  haversineMiles,
  lookupUkPostcode,
} from "@/lib/distance";
import { getSettings } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const { postcode } = (await request.json()) as { postcode?: string };
    if (!postcode?.trim()) {
      return NextResponse.json({ error: "Postcode is required" }, { status: 400 });
    }

    const settings = await getSettings();
    const location = await lookupUkPostcode(postcode);
    if (!location) {
      return NextResponse.json(
        { error: "Invalid UK postcode. Please check and try again." },
        { status: 400 }
      );
    }

    const miles = haversineMiles(
      settings.lat,
      settings.lng,
      location.lat,
      location.lng
    );

    const result = calculateDeliveryFee(
      miles,
      settings.deliveryTiers,
      settings.maxDeliveryMiles
    );

    return NextResponse.json({
      miles: Math.round(miles * 10) / 10,
      fee: result.fee,
      available: result.available,
      message: result.message,
      postcode: location.postcode,
    });
  } catch {
    return NextResponse.json({ error: "Failed to calculate delivery" }, { status: 500 });
  }
}
