"use client";

import { RefreshCw, Save } from "lucide-react";
import type { ShopSettings } from "@/types";

interface Props {
  settings: ShopSettings;
  onChange: (settings: ShopSettings) => void;
  onSave: () => void;
  onSyncLocation: () => void;
  saving: boolean;
}

const DAY_LABELS: { key: string; label: string }[] = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

export function AdminSettingsTab({
  settings,
  onChange,
  onSave,
  onSyncLocation,
  saving,
}: Props) {
  const updateHours = (day: string, patch: { closed?: boolean; open?: string; close?: string }) => {
    const dayHours = settings.openingHours[day] || { slots: [{ open: "10:30", close: "21:00" }] };
    if (patch.closed !== undefined) {
      onChange({
        ...settings,
        openingHours: {
          ...settings.openingHours,
          [day]: patch.closed ? { closed: true } : { slots: [{ open: "10:30", close: "21:00" }] },
        },
      });
      return;
    }
    const slot = dayHours.slots?.[0] || { open: "10:30", close: "21:00" };
    onChange({
      ...settings,
      openingHours: {
        ...settings.openingHours,
        [day]: {
          slots: [
            {
              open: patch.open ?? slot.open,
              close: patch.close ?? slot.close,
            },
          ],
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="card space-y-4">
        <h2 className="font-semibold text-brand-light">Shop details</h2>
        <div>
          <label className="label">Shop name</label>
          <input
            className="input"
            value={settings.name}
            onChange={(e) => onChange({ ...settings, name: e.target.value })}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Phone</label>
            <input
              className="input"
              value={settings.phone}
              onChange={(e) => onChange({ ...settings, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              value={settings.email}
              onChange={(e) => onChange({ ...settings, email: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="label">Address</label>
          <input
            className="input"
            value={settings.address}
            onChange={(e) => onChange({ ...settings, address: e.target.value })}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Postcode</label>
            <input
              className="input uppercase"
              value={settings.postcode}
              onChange={(e) => onChange({ ...settings, postcode: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Lat (auto-sync)</label>
            <input className="input bg-white/5" value={settings.lat} readOnly />
          </div>
          <div>
            <label className="label">Lng (auto-sync)</label>
            <input className="input bg-white/5" value={settings.lng} readOnly />
          </div>
        </div>
        <button type="button" onClick={onSyncLocation} className="btn-secondary text-sm">
          <RefreshCw className="h-4 w-4" />
          Sync coordinates from postcode (postcodes.io)
        </button>
      </div>

      <div className="card space-y-4">
        <h2 className="font-semibold text-brand-light">Delivery fees</h2>
        <div>
          <label className="label">Maximum delivery distance (miles)</label>
          <input
            type="number"
            step="0.1"
            className="input max-w-xs"
            value={settings.maxDeliveryMiles}
            onChange={(e) =>
              onChange({ ...settings, maxDeliveryMiles: parseFloat(e.target.value) || 3 })
            }
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1].map((tierIdx) => (
            <div key={tierIdx} className="rounded-xl border border-white/10 p-4">
              <p className="mb-3 text-sm font-medium">Tier {tierIdx + 1}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label">Up to (miles)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="input"
                    value={settings.deliveryTiers[tierIdx]?.maxMiles ?? ""}
                    onChange={(e) => {
                      const tiers = [...settings.deliveryTiers];
                      while (tiers.length <= tierIdx) tiers.push({ maxMiles: 1, fee: 1 });
                      tiers[tierIdx] = {
                        ...tiers[tierIdx],
                        maxMiles: parseFloat(e.target.value) || 0,
                      };
                      onChange({ ...settings, deliveryTiers: tiers });
                    }}
                  />
                </div>
                <div>
                  <label className="label">Fee (£)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    value={settings.deliveryTiers[tierIdx]?.fee ?? ""}
                    onChange={(e) => {
                      const tiers = [...settings.deliveryTiers];
                      while (tiers.length <= tierIdx) tiers.push({ maxMiles: 1, fee: 1 });
                      tiers[tierIdx] = {
                        ...tiers[tierIdx],
                        fee: parseFloat(e.target.value) || 0,
                      };
                      onChange({ ...settings, deliveryTiers: tiers });
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="font-semibold text-brand-light">Opening hours</h2>
        {DAY_LABELS.map(({ key, label }) => {
          const day = settings.openingHours[key];
          const closed = day?.closed;
          const slot = day?.slots?.[0];
          return (
            <div
              key={key}
              className="flex flex-wrap items-center gap-3 border-b border-white/5 pb-3"
            >
              <span className="w-28 text-sm font-medium">{label}</span>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!closed}
                  onChange={(e) => updateHours(key, { closed: e.target.checked })}
                />
                Closed
              </label>
              {!closed && (
                <>
                  <input
                    type="time"
                    className="input w-auto py-2"
                    value={slot?.open || "10:30"}
                    onChange={(e) => updateHours(key, { open: e.target.value })}
                  />
                  <span className="text-white/40">to</span>
                  <input
                    type="time"
                    className="input w-auto py-2"
                    value={slot?.close || "21:00"}
                    onChange={(e) => updateHours(key, { close: e.target.value })}
                  />
                </>
              )}
            </div>
          );
        })}
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={settings.cardPaymentsEnabled}
          onChange={(e) => onChange({ ...settings, cardPaymentsEnabled: e.target.checked })}
        />
        Card payments enabled
      </label>

      <button type="button" onClick={onSave} disabled={saving} className="btn-primary">
        <Save className="h-4 w-4" />
        Save settings
      </button>
    </div>
  );
}
