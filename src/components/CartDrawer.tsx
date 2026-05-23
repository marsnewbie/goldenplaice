"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const lines = useCart((s) => s.lines);
  const fulfillment = useCart((s) => s.fulfillment);
  const deliveryQuote = useCart((s) => s.deliveryQuote);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const removeLine = useCart((s) => s.removeLine);
  const subtotal = useCart((s) => s.subtotal);
  const deliveryFee = useCart((s) => s.deliveryFee);
  const total = useCart((s) => s.total);

  useEffect(() => {
    const handler = () => setOpen(true);
    document.addEventListener("open-cart", handler);
    return () => document.removeEventListener("open-cart", handler);
  }, []);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <aside className="fixed bottom-0 right-0 top-0 z-[70] flex w-full max-w-md flex-col bg-brand-dark shadow-2xl sm:rounded-l-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold">
            <ShoppingBag className="h-5 w-5 text-brand-orange" />
            Your basket
          </h2>
          <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {lines.length === 0 ? (
            <p className="py-12 text-center text-white/50">Your basket is empty</p>
          ) : (
            <ul className="space-y-4">
              {lines.map((line) => (
                <li key={line.id} className="rounded-xl border border-white/10 bg-brand-navy/50 p-4">
                  <div className="flex justify-between gap-2">
                    <div>
                      <p className="font-semibold">{line.name}</p>
                      {line.modifiers.length > 0 && (
                        <ul className="mt-1 text-xs text-white/50">
                          {line.modifiers.map((m) => (
                            <li key={m.modifierId}>
                              {m.modifierName}: {m.optionLabels.join(", ")}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <p className="font-semibold text-brand-orange">{formatPrice(line.lineTotal)}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(line.id, line.quantity - 1)}
                        className="rounded-lg bg-white/10 p-1.5 hover:bg-white/20"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-6 text-center font-medium">{line.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(line.id, line.quantity + 1)}
                        className="rounded-lg bg-white/10 p-1.5 hover:bg-white/20"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLine(line.id)}
                      className="text-white/40 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-white/10 px-5 py-4">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Subtotal</span>
                <span>{formatPrice(subtotal())}</span>
              </div>
              {fulfillment === "delivery" && deliveryQuote?.available && (
                <div className="flex justify-between">
                  <span className="text-white/60">Delivery</span>
                  <span>{formatPrice(deliveryFee())}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-brand-orange">{formatPrice(total())}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              onClick={() => setOpen(false)}
              className="btn-primary mt-4 w-full"
            >
              Checkout
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
