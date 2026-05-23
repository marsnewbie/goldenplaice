"use client";

import { MapPin, Store, Loader2 } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/store/cart";
import type { DeliveryQuote } from "@/types";

export function OrderFulfillmentBar() {
  const fulfillment = useCart((s) => s.fulfillment);
  const setFulfillment = useCart((s) => s.setFulfillment);
  const deliveryPostcode = useCart((s) => s.deliveryPostcode);
  const setDeliveryPostcode = useCart((s) => s.setDeliveryPostcode);
  const deliveryAddress = useCart((s) => s.deliveryAddress);
  const setDeliveryAddress = useCart((s) => s.setDeliveryAddress);
  const deliveryQuote = useCart((s) => s.deliveryQuote);
  const setDeliveryQuote = useCart((s) => s.setDeliveryQuote);

  const [loading, setLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");

  const checkDelivery = async () => {
    if (!deliveryPostcode.trim()) {
      setQuoteError("Please enter your postcode");
      return;
    }
    setLoading(true);
    setQuoteError("");
    try {
      const res = await fetch("/api/delivery/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postcode: deliveryPostcode }),
      });
      const data = (await res.json()) as DeliveryQuote & { error?: string };
      if (!res.ok) {
        setQuoteError(data.error || "Could not check delivery");
        setDeliveryQuote(null);
        return;
      }
      setDeliveryQuote(data);
      if (!data.available) setQuoteError(data.message);
    } catch {
      setQuoteError("Failed to check delivery. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <p className="mb-4 font-semibold text-brand-light">How would you like your order?</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setFulfillment("collection")}
          className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition ${
            fulfillment === "collection"
              ? "border-brand-orange bg-brand-orange/10"
              : "border-white/10 hover:border-white/30"
          }`}
        >
          <Store className="h-6 w-6 text-brand-orange" />
          <div>
            <p className="font-semibold">Collection</p>
            <p className="text-sm text-white/50">Pick up from the shop</p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setFulfillment("delivery")}
          className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition ${
            fulfillment === "delivery"
              ? "border-brand-orange bg-brand-orange/10"
              : "border-white/10 hover:border-white/30"
          }`}
        >
          <MapPin className="h-6 w-6 text-brand-orange" />
          <div>
            <p className="font-semibold">Delivery</p>
            <p className="text-sm text-white/50">£1 (0–1 mi) · £2 (1–3 mi)</p>
          </div>
        </button>
      </div>

      {fulfillment === "delivery" && (
        <div className="mt-5 space-y-3 border-t border-white/10 pt-5">
          <div>
            <label className="label" htmlFor="postcode">
              Delivery postcode
            </label>
            <div className="flex gap-2">
              <input
                id="postcode"
                className="input flex-1 uppercase"
                placeholder="e.g. SP4 7AB"
                value={deliveryPostcode}
                onChange={(e) => {
                  setDeliveryPostcode(e.target.value);
                  setDeliveryQuote(null);
                }}
              />
              <button
                type="button"
                onClick={checkDelivery}
                disabled={loading}
                className="btn-secondary shrink-0 px-4"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check"}
              </button>
            </div>
          </div>
          <div>
            <label className="label" htmlFor="address">
              Full delivery address
            </label>
            <input
              id="address"
              className="input"
              placeholder="House number, street name"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
            />
          </div>
          {deliveryQuote?.available && (
            <p className="rounded-lg bg-green-500/10 px-4 py-2 text-sm text-green-400">
              {deliveryQuote.message}
            </p>
          )}
          {(quoteError || (deliveryQuote && !deliveryQuote.available)) && (
            <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
              {quoteError || deliveryQuote?.message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
