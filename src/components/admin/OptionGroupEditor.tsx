"use client";

import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { MenuModifier, ModifierOption, ModifierType } from "@/types";
import { newModifierOption } from "@/lib/menu";

interface Props {
  group: MenuModifier;
  onChange: (group: MenuModifier) => void;
  onDelete: () => void;
}

function OptionEditor({
  option,
  onChange,
  onDelete,
  depth,
}: {
  option: ModifierOption;
  onChange: (opt: ModifierOption) => void;
  onDelete: () => void;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = (option.children?.length ?? 0) > 0;

  const addChildGroup = () => {
    const child: MenuModifier = {
      id: `mod_${Date.now()}`,
      name: "Sub-options",
      type: "single",
      required: false,
      options: [newModifierOption()],
    };
    onChange({
      ...option,
      children: [...(option.children || []), child],
    });
  };

  const updateChild = (idx: number, child: MenuModifier) => {
    const children = [...(option.children || [])];
    children[idx] = child;
    onChange({ ...option, children });
  };

  const removeChild = (idx: number) => {
    onChange({
      ...option,
      children: (option.children || []).filter((_, i) => i !== idx),
    });
  };

  return (
    <div
      className={`rounded-xl border border-white/10 bg-brand-navy/40 p-3 ${
        depth > 0 ? "ml-4 mt-2" : "mt-2"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <input
          className="input min-w-[140px] flex-1 text-sm"
          value={option.label}
          placeholder="Option label"
          onChange={(e) => onChange({ ...option, label: e.target.value })}
        />
        <div className="flex items-center gap-1">
          <span className="text-xs text-white/40">+£</span>
          <input
            type="number"
            step="0.1"
            className="input w-20 text-sm"
            value={option.price ?? 0}
            onChange={(e) =>
              onChange({ ...option, price: parseFloat(e.target.value) || 0 })
            }
          />
        </div>
        <button
          type="button"
          onClick={addChildGroup}
          className="btn-ghost text-xs"
          title="Nested options when this is selected"
        >
          <Plus className="h-3 w-3" />
          Sub-group
        </button>
        <button type="button" onClick={onDelete} className="p-1 text-red-400">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {hasChildren && (
        <div className="mt-2">
          <button
            type="button"
            className="flex items-center gap-1 text-xs text-brand-light"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            Nested option groups ({option.children!.length})
          </button>
          {expanded &&
            option.children!.map((child, idx) => (
              <NestedGroupEditor
                key={child.id}
                group={child}
                onChange={(g) => updateChild(idx, g)}
                onDelete={() => removeChild(idx)}
                depth={depth + 1}
              />
            ))}
        </div>
      )}
    </div>
  );
}

function NestedGroupEditor({
  group,
  onChange,
  onDelete,
  depth,
}: {
  group: MenuModifier;
  onChange: (g: MenuModifier) => void;
  onDelete: () => void;
  depth: number;
}) {
  return (
    <div className="ml-2 mt-2 border-l-2 border-brand-blue/40 pl-3">
      <div className="mb-2 flex flex-wrap gap-2">
        <input
          className="input flex-1 text-sm"
          value={group.name}
          onChange={(e) => onChange({ ...group, name: e.target.value })}
        />
        <select
          className="input w-28 text-sm"
          value={group.type}
          onChange={(e) => onChange({ ...group, type: e.target.value as ModifierType })}
        >
          <option value="single">Single</option>
          <option value="multi">Multi</option>
          <option value="boolean">Yes/No</option>
        </select>
        <button type="button" onClick={onDelete} className="text-red-400">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      {group.options.map((opt, idx) => (
        <OptionEditor
          key={opt.id}
          option={opt}
          depth={depth}
          onChange={(o) => {
            const options = [...group.options];
            options[idx] = o;
            onChange({ ...group, options });
          }}
          onDelete={() =>
            onChange({ ...group, options: group.options.filter((_, i) => i !== idx) })
          }
        />
      ))}
      <button
        type="button"
        className="mt-1 text-xs text-brand-light hover:underline"
        onClick={() => onChange({ ...group, options: [...group.options, newModifierOption()] })}
      >
        + Add sub-option
      </button>
    </div>
  );
}

export function OptionGroupEditor({ group, onChange, onDelete }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="card border-brand-blue/20">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 font-semibold text-brand-light"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {group.name || "Untitled group"}
        </button>
        <button type="button" onClick={onDelete} className="text-sm text-red-400 hover:underline">
          Delete group
        </button>
      </div>

      {!collapsed && (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="label">Group name</label>
              <input
                className="input"
                value={group.name}
                onChange={(e) => onChange({ ...group, name: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Selection type</label>
              <select
                className="input"
                value={group.type}
                onChange={(e) =>
                  onChange({ ...group, type: e.target.value as ModifierType })
                }
              >
                <option value="single">Single choice (radio)</option>
                <option value="multi">Multiple choice (checkbox)</option>
                <option value="boolean">Yes / No</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={group.required ?? false}
                  onChange={(e) => onChange({ ...group, required: e.target.checked })}
                />
                Required
              </label>
            </div>
            {group.type === "multi" && (
              <>
                <div>
                  <label className="label">Min selections</label>
                  <input
                    type="number"
                    className="input"
                    value={group.minSelections ?? 0}
                    onChange={(e) =>
                      onChange({
                        ...group,
                        minSelections: parseInt(e.target.value, 10) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="label">Max selections</label>
                  <input
                    type="number"
                    className="input"
                    value={group.maxSelections ?? group.options.length}
                    onChange={(e) =>
                      onChange({
                        ...group,
                        maxSelections: parseInt(e.target.value, 10) || 1,
                      })
                    }
                  />
                </div>
              </>
            )}
          </div>

          <p className="mb-2 text-sm font-medium text-white/70">Options</p>
          {group.options.map((opt, idx) => (
            <OptionEditor
              key={opt.id}
              option={opt}
              depth={0}
              onChange={(o) => {
                const options = [...group.options];
                options[idx] = o;
                onChange({ ...group, options });
              }}
              onDelete={() =>
                onChange({ ...group, options: group.options.filter((_, i) => i !== idx) })
              }
            />
          ))}
          <button
            type="button"
            className="btn-ghost mt-2 text-sm"
            onClick={() =>
              onChange({ ...group, options: [...group.options, newModifierOption()] })
            }
          >
            <Plus className="h-4 w-4" />
            Add option
          </button>
          <p className="mt-3 text-xs text-white/30">Group ID: {group.id}</p>
        </>
      )}
    </div>
  );
}
