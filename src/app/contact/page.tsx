import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { getSettings } from "@/lib/store";
import { formatAllOpeningHours } from "@/lib/opening-hours";

export const metadata = {
  title: "Contact Us",
};

export default async function ContactPage() {
  const settings = await getSettings();
  const hours = formatAllOpeningHours(settings);
  const mapQuery = encodeURIComponent(
    `${settings.address}, ${settings.postcode}`
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="section-title mb-2">Contact Us</h1>
      <p className="mb-10 text-white/60">We&apos;d love to hear from you — pop in or give us a ring.</p>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="card">
            <MapPin className="mb-3 h-7 w-7 text-brand-orange" />
            <h2 className="font-display text-xl font-bold">Address</h2>
            <p className="mt-2 text-white/70">
              {settings.address}
              <br />
              {settings.postcode}
            </p>
          </div>
          <div className="card">
            <Phone className="mb-3 h-7 w-7 text-brand-orange" />
            <h2 className="font-display text-xl font-bold">Phone</h2>
            <a
              href={`tel:${settings.phone.replace(/\s/g, "")}`}
              className="mt-2 block text-2xl font-bold text-brand-light hover:underline"
            >
              {settings.phone}
            </a>
          </div>
          <div className="card">
            <Mail className="mb-3 h-7 w-7 text-brand-orange" />
            <h2 className="font-display text-xl font-bold">Email</h2>
            <a href={`mailto:${settings.email}`} className="mt-2 text-brand-light hover:underline">
              {settings.email}
            </a>
          </div>
          <div className="card">
            <Clock className="mb-3 h-7 w-7 text-brand-orange" />
            <h2 className="font-display text-xl font-bold">Opening times</h2>
            <ul className="mt-4 space-y-2">
              {hours.map((h) => (
                <li key={h.day} className="flex justify-between text-white/70">
                  <span>{h.day}</span>
                  <span className="text-brand-light">{h.hours}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10">
          <iframe
            title="Golden Plaice location"
            className="h-[500px] w-full min-h-[400px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
          />
        </div>
      </div>
    </div>
  );
}
