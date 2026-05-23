"use client";

import { Plus, Trash2 } from "lucide-react";
import type { MenuCategory, MenuItem, ModifierGroup } from "@/types";

interface Props {
  items: MenuItem[];
  categories: MenuCategory[];
  modifierGroups: ModifierGroup[];
  onChange: (items: MenuItem[]) => void;
}

export function AdminMenuItemsTab({
  items,
  categories,
  modifierGroups,
  onChange,
}: Props) {
  const addItem = () => {
    const catId = categories.find((c) => c.available !== false)?.id || categories[0]?.id || "fish";
    onChange([
      ...items,
      {
        id: `item_${Date.now()}`,
        categoryId: catId,
        name: "New item",
        price: 0,
        available: true,
        modifierGroupIds: [],
      },
    ]);
  };

  const update = (idx: number, patch: Partial<MenuItem>) => {
    const next = [...items];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };

  const toggleGroup = (idx: number, groupId: string) => {
    const item = items[idx];
    const current = item.modifierGroupIds || [];
    const next = current.includes(groupId)
      ? current.filter((id) => id !== groupId)
      : [...current, groupId];
    update(idx, { modifierGroupIds: next });
  };

  const sortedCategories = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <p className="text-sm text-white/50">
          Edit dishes and link option groups. Customers see linked groups when ordering.
        </p>
        <button type="button" onClick={addItem} className="btn-secondary text-sm">
          <Plus className="h-4 w-4" />
          Add item
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={item.id} className="card space-y-4">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <div className="lg:col-span-2">
                <label className="label">Item name</label>
                <input
                  className="input"
                  value={item.name}
                  onChange={(e) => update(idx, { name: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Category</label>
                <select
                  className="input"
                  value={item.categoryId}
                  onChange={(e) => update(idx, { categoryId: e.target.value })}
                >
                  {sortedCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Price (£)</label>
                <input
                  type="number"
                  step="0.1"
                  className="input"
                  value={item.price}
                  onChange={(e) => update(idx, { price: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div>
              <label className="label">Description (optional)</label>
              <input
                className="input"
                value={item.description || ""}
                onChange={(e) => update(idx, { description: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Linked option groups</label>
              <div className="flex flex-wrap gap-2">
                {modifierGroups.length === 0 ? (
                  <span className="text-sm text-white/40">Create groups in Option Groups tab</span>
                ) : (
                  modifierGroups.map((g) => {
                    const linked = (item.modifierGroupIds || []).includes(g.id);
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => toggleGroup(idx, g.id)}
                        className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                          linked
                            ? "border-brand-orange bg-brand-orange/20 text-brand-orange"
                            : "border-white/20 hover:border-white/40"
                        }`}
                      >
                        {g.name}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={item.available}
                  onChange={(e) => update(idx, { available: e.target.checked })}
                />
                Available on menu
              </label>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, i) => i !== idx))}
                className="flex items-center gap-1 text-sm text-red-400"
              >
                <Trash2 className="h-4 w-4" />
                Delete item
              </button>
            </div>
            <p className="text-xs text-white/30">ID: {item.id}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
