import { NextResponse } from "next/server";
import { getSettings } from "@/lib/store";

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json({
    name: settings.name,
    phone: settings.phone,
    cardPaymentsEnabled: settings.cardPaymentsEnabled,
  });
}
