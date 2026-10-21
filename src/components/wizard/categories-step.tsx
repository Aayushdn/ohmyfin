// src/components/wizard/categories-step.tsx
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { listCategories } from "@/data/onboarding";
import type { StepProps } from "./types";

const TYPES = ["expense", "income"] as const;
const HEADINGS = { expense: "Spending", income: "Income" } as const;

function Chip({
  label,
  active,
  onPress,
  role = "checkbox",
  accessibilityLabel,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  role?: "checkbox" | "button";
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={role}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={role === "checkbox" ? { checked: active } : undefined}
      className={
        active
          ? "rounded-full bg-white px-4 py-2"
          : "rounded-full border border-white/40 bg-white/10 px-4 py-2"
      }
    >
      <Text
        className={
          active
            ? "text-sm font-medium text-background-element"
            : "text-sm text-white/70"
        }
      >
        {role === "checkbox" && active ? "✓ " : ""}
        {label}
      </Text>
    </Pressable>
  );
}

export default function CategoriesStep({ draft, setDraft, userId }: StepProps) {
  // Read once: these are the default categories seeded when the profile was created
  const [existing] = useState(() => listCategories(userId));
  const [name, setName] = useState("");
  const [type, setType] = useState<(typeof TYPES)[number]>("expense");
  const [notice, setNotice] = useState<string | null>(null);

  const removed = new Set(draft.removedCategoryIds);

  function toggle(id: number) {
    setDraft({
      removedCategoryIds: removed.has(id)
        ? draft.removedCategoryIds.filter((x) => x !== id)
        : [...draft.removedCategoryIds, id],
    });
  }

  function removeCustom(index: number) {
    setDraft({
      customCategories: draft.customCategories.filter((_, i) => i !== index),
    });
  }

  function add() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const lower = trimmed.toLowerCase();
    const clash =
      existing.some(
        (c) =>
          c.type === type &&
          !removed.has(c.categoryId) &&
          c.name.toLowerCase() === lower,
      ) ||
      draft.customCategories.some(
        (c) => c.type === type && c.name.toLowerCase() === lower,
      );
    if (clash) {
      setNotice(
        `"${trimmed}" already exists in ${HEADINGS[type].toLowerCase()}.`,
      );
      return;
    }
    setNotice(null);
    setDraft({
      customCategories: [...draft.customCategories, { name: trimmed, type }],
    });
    setName("");
  }

  return (
    <View className="gap-6">
      {TYPES.map((t) => (
        <View key={t} className="gap-3">
          <Text className="text-sm font-semibold uppercase tracking-wider text-white/70">
            {HEADINGS[t]}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {existing
              .filter((c) => c.type === t)
              .map((c) => (
                <Chip
                  key={c.categoryId}
                  label={c.name}
                  active={!removed.has(c.categoryId)}
                  onPress={() => toggle(c.categoryId)}
                />
              ))}
            {draft.customCategories.map((c, i) =>
              c.type === t ? (
                <Chip
                  key={`custom-${i}`}
                  label={`${c.name}  ×`}
                  active
                  role="button"
                  accessibilityLabel={`Remove ${c.name}`}
                  onPress={() => removeCustom(i)}
                />
              ) : null,
            )}
          </View>
        </View>
      ))}

      <View className="gap-3">
        <Text className="text-sm font-semibold uppercase tracking-wider text-white/70">
          Add your own
        </Text>
        <TextInput
          id="new-category-name"
          value={name}
          onChangeText={(v) => {
            setName(v);
            setNotice(null);
          }}
          onSubmitEditing={add}
          returnKeyType="done"
          placeholder="e.g. Gym"
          placeholderTextColor="#8c8a8f"
          maxLength={30}
          className="rounded-2xl bg-white px-4 py-3.5 text-base text-neutral-900"
        />
        <View className="flex-row items-center gap-2">
          {TYPES.map((t) => (
            <Pressable
              key={t}
              onPress={() => setType(t)}
              accessibilityRole="radio"
              accessibilityState={{ selected: type === t }}
              className={
                type === t
                  ? "rounded-full bg-white px-4 py-2"
                  : "rounded-full border border-white/40 px-4 py-2"
              }
            >
              <Text
                className={
                  type === t
                    ? "text-sm font-medium text-background-element"
                    : "text-sm text-white/80"
                }
              >
                {HEADINGS[t]}
              </Text>
            </Pressable>
          ))}
          <Pressable
            onPress={add}
            accessibilityRole="button"
            disabled={name.trim().length === 0}
            className={
              name.trim().length === 0
                ? "ml-auto rounded-full bg-white/20 px-5 py-2"
                : "ml-auto rounded-full bg-white px-5 py-2"
            }
          >
            <Text
              className={
                name.trim().length === 0
                  ? "text-sm font-semibold text-white/50"
                  : "text-sm font-semibold text-background-element"
              }
            >
              Add
            </Text>
          </Pressable>
        </View>
        {notice ? <Text className="text-sm text-white">{notice}</Text> : null}
      </View>
    </View>
  );
}
