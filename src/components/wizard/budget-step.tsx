// src/components/wizard/budget-step.tsx
// The budget step: a name, a period, and one rule per chosen spending category.
// Everything is kept in draft.budget; nothing is written until Finish.
import { useEffect, useState } from "react";
import { Pressable, Switch, Text, TextInput, View } from "react-native";
import { listCategories } from "@/data/onboarding";
import {
  expenseOptions,
  refKey,
  thisMonthRange,
  validateBudget,
} from "./budget-helpers";
import Chip from "./chip";
import type { BudgetDraft, BudgetRuleDraft, StepProps } from "./types";

const INPUT = "rounded-2xl bg-white px-4 py-3.5 text-base text-neutral-900";
const LABEL = "text-sm font-medium text-white/80";
const SECTION = "text-sm font-semibold uppercase tracking-wider text-white/70";

export default function BudgetStep({ draft, setDraft, userId }: StepProps) {
  // Read once: the user's categories as they are in the database right now
  const [existing] = useState(() => listCategories(userId));
  const budget = draft.budget;
  const currency = draft.currency ?? "EUR";
  const month = thisMonthRange();

  // Spending categories after the previous step (defaults kept + ones added)
  const options = expenseOptions(
    existing,
    draft.removedCategoryIds,
    draft.customCategories,
  );
  const optionByKey = new Map(options.map((o) => [o.key, o]));

  function setBudget(patch: Partial<BudgetDraft>) {
    setDraft({ budget: { ...budget, ...patch } });
  }

  // If the user went back and removed a category that already had a rule,
  // drop that rule when this step opens.
  useEffect(() => {
    const kept = budget.rules.filter((r) =>
      optionByKey.has(refKey(r.category)),
    );
    if (kept.length !== budget.rules.length) setBudget({ rules: kept });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function isSelected(key: string): boolean {
    return budget.rules.some((r) => refKey(r.category) === key);
  }

  function toggleCategory(key: string) {
    const option = optionByKey.get(key);
    if (!option) return;
    if (isSelected(key)) {
      setBudget({
        rules: budget.rules.filter((r) => refKey(r.category) !== key),
      });
    } else {
      const rule: BudgetRuleDraft = {
        category: option.ref,
        amount: "",
        threshold: "",
      };
      setBudget({ rules: [...budget.rules, rule] });
    }
  }

  function updateRule(key: string, patch: Partial<BudgetRuleDraft>) {
    setBudget({
      rules: budget.rules.map((r) =>
        refKey(r.category) === key ? { ...r, ...patch } : r,
      ),
    });
  }

  const problem = validateBudget(budget);

  return (
    <View className="gap-6">
      {/* name */}
      <View className="gap-2">
        <Text className={LABEL}>Budget name</Text>
        <TextInput
          id="budget-name"
          value={budget.name}
          onChangeText={(v) => setBudget({ name: v })}
          placeholder="e.g. Monthly budget"
          placeholderTextColor="#8c8a8f"
          maxLength={40}
          className={INPUT}
        />
      </View>

      {/* period */}
      <View className="gap-3">
        <Text className={SECTION}>Period</Text>
        <View className="flex-row gap-2">
          <Chip
            label="This month"
            active={budget.period === "month"}
            role="button"
            onPress={() => setBudget({ period: "month" })}
          />
          <Chip
            label="Custom dates"
            active={budget.period === "custom"}
            role="button"
            onPress={() => setBudget({ period: "custom" })}
          />
        </View>

        {budget.period === "month" ? (
          <Text className="text-sm text-white/75">
            {month.start} to {month.end}
          </Text>
        ) : (
          <View className="flex-row gap-3">
            <View className="flex-1 gap-2">
              <Text className={LABEL}>Start</Text>
              <TextInput
                id="budget-start"
                value={budget.startDate}
                onChangeText={(v) => setBudget({ startDate: v })}
                placeholder={month.start}
                placeholderTextColor="#8c8a8f"
                keyboardType="numbers-and-punctuation"
                maxLength={10}
                autoCorrect={false}
                className={INPUT}
              />
            </View>
            <View className="flex-1 gap-2">
              <Text className={LABEL}>End</Text>
              <TextInput
                id="budget-end"
                value={budget.endDate}
                onChangeText={(v) => setBudget({ endDate: v })}
                placeholder={month.end}
                placeholderTextColor="#8c8a8f"
                keyboardType="numbers-and-punctuation"
                maxLength={10}
                autoCorrect={false}
                className={INPUT}
              />
            </View>
          </View>
        )}
      </View>

      {/* recurring */}
      <View className="flex-row items-center justify-between rounded-2xl bg-white/15 px-4 py-3">
        <View className="flex-1 pr-3">
          <Text className="text-base text-white">Repeat each period</Text>
          <Text className="text-sm text-white/70">
            Marks the budget as recurring
          </Text>
        </View>
        <Switch
          value={budget.isRecurring}
          onValueChange={(v) => setBudget({ isRecurring: v })}
          trackColor={{ false: "rgba(255,255,255,0.3)", true: "#ffffff" }}
          thumbColor={budget.isRecurring ? "#094cb2" : "#ffffff"}
        />
      </View>

      {/* which categories get a rule */}
      <View className="gap-3">
        <Text className={SECTION}>Categories to limit</Text>
        {options.length === 0 ? (
          <Text className="text-sm text-white/75">
            No spending categories are selected. Go back to pick some, or skip
            this step.
          </Text>
        ) : (
          <View className="flex-row flex-wrap gap-2">
            {options.map((o) => (
              <Chip
                key={o.key}
                label={o.name}
                active={isSelected(o.key)}
                onPress={() => toggleCategory(o.key)}
              />
            ))}
          </View>
        )}
      </View>

      {/* one card per chosen category */}
      {budget.rules.map((rule) => {
        const key = refKey(rule.category);
        const option = optionByKey.get(key);
        if (!option) return null; // category was removed; cleaned up on mount
        return (
          <View key={key} className="gap-3 rounded-2xl bg-white/15 p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-semibold text-white">
                {option.name}
              </Text>
              <Pressable
                onPress={() => toggleCategory(key)}
                accessibilityRole="button"
                accessibilityLabel={`Remove limit for ${option.name}`}
                hitSlop={10}
              >
                <Text className="text-sm text-white/70">Remove</Text>
              </Pressable>
            </View>
            <View className="flex-row gap-3">
              <View className="flex-1 gap-2">
                <Text className={LABEL}>Limit ({currency})</Text>
                <TextInput
                  id={`rule-amount-${key}`}
                  value={rule.amount}
                  onChangeText={(v) => updateRule(key, { amount: v })}
                  placeholder="0.00"
                  placeholderTextColor="#8c8a8f"
                  keyboardType="decimal-pad"
                  maxLength={10}
                  className={INPUT}
                />
              </View>
              <View className="flex-1 gap-2">
                <Text className={LABEL}>Warn at ({currency})</Text>
                <TextInput
                  id={`rule-threshold-${key}`}
                  value={rule.threshold}
                  onChangeText={(v) => updateRule(key, { threshold: v })}
                  placeholder="optional"
                  placeholderTextColor="#8c8a8f"
                  keyboardType="decimal-pad"
                  maxLength={10}
                  className={INPUT}
                />
              </View>
            </View>
          </View>
        );
      })}

      {problem ? <Text className="text-sm text-white">{problem}</Text> : null}
    </View>
  );
}
