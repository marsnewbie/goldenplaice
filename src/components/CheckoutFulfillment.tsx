"use client";

import { MapPin, Store } from "lucide-react";
import { useCart } from "@/store/cart";
import { PostcodeLookup } from "@/components/PostcodeLookup";
import type { DeliveryQuote } from "@/types";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export function CheckoutFulfillment() {
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
    const query = [deliveryAddress, deliveryPostcode].filter(Boolean).join(", ").trim();
    if (!query) {
      setQuoteError("Enter postcode or address");
      return;
    }
    setLoading(true);
    setQuoteError("");
    try {
      const res = await fetch("/api/delivery/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postcode: deliveryPostcode, address: query }),
      });
      const data = (await res.json()) as DeliveryQuote & { error?: string };
      if (!res.ok) {
        setQuoteError(data.error || "Could not check delivery");
        setDeliveryQuote(null);
        return;
      }
      if (data.postcode && data.postcode !== "—") setDeliveryPostcode(data.postcode);
      setDeliveryQuote(data);
      if (!data.available) setQuoteError(data.message);
      else setQuoteError("");
    } catch {
      setQuoteError("Delivery check failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mb-6">
      <h2 className="mb-4 font-semibold text-brand-light">Collection or delivery</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => {
            setFulfillment("collection");
            setQuoteError("");
          }}
          className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left ${
            fulfillment === "collection"
              ? "border-brand-orange bg-brand-orange/10"
              : "border-white/10"
          }`}
        >
          <Store className="h-5 w-5 text-brand-orange" />
          <span className="font-semibold">Collection</span>
        </button>
        <button
          type="button"
          onClick={() => setFulfillment("delivery")}
          className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left ${
            fulfillment === "delivery"
              ? "border-brand-orange bg-brand-orange/10"
              : "border-white/10"
          }`}
        >
          <MapPin className="h-5 w-5 text-brand-orange" />
          <span className="font-semibold">Delivery</span>
        </button>
      </div>

      {fulfillment === "delivery" && (
        <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
          <input
            className="input"
            placeholder="Street address"
            value={deliveryAddress}
            onChange={(e) => {
              setDeliveryAddress(e.target.value);
              setDeliveryQuote(null);
            }}
          />
          <PostcodeLookup
            value={deliveryPostcode}
            onChange={(v) => {
              setDeliveryPostcode(v);
              setDeliveryQuote(null);
            }}
          />
          <button
            type="button"
            onClick={checkDelivery}
            disabled={loading}
            className="btn-secondary w-full text-sm"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify delivery"}
          </button>
          {deliveryQuote?.available && (
            <p className="text-sm text-green-400">{deliveryQuote.message}</p>
          )}
          {quoteError && <p className="text-sm text-red-400">{quoteError}</p>}
        </div>
      )}

      {fulfillment === "collection" && (
        <p className="mt-3 text-sm text-white/50">
          Pick up from 2 Rhodes Moorhouse Way, Longhedge, Salisbury SP4 6SA
        </p>
      )}
    </div>
  );
}

export function useCanPlaceOrder(): { ok: boolean; reason?: string } {
  const fulfillment = useCart((s) => s.fulfillment);
  const deliveryQuote = useCart((s) => s.deliveryQuote);
  const deliveryAddress = useCart((s) => s.deliveryAddress);
  const deliveryPostcode = useCart((s) => s.deliveryPostcode);

  if (fulfillment === "collection") {
    return { ok: true };
  }

  if (!deliveryPostcode.trim() && !deliveryAddress.trim()) {
    return { ok: false, reason: "Enter your delivery address and postcode above" };
  }

  if (!deliveryQuote?.available) {
    return {
      ok: false,
      reason: "Click “Verify delivery” to confirm we deliver to your address",
    };
  }

  return { ok: true };
}
