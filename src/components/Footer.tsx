import Link from "next/link";
import { Fish, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-brand-dark/90">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Fish className="h-6 w-6 text-brand-light" />
              <span className="font-display text-lg font-bold text-brand-light">
                Golden Plaice
              </span>
            </div>
            <p className="text-sm text-white/60">
              Traditional British fish & chips, burgers, pies and more. Proudly serving
              Longhedge and Salisbury.
            </p>
          </div>
          <div>
            <h3 className="mb-3 font-semibold text-brand-light">Find us</h3>
            <address className="not-italic text-sm text-white/70">
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" />
                2 Rhodes Moorhouse Way, Longhedge, Salisbury SP4 6SA
              </p>
              <p className="mt-2 flex items-center gap-2">
                <Phone className="h-4 w-4 text-brand-blue" />
                <a href="tel:01722341351" className="hover:text-brand-light">
                  01722 341 351
                </a>
              </p>
            </address>
          </div>
          <div>
            <h3 className="mb-3 font-semibold text-brand-light">Quick links</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link href="/order" className="hover:text-brand-light">
                  Order online
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-light">
                  Contact & hours
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-brand-light">
                  My account
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} Golden Plaice Fish & Chips. All rights reserved.</p>
          <Link
            href="/admin"
            className="text-white/25 transition hover:text-white/50"
            title="Staff only"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
