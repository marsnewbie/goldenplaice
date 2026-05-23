import type { DayHours, ShopSettings } from "@/types";

const DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export function getTodayKey(): string {
  return DAY_KEYS[new Date().getDay()];
}

export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function isShopOpen(settings: ShopSettings, date = new Date()): boolean {
  const key = DAY_KEYS[date.getDay()];
  const day = settings.openingHours[key];
  if (!day || day.closed) return false;
  if (!day.slots?.length) return false;

  const now = date.getHours() * 60 + date.getMinutes();
  return day.slots.some((slot) => {
    const open = parseTimeToMinutes(slot.open);
    const close = parseTimeToMinutes(slot.close);
    return now >= open && now < close;
  });
}

export function formatDayHours(day: DayHours | undefined): string {
  if (!day || day.closed) return "Closed";
  if (!day.slots?.length) return "Closed";
  return day.slots.map((s) => `${s.open} – ${s.close}`).join(" & ");
}

export function formatAllOpeningHours(settings: ShopSettings): { day: string; hours: string }[] {
  return [
    { day: "Monday – Thursday", hours: formatDayHours(settings.openingHours.monday) },
    { day: "Friday – Saturday", hours: formatDayHours(settings.openingHours.friday) },
    { day: "Sunday", hours: formatDayHours(settings.openingHours.sunday) },
  ];
}
