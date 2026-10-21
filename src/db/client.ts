import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "./schema";
import { deleteDatabaseSync, openDatabaseSync } from "expo-sqlite";

// try {
//   deleteDatabaseSync("finance.db");
// } catch {} // TEMPORARY:

// const expoDb = openDatabaseSync("finance.db", { enableChangeListener: true });
const expoDb = openDatabaseSync("finance.db", { enableChangeListener: true });
expoDb.execSync("PRAGMA foreign_keys = ON;");

export const db = drizzle(expoDb, { schema });
