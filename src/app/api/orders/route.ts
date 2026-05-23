import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/auth";
import { addOrder, generateId } from "@/lib/store";
import type { CartLine, FulfillmentType, Order, PaymentMethod } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fulfillment,
      paymentMethod,
      customer,
      deliveryAddress,
      deliveryPostcode,
      deliveryMiles,
      deliveryFee,
      items,
      subtotal,
      deliveryFeeAmount,
      total,
      notes,
    } = body as {
      fulfillment: FulfillmentType;
      paymentMethod: PaymentMethod;
      customer: { name: string; email: string; phone: string; isGuest: boolean };
      deliveryAddress?: string;
      deliveryPostcode?: string;
      deliveryMiles?: number;
      deliveryFee?: number;
      items: CartLine[];
      subtotal: number;
      deliveryFeeAmount: number;
      total: number;
      notes?: string;
    };

    if (!items?.length) {
      return NextResponse.json({ error: "Basket is empty" }, { status: 400 });
    }

    if (!customer?.name || !customer?.phone) {
      return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
    }

    if (fulfillment === "delivery" && (!deliveryAddress || !deliveryPostcode)) {
      return NextResponse.json({ error: "Delivery address required" }, { status: 400 });
    }

    const session = await getCustomerSession();

    const order: Order = {
      id: generateId("ord"),
      createdAt: new Date().toISOString(),
      status: "pending",
      fulfillment,
      paymentMethod,
      paymentStatus: paymentMethod === "card" ? "pending" : "pending",
      customer: {
        ...customer,
        userId: session?.id,
      },
      deliveryAddress,
      deliveryPostcode,
      deliveryMiles,
      deliveryFee,
      items,
      subtotal,
      deliveryFeeAmount,
      total,
      notes,
    };

    await addOrder(order);

    // Stripe placeholder — set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET to enable
    let stripeCheckoutUrl: string | undefined;
    if (paymentMethod === "card" && process.env.STRIPE_SECRET_KEY) {
      // Future: create Stripe Checkout session
      stripeCheckoutUrl = undefined;
    }

    return NextResponse.json({
      id: order.id,
      stripeCheckoutUrl,
      message: "Order placed successfully",
    });
  } catch {
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}
