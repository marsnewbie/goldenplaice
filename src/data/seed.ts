import type { MenuCategory, MenuItem, ModifierGroup, ShopSettings } from "@/types";

export const SAUCE_MODIFIER_ID = "sauce";
export const SALAD_MODIFIER_ID = "salad";
export const PIE_OPTIONS_MODIFIER_ID = "pie-options";

export const sauceOptions = [
  { id: "ketchup", label: "Ketchup" },
  { id: "mayo", label: "Mayonnaise" },
  { id: "bbq", label: "BBQ Sauce" },
  { id: "curry", label: "Curry Sauce" },
  { id: "gravy", label: "Gravy" },
  { id: "no-sauce", label: "No sauce" },
];

export const saladOptions = [
  { id: "lettuce", label: "Lettuce" },
  { id: "tomato", label: "Tomato" },
  { id: "onion", label: "Onion" },
  { id: "no-salad", label: "No salad" },
];

export const pieOptions = [
  { id: "no-onion", label: "No onion" },
  { id: "no-spicy", label: "No spicy" },
  { id: "with-sauce", label: "With sauce" },
];

export const GRP_SAUCE = "grp-sauce";
export const GRP_SALAD = "grp-salad";
export const GRP_PIE = "grp-pie-options";

export const defaultModifierGroups: ModifierGroup[] = [
  {
    id: GRP_SAUCE,
    name: "Choose your sauce",
    type: "single",
    required: true,
    options: sauceOptions,
  },
  {
    id: GRP_SALAD,
    name: "Salad",
    type: "single",
    required: false,
    options: saladOptions,
  },
  {
    id: GRP_PIE,
    name: "Pie options",
    type: "multi",
    required: false,
    minSelections: 0,
    maxSelections: 3,
    options: pieOptions,
  },
];

const burgerGroupIds = { modifierGroupIds: [GRP_SAUCE, GRP_SALAD] };
const pieGroupIds = { modifierGroupIds: [GRP_PIE] };

export const defaultSettings: ShopSettings = {
  name: "Golden Plaice Fish & Chips",
  phone: "01722 341 351",
  email: "orders@goldenplaice.co.uk",
  address: "2 Rhodes Moorhouse Way, Longhedge, Salisbury",
  postcode: "SP4 6SA",
  lat: 51.1545,
  lng: -1.7088,
  deliveryTiers: [
    { maxMiles: 1, fee: 1 },
    { maxMiles: 3, fee: 2 },
  ],
  maxDeliveryMiles: 3,
  minOrderDelivery: 0,
  minOrderCollection: 0,
  cardPaymentsEnabled: true,
  stripePlaceholder: true,
  openingHours: {
    monday: {
      slots: [
        { open: "10:30", close: "13:30" },
        { open: "16:30", close: "21:30" },
      ],
    },
    tuesday: {
      slots: [
        { open: "10:30", close: "13:30" },
        { open: "16:30", close: "21:30" },
      ],
    },
    wednesday: {
      slots: [
        { open: "10:30", close: "13:30" },
        { open: "16:30", close: "21:30" },
      ],
    },
    thursday: {
      slots: [
        { open: "10:30", close: "13:30" },
        { open: "16:30", close: "21:30" },
      ],
    },
    friday: {
      slots: [
        { open: "10:30", close: "13:30" },
        { open: "16:30", close: "22:00" },
      ],
    },
    saturday: {
      slots: [
        { open: "10:30", close: "13:30" },
        { open: "16:30", close: "22:00" },
      ],
    },
    sunday: { closed: true },
  },
};

export const defaultCategories: MenuCategory[] = [
  { id: "fish", name: "Fish", sortOrder: 1 },
  { id: "pukka-pies", name: "Pukka Pies", sortOrder: 2, description: "All £4.50" },
  { id: "sausage", name: "Sausage", sortOrder: 3 },
  { id: "chicken", name: "Southern Fried Chicken", sortOrder: 4 },
  { id: "burgers", name: "Burgers", sortOrder: 5, description: "All served with sauce & salad" },
  { id: "specials", name: "Specials", sortOrder: 6 },
  { id: "kids", name: "Kids Meals", sortOrder: 7, description: "Includes chips & a drink" },
  { id: "lunch", name: "Lunch Special", sortOrder: 8, description: "Mon–Sat 10:30am–1:30pm" },
  { id: "sides", name: "Sides", sortOrder: 9 },
  { id: "drinks", name: "Drinks", sortOrder: 10 },
];

function item(
  id: string,
  categoryId: string,
  name: string,
  price: number,
  extras?: Partial<MenuItem>
): MenuItem {
  return {
    id,
    categoryId,
    name,
    price,
    available: true,
    ...extras,
  };
}

