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
export const CATEGORY_TYPES = ["Food", "School", "Misc"] as const;
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
    type: text("type", { enum: CATEGORY_TYPES }),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("uq_categories_user_name").on(t.userId, t.name),
    check(
      "categories_type_check",
      sql`${t.type} IN ('Food', 'School', 'Misc')`,
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
    amountCents: integer("amount_cents").notNull().default(0),
    type: text("type", { enum: TRANSACTION_TYPES }).notNull(),
    merchant: text("merchant"),
    transactionDate: text("transaction_date").notNull(), // 'YYYY-MM-DD'
    isRecurring: integer("is_recurring", { mode: "boolean" })
      .notNull()
      .default(false),
    frequency: text("frequency", { enum: FREQUENCIES }), // only set when recurring
    notes: text("notes"),
    ...timestamps,
  },
  (t) => [
    index("idx_transactions_user_date").on(t.userId, t.transactionDate),
    index("idx_transactions_category").on(t.categoryId),
    check("transactions_type_check", sql`${t.type} IN ('income', 'expense')`),
    check(
      "transactions_frequency_check",
      sql`${t.frequency} IN ('daily', 'weekly', 'monthly', 'yearly')`,
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
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type BudgetRule = typeof budgetRules.$inferSelect;
export type Budget = typeof budgets.$inferSelect;
