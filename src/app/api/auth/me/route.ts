import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/auth";

export async function GET() {
  const user = await getCustomerSession();
  return NextResponse.json({ user });
}
