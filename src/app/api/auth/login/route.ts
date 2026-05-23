import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createCustomerToken,
  CUSTOMER_COOKIE,
  verifyPassword,
} from "@/lib/auth";
import { findCustomerByEmail } from "@/lib/store";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const customer = await findCustomerByEmail(email);
  if (!customer || !(await verifyPassword(password, customer.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = await createCustomerToken(customer);
  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return NextResponse.json({
    user: { id: customer.id, name: customer.name, email: customer.email },
  });
}
