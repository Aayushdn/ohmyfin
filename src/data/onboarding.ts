// src/data/onboarding.ts
import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { budgetRules, budgets, categories, type Category } from "@/db/schema";

export type CustomCategory = { name: string; type: "income" | "expense" };

/**
 * Points at a category. A category the user added in the wizard has no id
 * until it is saved, so it is identified by its name instead.
 */
export type CategoryRef =
  | { kind: "existing"; categoryId: number }
  | { kind: "custom"; name: string };

export type BudgetRuleInput = {
  category: CategoryRef;
  amountCents: number;
  thresholdCents: number | null;
};

export type BudgetInput = {
  name: string;
  startDate: string; // 'YYYY-MM-DD'
  endDate: string; // 'YYYY-MM-DD'
  isRecurring: boolean;
  rules: BudgetRuleInput[];
};

export type OnboardingChoices = {
  /** default categories the user unticked */
  removeIds: number[];
  /** categories the user added */
  custom: CustomCategory[];
  /** null = the user did not set up a budget */
  budget: BudgetInput | null;
};

/** The user's categories, spending first, in creation order. */
export function listCategories(userId: number): Category[] {
  return db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(asc(categories.type), asc(categories.categoryId))
    .all();
}

/**
 * Saves the category and budget choices from the wizard in ONE transaction,
 * in the order the tables depend on each other:
 *   1. delete the unticked default categories
 *   2. insert the categories the user added
 *   3. insert the budget, then its rules (rules need the category ids)
 * If anything fails, nothing is written.
 */
export function applyOnboardingChoices(
  userId: number,
  choices: OnboardingChoices,
): void {
  const { removeIds, custom, budget } = choices;

  db.transaction((tx) => {
    // 1. categories the user unticked
    if (removeIds.length > 0) {
      tx.delete(categories)
        .where(
          and(
            eq(categories.userId, userId),
            inArray(categories.categoryId, removeIds),
          ),
        )
        .run();
    }

    // 2. categories the user added (a name that already exists is skipped)
    if (custom.length > 0) {
      tx.insert(categories)
        .values(custom.map((c) => ({ ...c, userId })))
        .onConflictDoNothing()
        .run();
    }

    // 3. the budget (optional)
    if (!budget) return;

    // Look up the ids of the added categories, which exist now
    const customIds = new Map<string, number>();
    const customNames = custom.map((c) => c.name);
    if (customNames.length > 0) {
      const rows = tx
        .select()
        .from(categories)
        .where(
          and(
            eq(categories.userId, userId),
            eq(categories.type, "expense"),
            inArray(categories.name, customNames),
          ),
        )
        .all();
      for (const row of rows) customIds.set(row.name, row.categoryId);
    }

    // Turn each rule's category reference into a real id.
    // Rules whose category was removed or no longer exists are dropped.
    const rules: {
      categoryId: number;
      amountCents: number;
      thresholdCents: number | null;
    }[] = [];
    for (const rule of budget.rules) {
      let categoryId: number | undefined;
      if (rule.category.kind === "existing") {
        const id = rule.category.categoryId;
        categoryId = removeIds.includes(id) ? undefined : id;
      } else {
        categoryId = customIds.get(rule.category.name);
      }
      if (categoryId === undefined) continue;
      rules.push({
        categoryId,
        amountCents: rule.amountCents,
        thresholdCents: rule.thresholdCents,
      });
    }
    if (rules.length === 0) return; // no budget without at least one rule

    const created = tx
      .insert(budgets)
      .values({
        userId,
        budgetName: budget.name,
        startDate: budget.startDate,
        endDate: budget.endDate,
        isRecurring: budget.isRecurring,
      })
      .returning()
      .get();

    tx.insert(budgetRules)
      .values(rules.map((r) => ({ ...r, budgetId: created.budgetId })))
      .run();
  });
}