export const defaultItems: MenuItem[] = [
  // Fish
  item("fish-regular-cod", "fish", "Regular Cod", 7.8),
  item("fish-large-cod", "fish", "Large Cod", 9.2),
  item("fish-haddock", "fish", "Haddock", 9.8),
  item("fish-plaice", "fish", "Plaice", 8.8),
  item("fish-bites", "fish", "Fish Bite (3 pieces)", 5.7),

  // Pukka Pies
  item("pie-chicken-mushroom", "pukka-pies", "Chicken and Mushroom", 4.5, pieGroupIds),
  item("pie-steak-kidney", "pukka-pies", "Steak and Kidney", 4.5, pieGroupIds),
  item("pie-beef-onion", "pukka-pies", "Beef and Onion", 4.5, pieGroupIds),

  // Sausage
  item("sausage-small", "sausage", "Small", 1.6),
  item("sausage-large", "sausage", "Large", 2.6),
  item("sausage-small-battered", "sausage", "Small Battered", 1.8),
  item("sausage-large-battered", "sausage", "Large Battered", 2.6),
  item("sausage-saveloy", "sausage", "Saveloy", 2.6),

  // Chicken
  item("chicken-1", "chicken", "1 piece", 2.5),
  item("chicken-2", "chicken", "2 pieces (includes chips)", 7.2),
  item("chicken-3", "chicken", "3 pieces (includes chips)", 9.2),

  // Burgers
  item("burger-quarter", "burgers", "1/4 Pounder", 4.8, burgerGroupIds),
  item("burger-quarter-cheese", "burgers", "1/4 Pounder with Cheese", 5.0, burgerGroupIds),
  item("burger-half", "burgers", "1/2 Pounder", 6.5, burgerGroupIds),
  item("burger-half-cheese", "burgers", "1/2 Pounder with Cheese", 6.7, burgerGroupIds),
  item("burger-chicken", "burgers", "Chicken Burger", 5.0, burgerGroupIds),
  item("burger-chicken-cheese", "burgers", "Chicken Burger with Cheese", 6.5, burgerGroupIds),
  item("burger-double-chicken", "burgers", "Double Chicken Burger", 6.3, burgerGroupIds),
  item("burger-bacon-chicken", "burgers", "Bacon Chicken Burger", 6.1, burgerGroupIds),
  item("burger-veggie", "burgers", "Veggie Burger", 4.0, burgerGroupIds),
  item("burger-veggie-cheese", "burgers", "Veggie Burger with Cheese", 4.2, burgerGroupIds),

  // Specials
  item("special-cod-chips-reg", "specials", "Regular Cod and Chips", 10.3),
  item("special-cod-chips-lg", "specials", "Large Cod and Chips", 11.5),
  item("special-beef-chips", "specials", "Beef Burger 1/4 Pounder and Chips", 7.6),
  item("special-chicken-chips", "specials", "Chicken Burger and Chips", 7.8),

  // Kids
  item("kids-sausage", "kids", "Kids Sausage, Chips & Drink", 5.5),
  item("kids-fish-cake", "kids", "Kids Fish Cake Meal", 5.5),
  item("kids-nuggets", "kids", "Kids Chicken Nuggets (4) Meal", 6.0),
  item("kids-battered-sausage", "kids", "Kids Battered Sausage Meal", 5.8),

  // Lunch
  item("lunch-classic", "lunch", "Classic Lunch", 8.6, {
    description: "2 sausages, 2 bacon, fried egg, baked beans & chips. Hot drink included.",
  }),
  item("lunch-veggie", "lunch", "Vegetarian Classic Lunch", 8.2, {
    description: "3 vegan sausages, 2 fried eggs, baked beans & chips. Hot drink included.",
  }),

  // Sides
  item("side-chips-reg", "sides", "Regular Chips", 3.0),
  item("side-chips-lg", "sides", "Large Chips", 3.8),
  item("side-cheesy-chips", "sides", "Cheesy Chips", 5.6),
  item("side-cheesy-curry", "sides", "Cheesy Chips and Curry Sauce", 6.7),
  item("side-chip-butty", "sides", "Chip Butty", 3.0),
  item("side-nuggets-6", "sides", "Chicken Nuggets (6 pieces)", 4.0),
  item("side-nuggets-10", "sides", "Chicken Nuggets (10 pieces)", 5.2),
  item("side-cod-roe", "sides", "Cod Roe", 2.4),
  item("side-scampi", "sides", "Scampi (8 pieces)", 7.5),
  item("side-spam", "sides", "Spam Fritter", 2.2),
  item("side-pineapple", "sides", "Pineapple Fritter", 2.0),
  item("side-onion-rings", "sides", "Onion Rings (10 pieces)", 4.2),
  item("side-curry", "sides", "Curry Sauce", 2.2),
  item("side-beans", "sides", "Baked Beans", 2.0),
  item("side-peas", "sides", "Mushy Peas", 1.9),
  item("side-roll", "sides", "Bread Roll", 1.1),
  item("side-mars", "sides", "Battered Mars Bar", 2.2),
  item("side-gherkin", "sides", "Pickled Gherkin", 1.1),
  item("side-egg", "sides", "Pickled Egg", 1.0),

  // Drinks
  item("drink-can", "drinks", "Can (Rio, Coke, Diet Coke, Fanta Orange)", 1.4),
  item("drink-bottle", "drinks", "Bottle (1.5 litre)", 2.9),
  item("drink-water", "drinks", "Water (500ml)", 1.3),
];
