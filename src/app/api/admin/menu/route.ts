import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getCategories, getMenuItems, saveMenu } from "@/lib/store";
import type { MenuCategory, MenuItem, ModifierGroup } from "@/types";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { getModifierGroups } = await import("@/lib/store");
  const [categories, items, modifierGroups] = await Promise.all([
    getCategories(),
    getMenuItems(),
    getModifierGroups(),
  ]);
  return NextResponse.json({ categories, items, modifierGroups });
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { categories, items, modifierGroups } = (await request.json()) as {
    categories: MenuCategory[];
    items: MenuItem[];
    modifierGroups: ModifierGroup[];
  };

  await saveMenu(categories, items, modifierGroups ?? []);
  return NextResponse.json({ ok: true });
}
