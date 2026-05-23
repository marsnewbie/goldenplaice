import { NextResponse } from "next/server";
import { autocompletePostcode } from "@/lib/uk-postcode";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const suggestions = await autocompletePostcode(q);
  return NextResponse.json({ suggestions });
}
