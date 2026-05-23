"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Search } from "lucide-react";

interface Suggestion {
  postcode: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (postcode: string) => void;
  placeholder?: string;
  id?: string;
}

export function PostcodeLookup({
  value,
  onChange,
  onSelect,
  placeholder = "Postcode or start typing address…",
  id = "postcode-lookup",
}: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const q = value.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (q.length < 2) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/delivery/autocomplete?q=${encodeURIComponent(q)}`);
        const data = (await res.json()) as { suggestions: Suggestion[] };
        setSuggestions(data.suggestions || []);
        setOpen(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  const pick = (postcode: string) => {
    onChange(postcode);
    onSelect?.(postcode);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          id={id}
          className="input pl-10 uppercase"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          autoComplete="postal-code"
        />
      </div>
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-white/20 bg-brand-dark shadow-xl">
          {suggestions.map((s) => (
            <li key={s.postcode}>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-brand-blue/20"
                onClick={() => pick(s.postcode)}
              >
                <MapPin className="h-4 w-4 shrink-0 text-brand-orange" />
                {s.postcode}
              </button>
            </li>
          ))}
        </ul>
      )}
      {loading && (
        <p className="mt-1 text-xs text-white/40">Searching UK postcodes…</p>
      )}
    </div>
  );
}
