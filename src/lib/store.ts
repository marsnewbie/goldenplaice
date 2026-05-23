import { promises as fs } from "fs";
import path from "path";
import {
  defaultCategories,
  defaultItems,
  defaultModifierGroups,
  defaultSettings,
} from "@/data/seed";
import {
  addOrderToSupabase,
  createCustomerInSupabase,
  findCustomerInSupabase,
  getOrdersFromSupabase,
  isSupabaseConfigured,
  readStoreFromSupabase,
  updateOrderStatusInSupabase,
  writeStoreToSupabase,
} from "@/lib/store-supabase";
import type {
  CustomerAccount,
  MenuCategory,
  MenuItem,
  ModifierGroup,
  Order,
  ShopSettings,
  StoreData,
} from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "store.json");
const CUSTOMERS_FILE = path.join(DATA_DIR, "customers.json");

function defaultStore(): StoreData {
  return {
    settings: defaultSettings,
    categories: defaultCategories,
    items: defaultItems,
    modifierGroups: defaultModifierGroups,
    orders: [],
  };
}

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readStoreFromFile(): Promise<StoreData> {
  try {
    const raw = await fs.readFile(STORE_FILE, "utf-8");
    const parsed = JSON.parse(raw) as StoreData;
    return {
      ...defaultStore(),
      ...parsed,
      settings: { ...defaultSettings, ...parsed.settings },
      categories: parsed.categories?.length ? parsed.categories : defaultCategories,
      items: parsed.items?.length ? parsed.items : defaultItems,
      modifierGroups: parsed.modifierGroups?.length
        ? parsed.modifierGroups
        : defaultModifierGroups,
      orders: parsed.orders ?? [],
    };
  } catch {
    return defaultStore();
  }
}

async function writeStoreToFile(data: StoreData): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(STORE_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function readStore(): Promise<StoreData> {
  if (isSupabaseConfigured()) {
    try {
      return await readStoreFromSupabase();
    } catch (e) {
      console.error("Supabase read failed, falling back to file:", e);
    }
  }
  return readStoreFromFile();
}

async function writeStore(data: StoreData): Promise<void> {
  if (isSupabaseConfigured()) {
    await writeStoreToSupabase(data);
    try {
      await writeStoreToFile(data);
    } catch {
      /* local backup optional */
    }
    return;
  }
  await writeStoreToFile(data);
}

export async function getSettings(): Promise<ShopSettings> {
  const store = await readStore();
  return store.settings;
}

export async function updateSettings(settings: ShopSettings): Promise<ShopSettings> {
  const store = await readStore();
  store.settings = settings;
  await writeStore(store);
  return settings;
}

export async function getCategories(): Promise<MenuCategory[]> {
  const store = await readStore();
  return [...store.categories]
    .filter((c) => c.available !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Admin: all categories including hidden */
export async function getAllCategories(): Promise<MenuCategory[]> {
  const store = await readStore();
  return [...store.categories].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getMenuItems(): Promise<MenuItem[]> {
  const store = await readStore();
  return store.items;
}

export async function getModifierGroups(): Promise<ModifierGroup[]> {
  const store = await readStore();
  return store.modifierGroups;
}

export async function saveMenu(
  categories: MenuCategory[],
  items: MenuItem[],
  modifierGroups: ModifierGroup[]
): Promise<void> {
  const store = await readStore();
  store.categories = categories;
  store.items = items;
  store.modifierGroups = modifierGroups;
  await writeStore(store);
}

export async function addOrder(order: Order): Promise<Order> {
  if (isSupabaseConfigured()) {
    try {
      return await addOrderToSupabase(order);
    } catch (e) {
      console.error("Supabase order insert failed:", e);
      throw e;
    }
  }
  const store = await readStore();
  store.orders.unshift(order);
  await writeStore(store);
  return order;
}

export async function getOrders(): Promise<Order[]> {
  if (isSupabaseConfigured()) {
    try {
      return await getOrdersFromSupabase();
    } catch (e) {
      console.error("Supabase orders read failed:", e);
    }
  }
  const store = await readStore();
  return store.orders;
}

export async function updateOrderStatus(
  id: string,
  status: Order["status"]
): Promise<Order | null> {
  if (isSupabaseConfigured()) {
    try {
      return await updateOrderStatusInSupabase(id, status);
    } catch (e) {
      console.error("Supabase order update failed:", e);
    }
  }
  const store = await readStore();
  const order = store.orders.find((o) => o.id === id);
  if (!order) return null;
  order.status = status;
  await writeStore(store);
  return order;
}

async function readCustomersFromFile(): Promise<CustomerAccount[]> {
  try {
    const raw = await fs.readFile(CUSTOMERS_FILE, "utf-8");
    return JSON.parse(raw) as CustomerAccount[];
  } catch {
    return [];
  }
}

async function writeCustomersToFile(customers: CustomerAccount[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(CUSTOMERS_FILE, JSON.stringify(customers, null, 2), "utf-8");
}

export async function findCustomerByEmail(
  email: string
): Promise<CustomerAccount | undefined> {
  if (isSupabaseConfigured()) {
    try {
      const c = await findCustomerInSupabase(email);
      if (c) return c;
    } catch (e) {
      console.error("Supabase customer lookup failed:", e);
    }
  }
  const customers = await readCustomersFromFile();
  return customers.find((c) => c.email.toLowerCase() === email.toLowerCase());
}

export async function createCustomer(
  customer: CustomerAccount
): Promise<CustomerAccount> {
  if (isSupabaseConfigured()) {
    try {
      return await createCustomerInSupabase(customer);
    } catch (e) {
      console.error("Supabase customer create failed:", e);
      throw e;
    }
  }
  const customers = await readCustomersFromFile();
  customers.push(customer);
  await writeCustomersToFile(customers);
  return customer;
}

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
