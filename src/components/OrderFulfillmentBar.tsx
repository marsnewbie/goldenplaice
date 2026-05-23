"use client";

import { MapPin, Store, Loader2, Info } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/store/cart";
import { PostcodeLookup } from "@/components/PostcodeLookup";
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
    const query = [deliveryAddress, deliveryPostcode].filter(Boolean).join(", ").trim();
    if (!query) {
      setQuoteError("Please enter your postcode or full address");
      return;
    }
    setLoading(true);
    setQuoteError("");
    try {
      const res = await fetch("/api/delivery/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postcode: deliveryPostcode,
          address: deliveryAddress || deliveryPostcode,
        }),
      });
      const data = (await res.json()) as DeliveryQuote & { error?: string };
      if (!res.ok) {
        setQuoteError(data.error || "Could not check delivery");
        setDeliveryQuote(null);
        return;
      }
      if (data.postcode && data.postcode !== "—") {
        setDeliveryPostcode(data.postcode);
      }
      setDeliveryQuote(data);
      if (!data.available) {
        setQuoteError(data.message);
      } else {
        setQuoteError("");
      }
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
        <div className="mt-5 space-y-4 border-t border-white/10 pt-5">
          <div className="flex gap-2 rounded-lg bg-brand-blue/10 px-3 py-2 text-xs text-brand-light">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Enter your UK postcode (e.g. SP4 7AB) or full address including postcode.
              Distance is calculated by road from our shop (SP4 6SA).
            </span>
          </div>

          <div>
            <label className="label" htmlFor="delivery-address">
              Street address
            </label>
            <input
              id="delivery-address"
              className="input"
              placeholder="e.g. 10 High Street, Salisbury"
              value={deliveryAddress}
              onChange={(e) => {
                setDeliveryAddress(e.target.value);
                setDeliveryQuote(null);
              }}
            />
          </div>

          <div>
            <label className="label">Postcode</label>
            <PostcodeLookup
              value={deliveryPostcode}
              onChange={(v) => {
                setDeliveryPostcode(v);
                setDeliveryQuote(null);
              }}
              placeholder="e.g. SP4 7AB — type to search"
            />
          </div>

          <button
            type="button"
            onClick={checkDelivery}
            disabled={loading}
            className="btn-primary w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking delivery…
              </>
            ) : (
              "Check delivery availability"
            )}
          </button>

          {deliveryQuote?.available && (
            <div className="rounded-lg bg-green-500/10 px-4 py-3 text-sm text-green-400">
              <p className="font-medium">{deliveryQuote.message}</p>
              {deliveryQuote.resolvedAddress && (
                <p className="mt-1 text-green-400/70">{deliveryQuote.resolvedAddress}</p>
              )}
            </div>
          )}
          {(quoteError || (deliveryQuote && !deliveryQuote.available)) && (
            <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {quoteError || deliveryQuote?.message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
