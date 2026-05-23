"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  CartLine,
  CartLineModifier,
  DeliveryQuote,
  FulfillmentType,
  MenuItem,
} from "@/types";

interface CartState {
  lines: CartLine[];
  fulfillment: FulfillmentType;
  deliveryPostcode: string;
  deliveryAddress: string;
  deliveryQuote: DeliveryQuote | null;
  notes: string;
  addItem: (
    item: MenuItem,
    quantity: number,
    modifiers: CartLineModifier[],
    unitPrice?: number
  ) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeLine: (lineId: string) => void;
  setFulfillment: (type: FulfillmentType) => void;
  setDeliveryPostcode: (postcode: string) => void;
  setDeliveryAddress: (address: string) => void;
  setDeliveryQuote: (quote: DeliveryQuote | null) => void;
  setNotes: (notes: string) => void;
  clearCart: () => void;
  subtotal: () => number;
  deliveryFee: () => number;
  total: () => number;
  itemCount: () => number;
}

function calcLineTotal(
  basePrice: number,
  quantity: number,
  modifiers: CartLineModifier[],
  unitPrice?: number
) {
  const perUnit =
    unitPrice ??
    basePrice + modifiers.reduce((sum, m) => sum + (m.extraPrice ?? 0), 0);
  return perUnit * quantity;
}

function lineId() {
  return `line_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      fulfillment: "collection",
      deliveryPostcode: "",
      deliveryAddress: "",
      deliveryQuote: null,
      notes: "",

      addItem: (item, quantity, modifiers, unitPrice) => {
        const perUnit =
          unitPrice ??
          item.price + modifiers.reduce((s, m) => s + (m.extraPrice ?? 0), 0);
        const lineTotal = calcLineTotal(item.price, quantity, modifiers, perUnit);
        const line: CartLine = {
          id: lineId(),
          itemId: item.id,
          name: item.name,
          price: perUnit,
          quantity,
          modifiers,
          lineTotal,
        };
        set((s) => ({ lines: [...s.lines, line] }));
      },

      updateQuantity: (lineId, quantity) => {
        if (quantity < 1) {
          get().removeLine(lineId);
          return;
        }
        set((s) => ({
          lines: s.lines.map((l) =>
            l.id === lineId
              ? {
                  ...l,
                  quantity,
                  lineTotal: calcLineTotal(l.price, quantity, l.modifiers, l.price),
                }
              : l
          ),
        }));
      },

      removeLine: (lineId) => {
        set((s) => ({ lines: s.lines.filter((l) => l.id !== lineId) }));
      },

      setFulfillment: (type) => set({ fulfillment: type, deliveryQuote: type === "collection" ? null : get().deliveryQuote }),
      setDeliveryPostcode: (postcode) => set({ deliveryPostcode: postcode }),
      setDeliveryAddress: (address) => set({ deliveryAddress: address }),
      setDeliveryQuote: (quote) => set({ deliveryQuote: quote }),
      setNotes: (notes) => set({ notes }),

      clearCart: () =>
        set({
          lines: [],
          deliveryQuote: null,
          deliveryPostcode: "",
          deliveryAddress: "",
          notes: "",
        }),

      subtotal: () => get().lines.reduce((s, l) => s + l.lineTotal, 0),
      deliveryFee: () => {
        if (get().fulfillment !== "delivery") return 0;
        return get().deliveryQuote?.available ? get().deliveryQuote!.fee : 0;
      },
      total: () => get().subtotal() + get().deliveryFee(),
      itemCount: () => get().lines.reduce((s, l) => s + l.quantity, 0),
    }),
    { name: "golden-plaice-cart" }
  )
);
