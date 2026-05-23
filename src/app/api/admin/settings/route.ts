import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getSettings, updateSettings } from "@/lib/store";
import type { ShopSettings } from "@/types";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const settings = await getSettings();
  return NextResponse.json({ settings });
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { settings } = (await request.json()) as { settings: ShopSettings };
  await updateSettings(settings);
  const { getShopCoordinates } = await import("@/lib/shop-location");
  await getShopCoordinates();
  const updated = await getSettings();
  revalidatePath("/");
  revalidatePath("/order");
  revalidatePath("/contact");
  return NextResponse.json({ ok: true, settings: updated });
}
