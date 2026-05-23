"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CreditCard, Banknote, Loader2, User, UserPlus } from "lucide-react";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import type { PaymentMethod } from "@/types";

type CheckoutMode = "guest" | "login" | "register";

export default function CheckoutPage() {
  const router = useRouter();
  const lines = useCart((s) => s.lines);
  const fulfillment = useCart((s) => s.fulfillment);
  const deliveryPostcode = useCart((s) => s.deliveryPostcode);
  const deliveryAddress = useCart((s) => s.deliveryAddress);
  const deliveryQuote = useCart((s) => s.deliveryQuote);
  const notes = useCart((s) => s.notes);
  const setNotes = useCart((s) => s.setNotes);
  const subtotal = useCart((s) => s.subtotal);
  const deliveryFee = useCart((s) => s.deliveryFee);
  const total = useCart((s) => s.total);
  const clearCart = useCart((s) => s.clearCart);

  const [mode, setMode] = useState<CheckoutMode>("guest");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cardPaymentsEnabled, setCardPaymentsEnabled] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setCardPaymentsEnabled(d.cardPaymentsEnabled ?? true))
      .catch(() => {});
  }, []);

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="section-title mb-4">Your basket is empty</h1>
        <Link href="/order" className="btn-primary">
          Browse menu
        </Link>
      </div>
    );
  }

  const canDeliver =
    fulfillment === "collection" ||
    (deliveryQuote?.available && deliveryAddress.trim() && deliveryPostcode.trim());

  const placeOrder = async () => {
    setError("");
    if (!name.trim() || !phone.trim()) {
      setError("Please enter your name and phone number");
      return;
    }
    if (fulfillment === "delivery" && !canDeliver) {
      setError("Please check delivery postcode and enter your full address");
      return;
    }
    if (mode !== "guest" && !email.trim()) {
      setError("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      if (mode === "register") {
        const regRes = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, phone, password }),
        });
        if (!regRes.ok) {
          const d = await regRes.json();
          setError(d.error || "Registration failed");
          setLoading(false);
          return;
        }
      } else if (mode === "login") {
        const loginRes = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!loginRes.ok) {
          const d = await loginRes.json();
          setError(d.error || "Login failed");
          setLoading(false);
          return;
        }
      }

      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fulfillment,
          paymentMethod,
          customer: { name, email, phone, isGuest: mode === "guest" },
          deliveryAddress: fulfillment === "delivery" ? deliveryAddress : undefined,
          deliveryPostcode: fulfillment === "delivery" ? deliveryPostcode : undefined,
          deliveryMiles: deliveryQuote?.miles,
          deliveryFee: deliveryFee(),
          items: lines,
          subtotal: subtotal(),
          deliveryFeeAmount: deliveryFee(),
          total: total(),
          notes,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        setError(orderData.error || "Could not place order");
        setLoading(false);
        return;
      }

      clearCart();

      if (paymentMethod === "card" && orderData.stripeCheckoutUrl) {
        window.location.href = orderData.stripeCheckoutUrl;
        return;
      }

      router.push(`/order-confirmation?id=${orderData.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="section-title mb-8">Checkout</h1>

      <div className="card mb-6">
        <h2 className="mb-4 font-semibold text-brand-light">Order summary</h2>
        <ul className="space-y-2 text-sm">
          {lines.map((l) => (
            <li key={l.id} className="flex justify-between gap-4">
              <span>
                {l.quantity}× {l.name}
              </span>
              <span>{formatPrice(l.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 border-t border-white/10 pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-white/60">Subtotal</span>
            <span>{formatPrice(subtotal())}</span>
          </div>
          {fulfillment === "delivery" && (
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
        <p className="mt-2 text-xs text-white/40 capitalize">
          {fulfillment} · {fulfillment === "delivery" && deliveryPostcode}
        </p>
      </div>

      <div className="card mb-6">
        <h2 className="mb-4 font-semibold text-brand-light">Your details</h2>
        <div className="mb-4 flex flex-wrap gap-2">
          {(
            [
              { id: "guest", label: "Guest checkout", icon: User },
              { id: "login", label: "Sign in", icon: User },
              { id: "register", label: "Register", icon: UserPlus },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition ${
                mode === id
                  ? "border-brand-orange bg-brand-orange/10"
                  : "border-white/10 hover:border-white/30"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="name">Full name *</label>
            <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          {mode !== "guest" && (
            <>
              <div>
                <label className="label" htmlFor="email">Email *</label>
                <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="password">Password *</label>
                <input id="password" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </>
          )}
          <div>
            <label className="label" htmlFor="phone">Phone *</label>
            <input id="phone" type="tel" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          {mode === "guest" && (
            <div>
              <label className="label" htmlFor="guest-email">Email (optional)</label>
              <input id="guest-email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          )}
          <div>
            <label className="label" htmlFor="notes">Order notes</label>
            <textarea id="notes" className="input min-h-[80px]" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Allergies, extra instructions..." />
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="mb-4 font-semibold text-brand-light">Payment</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setPaymentMethod("cash")}
            className={`flex items-center gap-3 rounded-xl border-2 p-4 transition ${
              paymentMethod === "cash"
                ? "border-brand-orange bg-brand-orange/10"
                : "border-white/10"
            }`}
          >
            <Banknote className="h-6 w-6 text-brand-orange" />
            <div className="text-left">
              <p className="font-semibold">Cash</p>
              <p className="text-xs text-white/50">Pay on {fulfillment}</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod("card")}
            disabled={!cardPaymentsEnabled}
            className={`flex items-center gap-3 rounded-xl border-2 p-4 transition ${
              paymentMethod === "card"
                ? "border-brand-orange bg-brand-orange/10"
                : "border-white/10"
            } disabled:opacity-40`}
          >
            <CreditCard className="h-6 w-6 text-brand-orange" />
            <div className="text-left">
              <p className="font-semibold">Card</p>
              <p className="text-xs text-white/50">Stripe gateway (coming soon)</p>
            </div>
          </button>
        </div>
        {paymentMethod === "card" && (
          <p className="mt-3 rounded-lg bg-brand-blue/10 px-4 py-2 text-xs text-brand-light">
            Card payments will redirect to our secure payment partner once Stripe is connected.
            Your order is saved either way.
          </p>
        )}
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>
      )}

      <button
        type="button"
        onClick={placeOrder}
        disabled={loading || !canDeliver}
        className="btn-primary w-full text-lg"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Placing order...
          </>
        ) : (
          `Place order — ${formatPrice(total())}`
        )}
      </button>
    </div>
  );
}
