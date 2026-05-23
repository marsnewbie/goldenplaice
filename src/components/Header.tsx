"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fish, Menu, Phone, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/store/cart";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Home" },
  { href: "/order", label: "Order Online" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const itemCount = useCart((s) => s.itemCount());

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-brand-navy/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue/20">
            <Fish className="h-6 w-6 text-brand-light" />
          </div>
          <div>
            <span className="font-display text-lg font-bold leading-tight text-brand-light">
              Golden Plaice
            </span>
            <span className="block text-xs text-white/60">Fish & Chips</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition",
                pathname === link.href
                  ? "bg-brand-blue/20 text-brand-light"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="tel:01722341351"
            className="hidden items-center gap-1 rounded-lg px-3 py-2 text-sm text-brand-light hover:bg-white/10 sm:flex"
          >
            <Phone className="h-4 w-4" />
            01722 341 351
          </a>
          <button
            type="button"
            onClick={() => document.dispatchEvent(new CustomEvent("open-cart"))}
            className="relative rounded-xl bg-brand-orange/90 p-2.5 text-brand-navy transition hover:bg-brand-orange"
            aria-label="Open basket"
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-white">
                {itemCount}
              </span>
            )}
          </button>
          <button
            type="button"
            className="rounded-lg p-2 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-white/10 px-4 py-3 md:hidden">
          {nav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-4 py-3 text-white/90 hover:bg-white/10"
            >
              {link.label}
            </Link>
          ))}
          <a href="tel:01722341351" className="mt-2 flex items-center gap-2 px-4 py-3 text-brand-light">
            <Phone className="h-4 w-4" />
            01722 341 351
          </a>
        </nav>
      )}
    </header>
  );
}
