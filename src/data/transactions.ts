// src/data/transactions.ts
import { desc, eq } from "drizzle-orm";
import { db } from "../db/client";
import { transactions, type NewTransaction } from "../db/schema";

export const listTransactionsQuery = (userId: number) =>
  db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(
      desc(transactions.transactionDate),
      desc(transactions.transactionId),
    );

export const addTransaction = (input: NewTransaction) =>
  db.insert(transactions).values(input).run();
