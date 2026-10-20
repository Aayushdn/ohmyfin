import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "./schema";

const expoDb = openDatabaseSync("finance.db", { enableChangeListener: true });
expoDb.execSync("PRAGMA foreign_keys = ON;");

export const db = drizzle(expoDb, { schema });
