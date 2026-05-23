import { defaultSettings } from "@/data/seed";
import { getSettings, updateSettings } from "@/lib/store";
import { lookupUkPostcode } from "@/lib/uk-postcode";
import type { ShopSettings } from "@/types";

/** Shop coordinates — always resolved from postcode when possible. */
export async function getShopCoordinates(): Promise<
  Pick<
    ShopSettings,
    "lat" | "lng" | "postcode" | "address" | "deliveryTiers" | "maxDeliveryMiles"
  >
> {
  const settings = await getSettings();

  const lookup = await lookupUkPostcode(settings.postcode);
  if (lookup) {
    const coordsChanged =
      Math.abs(settings.lat - lookup.lat) > 0.0001 ||
      Math.abs(settings.lng - lookup.lng) > 0.0001;

    if (coordsChanged) {
      await updateSettings({
        ...settings,
        lat: lookup.lat,
        lng: lookup.lng,
      });
    }

    return {
      lat: lookup.lat,
      lng: lookup.lng,
      postcode: lookup.postcode,
      address: settings.address,
      deliveryTiers: settings.deliveryTiers,
      maxDeliveryMiles: settings.maxDeliveryMiles,
    };
  }

  return {
    lat: settings.lat || defaultSettings.lat,
    lng: settings.lng || defaultSettings.lng,
    postcode: settings.postcode,
    address: settings.address,
    deliveryTiers: settings.deliveryTiers,
    maxDeliveryMiles: settings.maxDeliveryMiles,
  };
}
