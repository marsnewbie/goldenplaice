import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { CustomerAccount } from "@/types";

const ADMIN_COOKIE = "gp_admin_session";
const CUSTOMER_COOKIE = "gp_customer_session";

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || "golden-plaice-dev-secret-change-in-production";
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createAdminToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("12h")
    .sign(getSecret());
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function createCustomerToken(customer: CustomerAccount): Promise<string> {
  return new SignJWT({
    role: "customer",
    id: customer.id,
    email: customer.email,
    name: customer.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(getSecret());
}

export async function verifyCustomerToken(
  token: string
): Promise<{ id: string; email: string; name: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.role !== "customer") return null;
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return verifyAdminToken(token);
}

export async function getCustomerSession(): Promise<{
  id: string;
  email: string;
  name: string;
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;
  return verifyCustomerToken(token);
}

export { ADMIN_COOKIE, CUSTOMER_COOKIE };

export function checkAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || "goldenplaice2026";
  return password === expected;
}
