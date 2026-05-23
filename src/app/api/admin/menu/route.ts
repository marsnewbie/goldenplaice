import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getCategories, getMenuItems, saveMenu } from "@/lib/store";
import type { MenuCategory, MenuItem } from "@/types";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [categories, items] = await Promise.all([getCategories(), getMenuItems()]);
  return NextResponse.json({ categories, items });
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { categories, items } = (await request.json()) as {
    categories: MenuCategory[];
    items: MenuItem[];
  };

  await saveMenu(categories, items);
  return NextResponse.json({ ok: true });
}
