// src/components/wizard/budget-helpers.ts
// Pure functions for the budget step: money and date parsing, validation,
// and turning the draft into what the data layer saves. No React in here.
import type {
  BudgetInput,
  BudgetRuleInput,
  CategoryRef,
  CustomCategory,
} from "@/data/onboarding";
import type { Category } from "@/db/schema";
import type { BudgetDraft } from "./types";

export function emptyBudgetDraft(): BudgetDraft {
  return {
    name: "",
    period: "month",
    startDate: "",
    endDate: "",
    isRecurring: true,
    rules: [],
  };
}

// ---- money -------------------------------------------------------------

/**
 * "12", "12.5", "12,50" -> 1200, 1250, 1250. Anything else -> null.
 * Works on the digits, never on floats, so 0.29 is exactly 29 cents.
 */
export function parseMoneyToCents(input: string): number | null {
  const text = input.trim().replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return null;
  const [whole, fraction = ""] = text.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(cents) ? cents : null;
}

// ---- dates -------------------------------------------------------------

/** Local calendar date as 'YYYY-MM-DD' (not UTC, which can be yesterday). */
export function toISODate(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** First and last day of the month containing `now`. */
export function thisMonthRange(now: Date = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start: toISODate(start), end: toISODate(end) };
}

/** True only for a real calendar date written exactly as 'YYYY-MM-DD'. */
export function isValidISODate(text: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  const [y, m, d] = text.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}

// ---- categories offered to the budget -----------------------------------

export type CategoryOption = { key: string; name: string; ref: CategoryRef };

export function refKey(ref: CategoryRef): string {
  return ref.kind === "existing"
    ? `existing:${ref.categoryId}`
    : `custom:${ref.name}`;
}

/**
 * The spending categories the user ended up with after the categories step:
 * the defaults they kept, plus the ones they added. Income is not budgeted.
 */
export function expenseOptions(
  existing: Category[],
  removedIds: number[],
  custom: CustomCategory[],
): CategoryOption[] {
  const options: CategoryOption[] = [];

  for (const c of existing) {
    if (c.type !== "expense" || removedIds.includes(c.categoryId)) continue;
    const ref: CategoryRef = { kind: "existing", categoryId: c.categoryId };
    options.push({ key: refKey(ref), name: c.name, ref });
  }
  for (const c of custom) {
    if (c.type !== "expense") continue;
    const ref: CategoryRef = { kind: "custom", name: c.name };
    options.push({ key: refKey(ref), name: c.name, ref });
  }
  return options;
}

// ---- validation and conversion -------------------------------------------

/**
 * Returns the first problem as a sentence, or null when the budget is fine.
 * A budget with no rules is fine: it just means nothing gets created.
 */
export function validateBudget(budget: BudgetDraft): string | null {
  if (budget.rules.length === 0) return null;

  if (budget.name.trim() === "") return "Give the budget a name.";

  if (budget.period === "custom") {
    if (!isValidISODate(budget.startDate)) {
      return "Start date must be a real date like 2026-10-01.";
    }
    if (!isValidISODate(budget.endDate)) {
      return "End date must be a real date like 2026-10-31.";
    }
    if (budget.endDate < budget.startDate) {
      return "The end date must be on or after the start date.";
    }
  }

  for (const rule of budget.rules) {
    const amount = parseMoneyToCents(rule.amount);
    if (amount === null || amount <= 0) {
      return "Enter an amount above 0 for each category.";
    }
    if (rule.threshold.trim() !== "") {
      const threshold = parseMoneyToCents(rule.threshold);
      if (threshold === null || threshold <= 0) {
        return "Warn-at must be an amount above 0, or left empty.";
      }
      if (threshold > amount) {
        return "Warn-at can't be more than the amount.";
      }
    }
  }
  return null;
}

/** Converts the draft (strings, euros) into what the data layer saves (cents). */
export function buildBudgetInput(budget: BudgetDraft): BudgetInput | null {
  const rules: BudgetRuleInput[] = [];
  for (const rule of budget.rules) {
    const amountCents = parseMoneyToCents(rule.amount);
    if (amountCents === null || amountCents <= 0) continue;
    const thresholdCents =
      rule.threshold.trim() === "" ? null : parseMoneyToCents(rule.threshold);
    rules.push({ category: rule.category, amountCents, thresholdCents });
  }
  if (rules.length === 0) return null;

  const range =
    budget.period === "month"
      ? thisMonthRange()
      : { start: budget.startDate, end: budget.endDate };

  return {
    name: budget.name.trim() || "My budget",
    startDate: range.start,
    endDate: range.end,
    isRecurring: budget.isRecurring,
    rules,
  };
}
