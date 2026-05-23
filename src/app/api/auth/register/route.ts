import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createCustomerToken,
  CUSTOMER_COOKIE,
  hashPassword,
} from "@/lib/auth";
import { createCustomer, findCustomerByEmail, generateId } from "@/lib/store";

export async function POST(request: Request) {
  const { name, email, phone, password } = await request.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email and password required" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const existing = await findCustomerByEmail(email);
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const customer = await createCustomer({
    id: generateId("usr"),
    name,
    email,
    phone: phone || "",
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  });

  const token = await createCustomerToken(customer);
  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return NextResponse.json({ user: { id: customer.id, name, email } });
}
