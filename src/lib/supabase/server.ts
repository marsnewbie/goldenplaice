import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { StoreData } from "@/types";

let adminClient: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

/** Server-side Supabase client (API routes / server components). */
export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase is not configured");
  }

  if (!adminClient) {
    adminClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return adminClient;
}

export interface AppStoreRow {
  id: number;
  settings: StoreData["settings"];
  categories: StoreData["categories"];
  items: StoreData["items"];
  modifier_groups: StoreData["modifierGroups"];
  updated_at: string;
}

export function rowToStoreData(row: AppStoreRow): StoreData {
  return {
    settings: row.settings,
    categories: row.categories,
    items: row.items,
    modifierGroups: row.modifier_groups,
    orders: [],
  };
}
