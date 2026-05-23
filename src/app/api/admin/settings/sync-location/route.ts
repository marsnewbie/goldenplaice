import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getShopCoordinates } from "@/lib/shop-location";
import { getSettings } from "@/lib/store";

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await getShopCoordinates();
    const settings = await getSettings();
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json(
      { error: "Could not resolve postcode. Check shop postcode is valid." },
      { status: 400 }
    );
  }
}
