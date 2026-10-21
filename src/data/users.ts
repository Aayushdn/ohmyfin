// src/data/users.ts
import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { users, categories, type User, type NewUser } from "../db/schema";

const DEFAULT_CATEGORIES = [
  { name: "Food", type: "expense", icon: "food" },
  { name: "Transport", type: "expense", icon: "transport" },
  { name: "School", type: "expense", icon: "school" },
  { name: "Misc", type: "expense", icon: "misc" },
  { name: "Salary", type: "income", icon: "salary" },
  { name: "Other", type: "income", icon: "other_income" },
] as const;

export const getFirstUser = (): User | null =>
  db.select().from(users).limit(1).get() ?? null;

// Creates the user row and default categories together, or neither.
export function createLocalUser(input: Omit<NewUser, "userId"> = {}): User {
  return db.transaction((tx) => {
    const user = tx.insert(users).values(input).returning().get();
    tx.insert(categories)
      .values(DEFAULT_CATEGORIES.map((c) => ({ ...c, userId: user.userId })))
      .run();
    return user;
  });
}

export function updateUser(userId: number, patch: Partial<NewUser>): User {
  return db
    .update(users)
    .set(patch)
    .where(eq(users.userId, userId))
    .returning()
    .get();
}

//dev temprorary
export const deleteAllProfiles = () => {
  db.delete(users).run(); // cascades to categories, transactions, budgets
};
