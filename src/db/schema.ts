// src/db/schema.ts
import { sql } from "drizzle-orm";
import {
  sqliteTable,
  integer,
  text,
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/sqlite-core";

// Conventions:
//   * Money is stored as INTEGER cents (12.99 -> 1299)
//   * Calendar dates are TEXT in ISO-8601 ('YYYY-MM-DD')
//   * created_at / updated_at are unix-second timestamps (Date in code)
//   * Booleans are INTEGER 0/1 (boolean in code)
//   * Run `PRAGMA foreign_keys = ON;` right after opening the DB (db/client.ts)

export const FREQUENCIES = ["daily", "weekly", "monthly", "yearly"] as const;
export const CATEGORY_TYPES = ["income", "expense"] as const;
export const TRANSACTION_TYPES = ["income", "expense"] as const;

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
};

export const users = sqliteTable("users", {
  userId: integer("user_id").primaryKey(), // rowid alias, auto-assigned
  authId: text("auth_id").unique(), // Supabase auth.users.id (UUID); NULL until sign-in
  dateOfBirth: text("date_of_birth"),
  firstName: text("first_name"),
  secondName: text("second_name"),
  emailAddress: text("email_address"),
  altEmailAddress: text("alt_email_address"),
  address: text("address"),
  phoneNumber: text("phone_number"),
  currency: text("currency"),
  // false until the user finishes (or skips) the onboarding questions.
  // Drives the route guard: not onboarded -> onboarding screens.
  isOnboarded: integer("is_onboarded", { mode: "boolean" })
    .notNull()
    .default(false),
  hasProfilePicture: integer("has_profile_picture", { mode: "boolean" })
    .notNull()
    .default(false),
  profilePictureName: text("profile_picture_name"),
  profilePicturePath: text("profile_picture_path"),
  ...timestamps,
});

export const categories = sqliteTable(
  "categories",
  {
    categoryId: integer("category_id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: text("type", { enum: CATEGORY_TYPES }).notNull(), // 'income' | 'expense'
    // Icon key from your app's icon registry (e.g. an Ionicons name like
    // "fast-food-outline"). NULL = fall back to a default icon in the UI.
    icon: text("icon"),
    ...timestamps,
  },
  (t) => [
    // Name is unique per user AND type, so "Other" can exist as both an
    // income category and an expense category.
    uniqueIndex("uq_categories_user_type_name").on(t.userId, t.type, t.name),
    check("categories_type_check", sql`${t.type} IN ('income', 'expense')`),
  ],
);

// A recurring rule is a TEMPLATE, not a transaction. On app start / foreground,
// the app inserts a real row into `transactions` for every occurrence that has
// come due since `lastGeneratedDate` (see recurringService.processRecurring).
export const recurringTransactions = sqliteTable(
  "recurring_transactions",
  {
    recurringId: integer("recurring_id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    categoryId: integer("category_id").references(() => categories.categoryId, {
      onDelete: "set null",
    }),
    amountCents: integer("amount_cents").notNull(),
    type: text("type", { enum: TRANSACTION_TYPES }).notNull(),
    merchant: text("merchant"),
    notes: text("notes"),
    frequency: text("frequency", { enum: FREQUENCIES }).notNull(),
    startDate: text("start_date").notNull(), // 'YYYY-MM-DD', first occurrence
    endDate: text("end_date"), // NULL = repeats forever
    lastGeneratedDate: text("last_generated_date"), // NULL = nothing generated yet
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    ...timestamps,
  },
  (t) => [
    index("idx_recurring_user_active").on(t.userId, t.isActive),
    check("recurring_amount_check", sql`${t.amountCents} >= 0`),
    check("recurring_type_check", sql`${t.type} IN ('income', 'expense')`),
    check(
      "recurring_frequency_check",
      sql`${t.frequency} IN ('daily', 'weekly', 'monthly', 'yearly')`,
    ),
    check(
      "recurring_end_date_check",
      sql`${t.endDate} IS NULL OR ${t.endDate} >= ${t.startDate}`,
    ),
  ],
);

export const transactions = sqliteTable(
  "transactions",
  {
    transactionId: integer("transaction_id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    categoryId: integer("category_id").references(() => categories.categoryId, {
      onDelete: "set null",
    }),
    // Set only for rows generated from a recurring rule; NULL for normal entries
    recurringId: integer("recurring_id").references(
      () => recurringTransactions.recurringId,
      { onDelete: "set null" },
    ),
    amountCents: integer("amount_cents").notNull().default(0),
    type: text("type", { enum: TRANSACTION_TYPES }).notNull(),
    merchant: text("merchant"),
    transactionDate: text("transaction_date").notNull(), // 'YYYY-MM-DD'
    notes: text("notes"),
    ...timestamps,
  },
  (t) => [
    index("idx_transactions_user_date").on(t.userId, t.transactionDate),
    index("idx_transactions_category").on(t.categoryId),
    // Prevents the same occurrence being generated twice. Normal transactions
    // have recurring_id = NULL, and SQLite treats NULLs as distinct in unique
    // indexes, so they are unaffected.
    uniqueIndex("uq_transactions_recurring_date").on(
      t.recurringId,
      t.transactionDate,
    ),
    check("transactions_type_check", sql`${t.type} IN ('income', 'expense')`),
    // Rejects anything that isn't a real, correctly formatted YYYY-MM-DD date
    check(
      "transactions_date_check",
      sql`date(${t.transactionDate}) = ${t.transactionDate}`,
    ),
  ],
);

export const budgets = sqliteTable(
  "budgets",
  {
    budgetId: integer("budget_id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    budgetName: text("budget_name"),
    startDate: text("start_date"),
    endDate: text("end_date"),
    isRecurring: integer("is_recurring", { mode: "boolean" })
      .notNull()
      .default(false),
    ...timestamps,
  },
  (t) => [index("idx_budgets_user").on(t.userId)],
);

// One budget has many rules: one rule per category.
// e.g. budget "October" -> Food: cap 400.00, warn at 320.00
export const budgetRules = sqliteTable(
  "budget_rules",
  {
    ruleId: integer("rule_id").primaryKey(),
    budgetId: integer("budget_id")
      .notNull()
      .references(() => budgets.budgetId, { onDelete: "cascade" }),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.categoryId, { onDelete: "cascade" }),
    amountCents: integer("amount_cents").notNull(), // spending cap for this category
    thresholdCents: integer("threshold_cents"), // warn at this amount; NULL = no warning
    ...timestamps,
  },
  (t) => [
    uniqueIndex("uq_budget_rules_budget_category").on(t.budgetId, t.categoryId),
    index("idx_budget_rules_category").on(t.categoryId),
    check("budget_rules_amount_check", sql`${t.amountCents} >= 0`),
    check(
      "budget_rules_threshold_check",
      sql`${t.thresholdCents} IS NULL OR ${t.thresholdCents} <= ${t.amountCents}`,
    ),
  ],
);

// Inferred types for use in repositories
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type RecurringTransaction = typeof recurringTransactions.$inferSelect;
export type NewRecurringTransaction = typeof recurringTransactions.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Budget = typeof budgets.$inferSelect;
export type NewBudget = typeof budgets.$inferInsert;
export type BudgetRule = typeof budgetRules.$inferSelect;
export type NewBudgetRule = typeof budgetRules.$inferInsert;
