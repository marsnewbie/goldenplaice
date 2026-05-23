import { MenuSection } from "@/components/MenuSection";
import { OrderFulfillmentBar } from "@/components/OrderFulfillmentBar";
import { getCategories, getMenuItems, getModifierGroups } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Order Online",
};

export default async function OrderPage() {
  const [categories, items, modifierGroups] = await Promise.all([
    getCategories(),
    getMenuItems(),
    getModifierGroups(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="section-title">Order Online</h1>
        <p className="mt-2 text-white/60">
          Choose collection or delivery, add items to your basket, then checkout.
        </p>
      </div>

      <OrderFulfillmentBar />

      <div className="mt-10 space-y-12">
        {categories.map((cat) => {
          const catItems = items.filter((i) => i.categoryId === cat.id && i.available);
          if (!catItems.length) return null;
          return (
            <MenuSection
              key={cat.id}
              id={cat.id}
              title={cat.name}
              description={cat.description}
              items={catItems}
              modifierGroups={modifierGroups}
            />
          );
        })}
      </div>
    </div>
  );
}
