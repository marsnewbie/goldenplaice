"use client";

import { useEffect, useState } from "react";
import { Loader2, Lock, LogOut, Plus, Save, Trash2 } from "lucide-react";
import type { MenuCategory, MenuItem, Order, ShopSettings } from "@/types";
import { formatPrice } from "@/lib/utils";

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState<"orders" | "menu" | "settings">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const checkAuth = () => {
    fetch("/api/admin/check")
      .then((r) => r.json())
      .then((d) => setAuthed(d.authenticated))
      .catch(() => setAuthed(false));
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const loadData = () => {
    Promise.all([
      fetch("/api/admin/orders").then((r) => r.json()),
      fetch("/api/admin/menu").then((r) => r.json()),
      fetch("/api/admin/settings").then((r) => r.json()),
    ]).then(([o, m, s]) => {
      setOrders(o.orders || []);
      setCategories(m.categories || []);
      setItems(m.items || []);
      setSettings(s.settings || null);
    });
  };

  useEffect(() => {
    if (authed) loadData();
  }, [authed]);

  const login = async () => {
    setLoginError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setLoginError("Invalid password");
      return;
    }
    setAuthed(true);
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
  };

  const saveMenu = async () => {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/admin/menu", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categories, items }),
    });
    setSaving(false);
    setMessage(res.ok ? "Menu saved" : "Failed to save menu");
  };

  const saveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings }),
    });
    setSaving(false);
    setMessage(res.ok ? "Settings saved" : "Failed to save settings");
  };

  const updateOrderStatus = async (id: string, status: Order["status"]) => {
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadData();
  };

  const addMenuItem = () => {
    const catId = categories[0]?.id || "fish";
    setItems([
      ...items,
      {
        id: `item_${Date.now()}`,
        categoryId: catId,
        name: "New item",
        price: 0,
        available: true,
      },
    ]);
  };

  if (authed === null) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-sm px-4 py-20">
        <div className="card text-center">
          <Lock className="mx-auto h-10 w-10 text-brand-orange" />
          <h1 className="mt-4 font-display text-2xl font-bold">Admin</h1>
          <p className="mt-2 text-sm text-white/50">Staff access only</p>
          <input
            type="password"
            className="input mt-6"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
          />
          {loginError && <p className="mt-2 text-sm text-red-400">{loginError}</p>}
          <button type="button" onClick={login} className="btn-primary mt-4 w-full">
            Sign in
          </button>
          <p className="mt-4 text-xs text-white/30">
            Default password is set via ADMIN_PASSWORD env variable
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Admin Panel</h1>
        <button type="button" onClick={logout} className="btn-ghost text-sm">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>

      {message && (
        <p className="mb-4 rounded-lg bg-brand-blue/20 px-4 py-2 text-sm text-brand-light">
          {message}
        </p>
      )}

      <div className="mb-6 flex gap-2 overflow-x-auto">
        {(["orders", "menu", "settings"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium capitalize ${
              tab === t ? "bg-brand-orange text-brand-navy" : "bg-white/10"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "orders" && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <p className="text-white/50">No orders yet</p>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="card">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-sm text-brand-light">{order.id}</p>
                    <p className="font-semibold">{order.customer.name}</p>
                    <p className="text-sm text-white/50">
                      {order.fulfillment} · {order.paymentMethod} · {formatPrice(order.total)}
                    </p>
                    <p className="text-xs text-white/40">
                      {new Date(order.createdAt).toLocaleString("en-GB")}
                    </p>
                  </div>
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value as Order["status"])}
                    className="input w-auto py-2 text-sm"
                  >
                    {["pending", "confirmed", "preparing", "ready", "completed", "cancelled"].map(
                      (s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <ul className="mt-3 text-sm text-white/60">
                  {order.items.map((l) => (
                    <li key={l.id}>
                      {l.quantity}× {l.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "menu" && (
        <div>
          <div className="mb-4 flex gap-2">
            <button type="button" onClick={addMenuItem} className="btn-secondary text-sm">
              <Plus className="h-4 w-4" />
              Add item
            </button>
            <button type="button" onClick={saveMenu} disabled={saving} className="btn-primary text-sm">
              <Save className="h-4 w-4" />
              Save menu
            </button>
          </div>
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={item.id} className="card grid gap-3 sm:grid-cols-6">
                <input
                  className="input sm:col-span-2"
                  value={item.name}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx] = { ...item, name: e.target.value };
                    setItems(next);
                  }}
                />
                <select
                  className="input"
                  value={item.categoryId}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx] = { ...item, categoryId: e.target.value };
                    setItems(next);
                  }}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  step="0.1"
                  className="input"
                  value={item.price}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx] = { ...item, price: parseFloat(e.target.value) || 0 };
                    setItems(next);
                  }}
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={item.available}
                    onChange={(e) => {
                      const next = [...items];
                      next[idx] = { ...item, available: e.target.checked };
                      setItems(next);
                    }}
                  />
                  Available
                </label>
                <button
                  type="button"
                  onClick={() => setItems(items.filter((_, i) => i !== idx))}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "settings" && settings && (
        <div className="card space-y-4">
          <div>
            <label className="label">Shop name</label>
            <input
              className="input"
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Phone</label>
              <input
                className="input"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">Address</label>
            <input
              className="input"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Postcode</label>
              <input
                className="input"
                value={settings.postcode}
                onChange={(e) => setSettings({ ...settings, postcode: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Max delivery miles</label>
              <input
                type="number"
                className="input"
                value={settings.maxDeliveryMiles}
                onChange={(e) =>
                  setSettings({ ...settings, maxDeliveryMiles: parseFloat(e.target.value) })
                }
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Tier 1 — max miles</label>
              <input
                type="number"
                className="input"
                value={settings.deliveryTiers[0]?.maxMiles ?? 1}
                onChange={(e) => {
                  const tiers = [...settings.deliveryTiers];
                  tiers[0] = { ...tiers[0], maxMiles: parseFloat(e.target.value) };
                  setSettings({ ...settings, deliveryTiers: tiers });
                }}
              />
            </div>
            <div>
              <label className="label">Tier 1 — fee (£)</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={settings.deliveryTiers[0]?.fee ?? 1}
                onChange={(e) => {
                  const tiers = [...settings.deliveryTiers];
                  tiers[0] = { ...tiers[0], fee: parseFloat(e.target.value) };
                  setSettings({ ...settings, deliveryTiers: tiers });
                }}
              />
            </div>
            <div>
              <label className="label">Tier 2 — max miles</label>
              <input
                type="number"
                className="input"
                value={settings.deliveryTiers[1]?.maxMiles ?? 3}
                onChange={(e) => {
                  const tiers = [...settings.deliveryTiers];
                  tiers[1] = { ...tiers[1], maxMiles: parseFloat(e.target.value) };
                  setSettings({ ...settings, deliveryTiers: tiers });
                }}
              />
            </div>
            <div>
              <label className="label">Tier 2 — fee (£)</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={settings.deliveryTiers[1]?.fee ?? 2}
                onChange={(e) => {
                  const tiers = [...settings.deliveryTiers];
                  tiers[1] = { ...tiers[1], fee: parseFloat(e.target.value) };
                  setSettings({ ...settings, deliveryTiers: tiers });
                }}
              />
            </div>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.cardPaymentsEnabled}
              onChange={(e) =>
                setSettings({ ...settings, cardPaymentsEnabled: e.target.checked })
              }
            />
            Card payments enabled
          </label>
          <button type="button" onClick={saveSettings} disabled={saving} className="btn-primary">
            <Save className="h-4 w-4" />
            Save settings
          </button>
        </div>
      )}
    </div>
  );
}
