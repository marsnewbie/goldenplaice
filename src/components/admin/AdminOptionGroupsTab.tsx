"use client";

import { Plus } from "lucide-react";
import type { ModifierGroup } from "@/types";
import { newModifierGroup } from "@/lib/menu";
import { OptionGroupEditor } from "./OptionGroupEditor";

interface Props {
  groups: ModifierGroup[];
  onChange: (groups: ModifierGroup[]) => void;
}

export function AdminOptionGroupsTab({ groups, onChange }: Props) {
  const addGroup = () => onChange([...groups, newModifierGroup()]);

  const updateGroup = (idx: number, group: ModifierGroup) => {
    const next = [...groups];
    next[idx] = group;
    onChange(next);
  };

  const removeGroup = (idx: number) => {
    if (!confirm("Delete this option group? Menu items linking to it may lose options.")) return;
    onChange(groups.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-white/50">
          Reusable option sets (sauce, salad, pie options). Link them to menu items in the Menu
          Items tab. Supports single/multi select, extra prices, and nested sub-options.
        </p>
        <button type="button" onClick={addGroup} className="btn-secondary shrink-0 text-sm">
          <Plus className="h-4 w-4" />
          New option group
        </button>
      </div>
      <div className="space-y-6">
        {groups.length === 0 ? (
          <p className="text-white/40">No option groups yet. Add one or save to load defaults.</p>
        ) : (
          groups.map((group, idx) => (
            <OptionGroupEditor
              key={group.id}
              group={group}
              onChange={(g) => updateGroup(idx, g)}
              onDelete={() => removeGroup(idx)}
            />
          ))
        )}
      </div>
    </div>
  );
}
