import { promises as fs } from "fs";
import path from "path";
import {
  defaultCategories,
  defaultItems,
  defaultModifierGroups,
  defaultSettings,
} from "@/data/seed";
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

let memoryStore: StoreData | null = null;

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

export async function readStore(): Promise<StoreData> {
  if (memoryStore) return memoryStore;

  try {
    const raw = await fs.readFile(STORE_FILE, "utf-8");
    const parsed = JSON.parse(raw) as StoreData;
    memoryStore = {
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
    return memoryStore;
  } catch {
    memoryStore = defaultStore();
    return memoryStore;
  }
}

export async function writeStore(data: StoreData): Promise<void> {
  memoryStore = data;
  try {
    await ensureDataDir();
    await fs.writeFile(STORE_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // Vercel serverless may not allow writes — memory cache still works per instance
  }
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
  const store = await readStore();
  store.orders.unshift(order);
  await writeStore(store);
  return order;
}

export async function getOrders(): Promise<Order[]> {
  const store = await readStore();
  return store.orders;
}

export async function updateOrderStatus(
  id: string,
  status: Order["status"]
): Promise<Order | null> {
  const store = await readStore();
  const order = store.orders.find((o) => o.id === id);
  if (!order) return null;
  order.status = status;
  await writeStore(store);
  return order;
}

// Customers (local JSON auth for simplicity)
async function readCustomers(): Promise<CustomerAccount[]> {
  try {
    const raw = await fs.readFile(CUSTOMERS_FILE, "utf-8");
    return JSON.parse(raw) as CustomerAccount[];
  } catch {
    return [];
  }
}

async function writeCustomers(customers: CustomerAccount[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(CUSTOMERS_FILE, JSON.stringify(customers, null, 2), "utf-8");
}

export async function findCustomerByEmail(
  email: string
): Promise<CustomerAccount | undefined> {
  const customers = await readCustomers();
  return customers.find((c) => c.email.toLowerCase() === email.toLowerCase());
}

export async function createCustomer(
  customer: CustomerAccount
): Promise<CustomerAccount> {
  const customers = await readCustomers();
  customers.push(customer);
  await writeCustomers(customers);
  return customer;
}

export function formatPrice(amount: number): string {
  return `£${amount.toFixed(2)}`;
}

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
