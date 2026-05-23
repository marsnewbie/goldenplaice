"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Lock, LogOut, Save } from "lucide-react";
import type { MenuCategory, MenuItem, ModifierGroup, Order, ShopSettings } from "@/types";
import { AdminCategoriesTab } from "@/components/admin/AdminCategoriesTab";
import { AdminOptionGroupsTab } from "@/components/admin/AdminOptionGroupsTab";
import { AdminMenuItemsTab } from "@/components/admin/AdminMenuItemsTab";
import { AdminOrdersTab } from "@/components/admin/AdminOrdersTab";
import { AdminSettingsTab } from "@/components/admin/AdminSettingsTab";

type Tab = "orders" | "categories" | "options" | "items" | "settings";

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>([]);
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const checkAuth = () => {
    fetch("/api/admin/check")
      .then((r) => r.json())
      .then((d) => setAuthed(d.authenticated))
      .catch(() => setAuthed(false));
  };

  const loadData = useCallback(() => {
    Promise.all([
      fetch("/api/admin/orders").then((r) => r.json()),
      fetch("/api/admin/menu").then((r) => r.json()),
      fetch("/api/admin/settings").then((r) => r.json()),
    ]).then(([o, m, s]) => {
      setOrders(o.orders || []);
      setCategories(m.categories || []);
      setItems(m.items || []);
      setModifierGroups(m.modifierGroups || []);
      setSettings(s.settings || null);
    });
  }, []);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (authed) loadData();
  }, [authed, loadData]);

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
      body: JSON.stringify({ categories, items, modifierGroups }),
    });
    setSaving(false);
    setMessage(res.ok ? "Menu saved successfully" : "Failed to save menu");
    if (res.ok) loadData();
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
    if (res.ok) {
      setMessage("Settings saved — shop coordinates synced from postcode");
      loadData();
    } else {
      setMessage("Failed to save settings");
    }
  };

  const syncLocation = async () => {
    const res = await fetch("/api/admin/settings/sync-location", { method: "POST" });
    const data = await res.json();
    if (res.ok && data.settings) {
      setSettings(data.settings);
      setMessage(`Coordinates updated: ${data.settings.lat}, ${data.settings.lng}`);
    } else {
      setMessage(data.error || "Could not sync location");
    }
  };

  const updateOrderStatus = async (id: string, status: Order["status"]) => {
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadData();
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
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "orders", label: "Orders" },
    { id: "categories", label: "Categories" },
    { id: "options", label: "Option groups" },
    { id: "items", label: "Menu items" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">Admin Panel</h1>
        <div className="flex gap-2">
          {tab !== "orders" && tab !== "settings" && (
            <button
              type="button"
              onClick={saveMenu}
              disabled={saving}
              className="btn-primary text-sm"
            >
              <Save className="h-4 w-4" />
              Save menu
            </button>
          )}
          <button type="button" onClick={logout} className="btn-ghost text-sm">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      {message && (
        <p className="mb-4 rounded-lg bg-brand-blue/20 px-4 py-2 text-sm text-brand-light">
          {message}
        </p>
      )}

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium ${
              tab === t.id ? "bg-brand-orange text-brand-navy" : "bg-white/10"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "orders" && <AdminOrdersTab orders={orders} onStatusChange={updateOrderStatus} />}
      {tab === "categories" && (
        <AdminCategoriesTab categories={categories} onChange={setCategories} />
      )}
      {tab === "options" && (
        <AdminOptionGroupsTab groups={modifierGroups} onChange={setModifierGroups} />
      )}
      {tab === "items" && (
        <AdminMenuItemsTab
          items={items}
          categories={categories}
          modifierGroups={modifierGroups}
          onChange={setItems}
        />
      )}
      {tab === "settings" && settings && (
        <AdminSettingsTab
          settings={settings}
          onChange={setSettings}
          onSave={saveSettings}
          onSyncLocation={syncLocation}
          saving={saving}
        />
      )}
    </div>
  );
}
