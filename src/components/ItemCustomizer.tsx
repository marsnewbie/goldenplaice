"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { CartLineModifier, MenuItem, MenuModifier } from "@/types";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";

interface Props {
  item: MenuItem;
  onClose: () => void;
}

export function ItemCustomizer({ item, onClose }: Props) {
  const addItem = useCart((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = {};
    item.modifiers?.forEach((m) => {
      init[m.id] = [];
    });
    return init;
  });
  const [error, setError] = useState("");

  const toggleMulti = (modifierId: string, optionId: string) => {
    setSelections((prev) => {
      const current = prev[modifierId] || [];
      const next = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      return { ...prev, [modifierId]: next };
    });
  };

  const selectSingle = (modifierId: string, optionId: string) => {
    setSelections((prev) => ({ ...prev, [modifierId]: [optionId] }));
  };

  const validate = (): boolean => {
    for (const mod of item.modifiers || []) {
      if (mod.required && (!selections[mod.id] || selections[mod.id].length === 0)) {
        setError(`Please select ${mod.name.toLowerCase()}`);
        return false;
      }
    }
    setError("");
    return true;
  };

  const buildModifiers = (): CartLineModifier[] => {
    return (item.modifiers || []).map((mod) => {
      const optionIds = selections[mod.id] || [];
      const optionLabels = mod.options
        .filter((o) => optionIds.includes(o.id))
        .map((o) => o.label);
      return {
        modifierId: mod.id,
        modifierName: mod.name,
        optionIds,
        optionLabels,
      };
    });
  };

  const handleAdd = () => {
    if (!validate()) return;
    addItem(item, quantity, buildModifiers());
    onClose();
    document.dispatchEvent(new CustomEvent("open-cart"));
  };

  const renderModifier = (mod: MenuModifier) => (
    <div key={mod.id} className="mb-5">
      <p className="label">
        {mod.name}
        {mod.required && <span className="text-brand-orange"> *</span>}
      </p>
      <div className="space-y-2">
        {mod.options.map((opt) => {
          const selected = (selections[mod.id] || []).includes(opt.id);
          if (mod.type === "multi") {
            return (
              <label
                key={opt.id}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                  selected
                    ? "border-brand-blue bg-brand-blue/20"
                    : "border-white/10 hover:border-white/30"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggleMulti(mod.id, opt.id)}
                  className="h-4 w-4 accent-brand-orange"
                />
                <span>{opt.label}</span>
              </label>
            );
          }
          return (
            <label
              key={opt.id}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                selected
                  ? "border-brand-blue bg-brand-blue/20"
                  : "border-white/10 hover:border-white/30"
              }`}
            >
              <input
                type="radio"
                name={mod.id}
                checked={selected}
                onChange={() => selectSingle(mod.id, opt.id)}
                className="h-4 w-4 accent-brand-orange"
              />
              <span>{opt.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-brand-dark p-6 sm:rounded-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">{item.name}</h2>
            <p className="text-brand-orange">{formatPrice(item.price)}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        {item.modifiers?.map(renderModifier)}

        {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

        <div className="mb-4 flex items-center gap-4">
          <span className="label mb-0">Quantity</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="rounded-lg bg-white/10 px-3 py-1 font-bold"
            >
              −
            </button>
            <span className="w-8 text-center text-lg font-bold">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="rounded-lg bg-white/10 px-3 py-1 font-bold"
            >
              +
            </button>
          </div>
        </div>

        <button type="button" onClick={handleAdd} className="btn-primary w-full">
          Add {quantity} to basket — {formatPrice(item.price * quantity)}
        </button>
      </div>
    </div>
  );
}
