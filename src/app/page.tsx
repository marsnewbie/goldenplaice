import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, Phone, ShoppingBag, Truck } from "lucide-react";
import { getSettings } from "@/lib/store";
import { formatAllOpeningHours } from "@/lib/opening-hours";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await getSettings();
  const hours = formatAllOpeningHours(settings);

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-navy/50 to-brand-navy z-10" />
        <div className="relative z-20 mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-orange">
                Salisbury&apos;s favourite chippy
              </p>
              <h1 className="font-display text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
                Golden Plaice
                <span className="block text-brand-light">Fish & Chips</span>
              </h1>
              <p className="mt-5 max-w-lg text-lg text-white/70">
                Freshly battered fish, golden chips, burgers, Pukka pies and southern fried
                chicken. Order online for collection or local delivery.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/order" className="btn-primary text-lg">
                  <ShoppingBag className="h-5 w-5" />
                  Order Now
                </Link>
                <a href="tel:01722341351" className="btn-secondary">
                  <Phone className="h-5 w-5" />
                  01722 341 351
                </a>
              </div>
              <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/60">
                <span className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-brand-blue" />
                  Delivery within 3 miles
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-brand-blue" />
                  SP4 6SA
                </span>
              </div>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1579202673504-ecd9c0b0a8f0?w=800&q=80"
                alt="Fish and chips"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="section-title mb-10 text-center">What we serve</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Fish & Chips",
              desc: "Cod, haddock, plaice and classic specials",
              img: "https://images.unsplash.com/photo-1579202673504-ecd9c0b0a8f0?w=400&q=80",
            },
            {
              title: "Southern Fried Chicken",
              desc: "Crispy chicken pieces & meal deals",
              img: "https://images.unsplash.com/photo-1626082927389-6fc091adf6e1?w=400&q=80",
            },
            {
              title: "Burgers",
              desc: "Beef, chicken & veggie — your sauce, your way",
              img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
            },
            {
              title: "Pukka Pies",
              desc: "Hearty pies with custom options",
              img: "https://images.unsplash.com/photo-1606755457119-83cbab8b0d0a?w=400&q=80",
            },
          ].map((cat) => (
            <div
              key={cat.title}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-brand-dark/60"
            >
              <div className="relative aspect-square">
                <Image
                  src={cat.img}
                  alt={cat.title}
                  fill
                  className="object-cover transition group-hover:scale-105"
                  sizes="300px"
                />
              </div>
              <div className="p-4">
                <h3 className="font-display text-lg font-bold text-brand-light">{cat.title}</h3>
                <p className="mt-1 text-sm text-white/50">{cat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-brand-dark/40 py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-2">
          <div className="card">
            <Clock className="mb-3 h-8 w-8 text-brand-orange" />
            <h2 className="font-display text-2xl font-bold">Opening times</h2>
            <ul className="mt-4 space-y-2 text-white/70">
              {hours.map((h) => (
                <li key={h.day} className="flex justify-between gap-4 border-b border-white/5 pb-2">
                  <span>{h.day}</span>
                  <span className="text-right text-brand-light">{h.hours}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card">
            <Truck className="mb-3 h-8 w-8 text-brand-orange" />
            <h2 className="font-display text-2xl font-bold">Delivery areas</h2>
            <ul className="mt-4 space-y-3 text-white/70">
              <li className="flex justify-between">
                <span>0 – 1 mile</span>
                <span className="font-semibold text-brand-light">£1.00</span>
              </li>
              <li className="flex justify-between">
                <span>1 – 3 miles</span>
                <span className="font-semibold text-brand-light">£2.00</span>
              </li>
              <li className="flex justify-between">
                <span>Over 3 miles</span>
                <span className="text-white/40">Collection only</span>
              </li>
            </ul>
            <p className="mt-4 text-sm text-white/40">
              Delivery calculated from {settings.address}, {settings.postcode}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h2 className="section-title mb-4">Ready to order?</h2>
        <p className="mx-auto mb-8 max-w-md text-white/60">
          Skip the platforms — order direct and support your local chippy.
        </p>
        <Link href="/order" className="btn-primary text-lg">
          <ShoppingBag className="h-5 w-5" />
          Start your order
        </Link>
      </section>
    </>
  );
}
