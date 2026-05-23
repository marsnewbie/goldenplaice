"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import type { MenuItem, MenuModifier, ModifierGroup } from "@/types";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import {
  buildCartLineModifiers,
  calculateModifierExtra,
  flattenModifierTree,
  getActiveNestedModifiers,
  resolveItemModifiers,
  validateModifierSelections,
} from "@/lib/menu";

interface Props {
  item: MenuItem;
  modifierGroups: ModifierGroup[];
  onClose: () => void;
}

export function ItemCustomizer({ item, modifierGroups, onClose }: Props) {
  const addItem = useCart((s) => s.addItem);
  const resolvedModifiers = useMemo(
    () => resolveItemModifiers(item, modifierGroups),
    [item, modifierGroups]
  );

  const allModifiers = useMemo(
    () => flattenModifierTree(resolvedModifiers),
    [resolvedModifiers]
  );

  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = {};
    allModifiers.forEach((m) => {
      init[m.id] = [];
    });
    return init;
  });
  const [error, setError] = useState("");

  const nestedModifiers = getActiveNestedModifiers(resolvedModifiers, selections);
  const modifierExtra = calculateModifierExtra(
    [...resolvedModifiers, ...nestedModifiers],
    selections
  );
  const unitPrice = item.price + modifierExtra;
  const lineTotal = unitPrice * quantity;

  const toggleMulti = (modifierId: string, optionId: string, mod: MenuModifier) => {
    setSelections((prev) => {
      const current = prev[modifierId] || [];
      let next: string[];
      if (current.includes(optionId)) {
        next = current.filter((id) => id !== optionId);
      } else {
        const max = mod.maxSelections ?? mod.options.length;
        next =
          mod.type === "multi" && current.length >= max
            ? [...current.slice(1), optionId]
            : [...current, optionId];
      }
      return { ...prev, [modifierId]: next };
    });
  };

  const selectSingle = (modifierId: string, optionId: string) => {
    setSelections((prev) => ({ ...prev, [modifierId]: [optionId] }));
  };

  const renderModifier = (mod: MenuModifier, depth = 0) => (
    <div key={mod.id} className={depth > 0 ? "ml-4 border-l-2 border-brand-blue/30 pl-4" : ""}>
      <p className="label">
        {mod.name}
        {mod.required && <span className="text-brand-orange"> *</span>}
        {mod.type === "multi" && (
          <span className="ml-2 text-xs font-normal text-white/40">
            (choose {mod.minSelections ?? 0}–{mod.maxSelections ?? mod.options.length})
          </span>
        )}
      </p>
      <div className="mb-4 space-y-2">
        {mod.options.map((opt) => {
          const selected = (selections[mod.id] || []).includes(opt.id);
          const priceLabel =
            opt.price && opt.price > 0 ? ` (+${formatPrice(opt.price)})` : "";

          if (mod.type === "multi") {
            return (
              <div key={opt.id}>
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                    selected
                      ? "border-brand-blue bg-brand-blue/20"
                      : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleMulti(mod.id, opt.id, mod)}
                    className="h-4 w-4 accent-brand-orange"
                  />
                  <span>
                    {opt.label}
                    {priceLabel}
                  </span>
                </label>
                {selected && opt.children?.map((child) => renderModifier(child, depth + 1))}
              </div>
            );
          }

          return (
            <div key={opt.id}>
              <label
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
                <span>
                  {opt.label}
                  {priceLabel}
                </span>
              </label>
              {selected && opt.children?.map((child) => renderModifier(child, depth + 1))}
            </div>
          );
        })}
      </div>
    </div>
  );

  const handleAdd = () => {
    const validationError = validateModifierSelections(
      [...resolvedModifiers, ...getActiveNestedModifiers(resolvedModifiers, selections)],
      selections
    );
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    const modifiers = buildCartLineModifiers(
      [...resolvedModifiers, ...getActiveNestedModifiers(resolvedModifiers, selections)],
      selections
    );
    addItem(item, quantity, modifiers, unitPrice);
    onClose();
    document.dispatchEvent(new CustomEvent("open-cart"));
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-brand-dark p-6 sm:rounded-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">{item.name}</h2>
            <p className="text-brand-orange">
              {formatPrice(item.price)}
              {modifierExtra > 0 && (
                <span className="text-sm text-white/50"> + options {formatPrice(modifierExtra)}</span>
              )}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        {resolvedModifiers.map((mod) => renderModifier(mod))}

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
          Add {quantity} to basket — {formatPrice(lineTotal)}
        </button>
      </div>
    </div>
  );
}
