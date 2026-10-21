import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { CircleX, Funnel, Receipt, Search, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/ui/icon";
import { FilterSheet } from "@/components/transactions/filter-sheet";
import { TransactionItem } from "@/components/transactions/transaction-item";
import {
  EMPTY_FILTERS,
  PERIODS,
  TRANSACTIONS,
  countActiveFilters,
  inPeriod,
  type Filters,
  type Period,
} from "@/data/transactions_old";

export default function TransactionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState<Period>("today");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sheetOpen, setSheetOpen] = useState(false);

  const vendors = useMemo(
    () => [...new Set(TRANSACTIONS.map((t) => t.vendor))].sort(),
    [],
  );
  const categories = useMemo(
    () => [...new Set(TRANSACTIONS.map((t) => t.category))].sort(),
    [],
  );

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    const min = filters.min === "" ? null : Number(filters.min);
    const max = filters.max === "" ? null : Number(filters.max);

    return TRANSACTIONS.filter((t) => {
      if (!inPeriod(t.date, period)) return false;
      if (q && !`${t.vendor} ${t.category}`.toLowerCase().includes(q))
        return false;
      if (filters.vendors.length && !filters.vendors.includes(t.vendor))
        return false;
      if (filters.categories.length && !filters.categories.includes(t.category))
        return false;
      if (min !== null && t.amount < min) return false;
      if (max !== null && t.amount > max) return false;
      return true;
    }).sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [query, period, filters]);

  const activeCount = countActiveFilters(filters);

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View
        className="border-b border-line bg-surface px-5 pb-4"
        style={{ paddingTop: insets.top + 12 }}
      >
        <View className="h-8 items-center justify-center">
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            className="absolute left-0"
            accessibilityLabel="Close"
          >
            <Icon icon={X} size={22} />
          </Pressable>
          <Text className="text-base font-bold text-foreground">
            Transactions
          </Text>
        </View>
      </View>

      {/* Search + filter button */}
      <View className="flex-row items-center gap-3 px-5 pt-5">
        <View className="h-11 flex-1 flex-row items-center rounded-xl border border-line bg-surface px-3">
          <Icon icon={Search} size={16} colorVar="--color-muted" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search transactions"
            placeholderTextColorClassName="accent-placeholder"
            returnKeyType="search"
            className="ml-2 flex-1 text-sm text-foreground"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <Icon icon={CircleX} size={16} colorVar="--color-muted" />
            </Pressable>
          )}
        </View>

        <Pressable
          onPress={() => setSheetOpen(true)}
          accessibilityLabel="Filter transactions"
          className="size-11 items-center justify-center rounded-xl border border-line bg-surface active:bg-surface-dim"
        >
          <Icon icon={Funnel} size={18} colorVar="--color-muted" />
          {activeCount > 0 && (
            <View className="absolute -right-1 -top-1 size-4 items-center justify-center rounded-full bg-background-element">
              <Text className="text-[9px] font-bold text-on-primary">
                {activeCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Period tabs */}
      <View className="py-5">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-3 px-5"
        >
          {PERIODS.map((p) => {
            const selected = p.key === period;
            return (
              <Pressable
                key={p.key}
                onPress={() => setPeriod(p.key)}
                className={`h-10 min-w-24 items-center justify-center rounded-lg border px-4 ${
                  selected
                    ? "border-foreground bg-surface"
                    : "border-transparent bg-chip"
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    selected ? "text-foreground" : "text-muted"
                  }`}
                >
                  {p.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* List */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionItem item={item} />}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        ListEmptyComponent={
          <View className="items-center px-8 pt-16">
            <Icon icon={Receipt} size={40} colorVar="--color-muted" />
            <Text className="mt-3 text-sm font-semibold text-foreground">
              No transactions found
            </Text>
            <Text className="mt-1 text-center text-xs text-muted">
              Try a different period or clear your filters.
            </Text>
            {(activeCount > 0 || query) && (
              <Pressable
                onPress={() => {
                  setFilters(EMPTY_FILTERS);
                  setQuery("");
                }}
                className="mt-4 h-10 items-center justify-center rounded-lg bg-background-element px-5 active:opacity-80"
              >
                <Text className="text-xs font-bold text-on-primary">
                  Clear filters
                </Text>
              </Pressable>
            )}
          </View>
        }
      />

      <FilterSheet
        visible={sheetOpen}
        filters={filters}
        vendors={vendors}
        categories={categories}
        onClose={() => setSheetOpen(false)}
        onApply={(next) => {
          setFilters(next);
          setSheetOpen(false);
        }}
      />
    </View>
  );
}
