import type {
  CartLineModifier,
  MenuItem,
  MenuModifier,
  ModifierGroup,
  ModifierOption,
} from "@/types";

export function resolveItemModifiers(
  item: MenuItem,
  groups: ModifierGroup[]
): MenuModifier[] {
  const fromGroups = (item.modifierGroupIds || [])
    .map((id) => groups.find((g) => g.id === id))
    .filter((g): g is ModifierGroup => Boolean(g));
  const inline = item.modifiers || [];
  return [...fromGroups, ...inline];
}

export function itemHasModifiers(item: MenuItem, groups: ModifierGroup[]): boolean {
  return resolveItemModifiers(item, groups).length > 0;
}

function collectModifiersExtra(
  modifiers: MenuModifier[],
  selections: Record<string, string[]>
): number {
  let total = 0;
  for (const mod of modifiers) {
    const selectedIds = selections[mod.id] || [];
    for (const opt of mod.options) {
      if (selectedIds.includes(opt.id)) {
        total += opt.price ?? 0;
        if (opt.children?.length) {
          total += collectModifiersExtra(opt.children, selections);
        }
      }
    }
  }
  return total;
}

export function calculateModifierExtra(
  modifiers: MenuModifier[],
  selections: Record<string, string[]>
): number {
  return collectModifiersExtra(modifiers, selections);
}

export function validateModifierSelections(
  modifiers: MenuModifier[],
  selections: Record<string, string[]>
): string | null {
  for (const mod of modifiers) {
    const selected = selections[mod.id] || [];

    if (mod.required && selected.length === 0) {
      return `Please select ${mod.name.toLowerCase()}`;
    }

    if (mod.type === "multi") {
      const min = mod.minSelections ?? 0;
      const max = mod.maxSelections ?? mod.options.length;
      if (selected.length < min) {
        return `Please select at least ${min} option(s) for ${mod.name}`;
      }
      if (selected.length > max) {
        return `Please select at most ${max} option(s) for ${mod.name}`;
      }
    }

    for (const optId of selected) {
      const opt = mod.options.find((o) => o.id === optId);
      if (opt?.children?.length) {
        const nestedError = validateModifierSelections(opt.children, selections);
        if (nestedError) return nestedError;
      }
    }
  }
  return null;
}

export function buildCartLineModifiers(
  modifiers: MenuModifier[],
  selections: Record<string, string[]>
): CartLineModifier[] {
  const lines: CartLineModifier[] = [];

  function walk(mods: MenuModifier[]) {
    for (const mod of mods) {
      const optionIds = selections[mod.id] || [];
      if (!optionIds.length) continue;

      const selectedOptions = mod.options.filter((o) => optionIds.includes(o.id));
      const extraPrice = selectedOptions.reduce((s, o) => s + (o.price ?? 0), 0);

      lines.push({
        modifierId: mod.id,
        modifierName: mod.name,
        optionIds,
        optionLabels: selectedOptions.map((o) =>
          o.price ? `${o.label} (+£${o.price.toFixed(2)})` : o.label
        ),
        extraPrice,
      });

      for (const opt of selectedOptions) {
        if (opt.children?.length) walk(opt.children);
      }
    }
  }

  walk(modifiers);
  return lines;
}

export function getActiveNestedModifiers(
  modifiers: MenuModifier[],
  selections: Record<string, string[]>
): MenuModifier[] {
  const nested: MenuModifier[] = [];
  for (const mod of modifiers) {
    const selectedIds = selections[mod.id] || [];
    for (const opt of mod.options) {
      if (selectedIds.includes(opt.id) && opt.children?.length) {
        nested.push(...opt.children);
      }
    }
  }
  return nested;
}

export function flattenModifierTree(modifiers: MenuModifier[]): MenuModifier[] {
  const all: MenuModifier[] = [...modifiers];
  for (const mod of modifiers) {
    for (const opt of mod.options) {
      if (opt.children?.length) {
        all.push(...flattenModifierTree(opt.children));
      }
    }
  }
  return all;
}

export function newModifierOption(label = "New option"): ModifierOption {
  return { id: `opt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, label, price: 0 };
}

export function newModifierGroup(name = "New option group"): ModifierGroup {
  return {
    id: `grp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name,
    type: "single",
    required: false,
    options: [newModifierOption()],
  };
}
