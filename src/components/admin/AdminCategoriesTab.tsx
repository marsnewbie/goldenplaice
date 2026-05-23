"use client";

import { Plus, Trash2 } from "lucide-react";
import type { MenuCategory } from "@/types";

interface Props {
  categories: MenuCategory[];
  onChange: (categories: MenuCategory[]) => void;
}

export function AdminCategoriesTab({ categories, onChange }: Props) {
  const addCategory = () => {
    const maxOrder = categories.reduce((m, c) => Math.max(m, c.sortOrder), 0);
    onChange([
      ...categories,
      {
        id: `cat_${Date.now()}`,
        name: "New category",
        sortOrder: maxOrder + 1,
        available: true,
      },
    ]);
  };

  const update = (idx: number, patch: Partial<MenuCategory>) => {
    const next = [...categories];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };

  const remove = (idx: number) => {
    if (!confirm("Delete this category? Items in it will need reassigning.")) return;
    onChange(categories.filter((_, i) => i !== idx));
  };

  const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-white/50">
          Manage menu sections (Fish, Burgers, etc.). Sort order controls display sequence.
        </p>
        <button type="button" onClick={addCategory} className="btn-secondary text-sm">
          <Plus className="h-4 w-4" />
          Add category
        </button>
      </div>
      <div className="space-y-3">
        {sorted.map((cat) => {
          const idx = categories.findIndex((c) => c.id === cat.id);
          return (
            <div key={cat.id} className="card grid gap-3 md:grid-cols-12">
              <div className="md:col-span-3">
                <label className="label">Name</label>
                <input
                  className="input"
                  value={cat.name}
                  onChange={(e) => update(idx, { name: e.target.value })}
                />
              </div>
              <div className="md:col-span-4">
                <label className="label">Description (optional)</label>
                <input
                  className="input"
                  value={cat.description || ""}
                  onChange={(e) => update(idx, { description: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">Sort order</label>
                <input
                  type="number"
                  className="input"
                  value={cat.sortOrder}
                  onChange={(e) => update(idx, { sortOrder: parseInt(e.target.value, 10) || 0 })}
                />
              </div>
              <div className="flex items-end gap-4 md:col-span-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={cat.available !== false}
                    onChange={(e) => update(idx, { available: e.target.checked })}
                  />
                  Visible
                </label>
              </div>
              <div className="flex items-end md:col-span-1">
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="rounded-lg p-2 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-white/30 md:col-span-12">ID: {cat.id}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
