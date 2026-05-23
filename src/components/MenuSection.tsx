import type { MenuItem, ModifierGroup } from "@/types";
import { MenuItemCard } from "./MenuItemCard";

interface Props {
  id: string;
  title: string;
  description?: string;
  items: MenuItem[];
  modifierGroups: ModifierGroup[];
}

export function MenuSection({ id, title, description, items, modifierGroups }: Props) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-6 border-b border-brand-blue/30 pb-3">
        <h2 className="font-display text-2xl font-bold text-brand-light">{title}</h2>
        {description && <p className="mt-1 text-sm text-white/50">{description}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <MenuItemCard key={item.id} item={item} modifierGroups={modifierGroups} />
        ))}
      </div>
    </section>
  );
}
