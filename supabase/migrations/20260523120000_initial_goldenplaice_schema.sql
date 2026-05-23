-- Run via Supabase CLI or Dashboard if setting up a fresh project
-- Golden Plaice schema (also applied via MCP to project nrbwsbdqmynrxeqyrqkb)

CREATE TABLE IF NOT EXISTS app_store (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  settings JSONB NOT NULL DEFAULT '{}',
  categories JSONB NOT NULL DEFAULT '[]',
  items JSONB NOT NULL DEFAULT '[]',
  modifier_groups JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending',
  fulfillment TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  customer JSONB NOT NULL,
  delivery_address TEXT,
  delivery_postcode TEXT,
  delivery_miles NUMERIC,
  delivery_fee NUMERIC,
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  delivery_fee_amount NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO app_store (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
