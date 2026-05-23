"use client";

import type { Order } from "@/types";
import { formatPrice } from "@/lib/utils";

interface Props {
  orders: Order[];
  onStatusChange: (id: string, status: Order["status"]) => void;
}

export function AdminOrdersTab({ orders, onStatusChange }: Props) {
  if (orders.length === 0) {
    return <p className="text-white/50">No orders yet</p>;
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="card">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-mono text-sm text-brand-light">{order.id}</p>
              <p className="font-semibold">{order.customer.name}</p>
              <p className="text-sm text-white/50">
                {order.customer.phone} · {order.fulfillment} · {order.paymentMethod}
              </p>
              {order.fulfillment === "delivery" && (
                <p className="mt-1 text-sm text-white/60">
                  {order.deliveryAddress}, {order.deliveryPostcode}
                  {order.deliveryMiles != null && ` · ${order.deliveryMiles} mi`}
                </p>
              )}
              <p className="text-sm font-medium text-brand-orange">{formatPrice(order.total)}</p>
              <p className="text-xs text-white/40">
                {new Date(order.createdAt).toLocaleString("en-GB")}
              </p>
            </div>
            <select
              value={order.status}
              onChange={(e) => onStatusChange(order.id, e.target.value as Order["status"])}
              className="input w-auto py-2 text-sm"
            >
              {["pending", "confirmed", "preparing", "ready", "completed", "cancelled"].map(
                (s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                )
              )}
            </select>
          </div>
          <ul className="mt-3 space-y-1 text-sm text-white/60">
            {order.items.map((l) => (
              <li key={l.id}>
                {l.quantity}× {l.name} — {formatPrice(l.lineTotal)}
                {l.modifiers.length > 0 && (
                  <ul className="ml-4 text-xs text-white/40">
                    {l.modifiers.map((m) => (
                      <li key={m.modifierId}>
                        {m.modifierName}: {m.optionLabels.join(", ")}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          {order.notes && (
            <p className="mt-2 text-sm italic text-white/50">Note: {order.notes}</p>
          )}
        </div>
      ))}
    </div>
  );
}
