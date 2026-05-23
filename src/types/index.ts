export type ModifierType = "single" | "multi" | "boolean";

export interface ModifierOption {
  id: string;
  label: string;
  price?: number;
}

export interface MenuModifier {
  id: string;
  name: string;
  type: ModifierType;
  required?: boolean;
  options: ModifierOption[];
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  available: boolean;
  modifiers?: MenuModifier[];
  tags?: string[];
}

export interface MenuCategory {
  id: string;
  name: string;
  sortOrder: number;
  description?: string;
}

export type FulfillmentType = "collection" | "delivery";

export type PaymentMethod = "cash" | "card";

export interface CartLineModifier {
  modifierId: string;
  modifierName: string;
  optionIds: string[];
  optionLabels: string[];
}

export interface CartLine {
  id: string;
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  modifiers: CartLineModifier[];
  lineTotal: number;
}

export interface DeliveryQuote {
  miles: number;
  fee: number;
  available: boolean;
  message: string;
}

export interface TimeSlot {
  open: string;
  close: string;
}

export interface DayHours {
  closed?: boolean;
  slots?: TimeSlot[];
}

export interface ShopSettings {
  name: string;
  phone: string;
  email: string;
  address: string;
  postcode: string;
  lat: number;
  lng: number;
  deliveryTiers: { maxMiles: number; fee: number }[];
  maxDeliveryMiles: number;
  minOrderDelivery: number;
  minOrderCollection: number;
  openingHours: Record<string, DayHours>;
  cardPaymentsEnabled: boolean;
  stripePlaceholder: boolean;
}

export interface OrderCustomer {
  name: string;
  email: string;
  phone: string;
  isGuest: boolean;
  userId?: string;
}

export interface Order {
  id: string;
  createdAt: string;
  status: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled";
  fulfillment: FulfillmentType;
  paymentMethod: PaymentMethod;
  paymentStatus: "pending" | "paid" | "failed";
  customer: OrderCustomer;
  deliveryAddress?: string;
  deliveryPostcode?: string;
  deliveryMiles?: number;
  deliveryFee?: number;
  items: CartLine[];
  subtotal: number;
  deliveryFeeAmount: number;
  total: number;
  notes?: string;
}

export interface StoreData {
  settings: ShopSettings;
  categories: MenuCategory[];
  items: MenuItem[];
  orders: Order[];
}

export interface CustomerAccount {
  id: string;
  email: string;
  name: string;
  phone: string;
  passwordHash: string;
  createdAt: string;
}
