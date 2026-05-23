"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Home } from "lucide-react";
import { Suspense } from "react";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <CheckCircle className="mx-auto h-16 w-16 text-green-400" />
      <h1 className="section-title mt-6">Thank you!</h1>
      <p className="mt-4 text-white/70">
        Your order has been received. We&apos;ll start preparing it shortly.
      </p>
      {orderId && (
        <p className="mt-2 font-mono text-sm text-brand-light">Order ref: {orderId}</p>
      )}
      <p className="mt-4 text-sm text-white/50">
        For card payments, you&apos;ll complete payment when our gateway is connected.
        Cash orders: please have the exact amount ready.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/" className="btn-primary">
          <Home className="h-4 w-4" />
          Back to home
        </Link>
        <Link href="/order" className="btn-secondary">
          Order again
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center">Loading...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
