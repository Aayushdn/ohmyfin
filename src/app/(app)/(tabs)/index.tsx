// src/app/(app)/(tabs)/index.tsx
import { Button, Platform, ScrollView, Text, View } from "react-native";
import { Link } from "expo-router";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import useAuth from "@/context/useAuth";
import { db } from "@/db/client";
import { budgets, categories, users } from "@/db/schema";

// Debug view: prints every row of a table as JSON.
function TableDump({
  title,
  rows,
  error,
}: {
  title: string;
  rows: unknown[] | undefined;
  error?: Error;
}) {
  return (
    <View className="gap-2">
      <Text className="text-base font-semibold text-foreground">
        {title} ({rows?.length ?? 0})
      </Text>
      <Text
        selectable
        className="rounded-lg bg-neutral-100 p-3 text-xs text-neutral-900"
        style={{
          fontFamily: Platform.select({ ios: "Menlo", default: "monospace" }),
        }}
      >
        {error
          ? `Error: ${error.message}`
          : JSON.stringify(rows ?? [], null, 2)}
      </Text>
    </View>
  );
}

export default function HomeScreen() {
  const { signOut } = useAuth();

  // Live queries: these re-render when the tables change
  const { data: userRows, error: usersError } = useLiveQuery(
    db.select().from(users),
  );
  const { data: categoryRows, error: categoriesError } = useLiveQuery(
    db.select().from(categories),
  );
  const { data: budgetRows, error: budgetsError } = useLiveQuery(
    db.select().from(budgets),
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }}>
      <View className="items-center gap-3">
        <Button title="Signout" onPress={() => signOut()} />
        <Link href="/(app)/add-transaction">
          <Text>ADD TRANSACTION</Text>
        </Link>
      </View>

      <TableDump title="users" rows={userRows} error={usersError} />
      <TableDump
        title="categories"
        rows={categoryRows}
        error={categoriesError}
      />
      <TableDump title="budgets" rows={budgetRows} error={budgetsError} />
    </ScrollView>
  );
}
