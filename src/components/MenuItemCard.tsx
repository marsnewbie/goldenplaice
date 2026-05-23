"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import type { MenuItem } from "@/types";
import { formatPrice } from "@/lib/utils";
import { ItemCustomizer } from "./ItemCustomizer";

interface Props {
  item: MenuItem;
}

export function MenuItemCard({ item }: Props) {
  const [customizing, setCustomizing] = useState(false);

  if (!item.available) {
    return (
      <div className="card opacity-50">
        <p className="font-semibold">{item.name}</p>
        <p className="mt-1 text-sm text-white/40">Currently unavailable</p>
      </div>
    );
  }

  return (
    <>
      <div className="card flex flex-col justify-between transition hover:border-brand-blue/30">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold leading-snug">{item.name}</h3>
            <span className="shrink-0 font-bold text-brand-orange">{formatPrice(item.price)}</span>
          </div>
          {item.description && (
            <p className="mt-2 text-sm text-white/50">{item.description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setCustomizing(true)}
          className="btn-primary mt-4 w-full text-sm"
        >
          <Plus className="h-4 w-4" />
          Add to basket
        </button>
      </div>

      {customizing && (
        <ItemCustomizer item={item} onClose={() => setCustomizing(false)} />
      )}
    </>
  );
}
