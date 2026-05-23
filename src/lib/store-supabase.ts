import {
  defaultCategories,
  defaultItems,
  defaultModifierGroups,
  defaultSettings,
} from "@/data/seed";
import {
  getSupabaseAdmin,
  isSupabaseConfigured,
  rowToStoreData,
  type AppStoreRow,
} from "@/lib/supabase/server";
import type { CustomerAccount, Order, StoreData } from "@/types";

function defaultStore(): StoreData {
  return {
    settings: defaultSettings,
    categories: defaultCategories,
    items: defaultItems,
    modifierGroups: defaultModifierGroups,
    orders: [],
  };
}

export async function readStoreFromSupabase(): Promise<StoreData> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("app_store")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    const seed = defaultStore();
    await writeStoreToSupabase(seed);
    return seed;
  }

  const row = data as AppStoreRow;
  const hasMenu =
    row.categories?.length > 0 &&
    row.items?.length > 0 &&
    row.modifier_groups?.length > 0;

  if (!hasMenu) {
    const seed = defaultStore();
    await writeStoreToSupabase({
      ...seed,
      settings: { ...defaultSettings, ...(row.settings || {}) },
    });
    return seed;
  }

  return {
    ...rowToStoreData(row),
    settings: { ...defaultSettings, ...row.settings },
  };
}

export async function writeStoreToSupabase(store: StoreData): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("app_store").upsert({
    id: 1,
    settings: store.settings,
    categories: store.categories,
    items: store.items,
    modifier_groups: store.modifierGroups,
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
}

export async function addOrderToSupabase(order: Order): Promise<Order> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("orders").insert({
    id: order.id,
    created_at: order.createdAt,
    status: order.status,
    fulfillment: order.fulfillment,
    payment_method: order.paymentMethod,
    payment_status: order.paymentStatus,
    customer: order.customer,
    delivery_address: order.deliveryAddress ?? null,
    delivery_postcode: order.deliveryPostcode ?? null,
    delivery_miles: order.deliveryMiles ?? null,
    delivery_fee: order.deliveryFee ?? null,
    items: order.items,
    subtotal: order.subtotal,
    delivery_fee_amount: order.deliveryFeeAmount,
    total: order.total,
    notes: order.notes ?? null,
  });

  if (error) throw error;
  return order;
}

export async function getOrdersFromSupabase(): Promise<Order[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    status: row.status,
    fulfillment: row.fulfillment,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    customer: row.customer,
    deliveryAddress: row.delivery_address ?? undefined,
    deliveryPostcode: row.delivery_postcode ?? undefined,
    deliveryMiles: row.delivery_miles ? Number(row.delivery_miles) : undefined,
    deliveryFee: row.delivery_fee ? Number(row.delivery_fee) : undefined,
    items: row.items,
    subtotal: Number(row.subtotal),
    deliveryFeeAmount: Number(row.delivery_fee_amount),
    total: Number(row.total),
    notes: row.notes ?? undefined,
  }));
}

export async function updateOrderStatusInSupabase(
  id: string,
  status: Order["status"]
): Promise<Order | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) return null;

  const orders = await getOrdersFromSupabase();
  return orders.find((o) => o.id === id) ?? null;
}

export async function findCustomerInSupabase(
  email: string
): Promise<CustomerAccount | undefined> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("customers")
    .select("*")
    .ilike("email", email)
    .maybeSingle();

  if (!data) return undefined;
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    phone: data.phone ?? "",
    passwordHash: data.password_hash,
    createdAt: data.created_at,
  };
}

export async function createCustomerInSupabase(
  customer: CustomerAccount
): Promise<CustomerAccount> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("customers").insert({
    id: customer.id,
    email: customer.email,
    name: customer.name,
    phone: customer.phone,
    password_hash: customer.passwordHash,
    created_at: customer.createdAt,
  });
  if (error) throw error;
  return customer;
}

export { isSupabaseConfigured };
