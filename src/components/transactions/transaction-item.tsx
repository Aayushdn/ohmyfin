import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { formatAmount, type Transaction } from "@/data/transactions_old";

// Static strings so the Tailwind scanner can see them.
const AVATAR_COLORS = [
  "bg-secondary",
  "bg-primary",
  "bg-income",
  "bg-selection",
  "bg-background-element",
];

function avatarClass(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++)
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

type Props = {
  item: Transaction;
  onPress?: (item: Transaction) => void;
};

function TransactionItemBase({ item, onPress }: Props) {
  const isIncome = item.type === "income";

  return (
    <Pressable
      onPress={() => onPress?.(item)}
      className="flex-row items-center px-5 py-4 active:bg-surface-dim"
    >
      <View className={`size-6 rounded-full ${avatarClass(item.vendor)}`} />

      <View className="ml-3 flex-1 items-start">
        <Text
          className="text-sm font-semibold text-foreground"
          numberOfLines={1}
        >
          {item.vendor}
        </Text>
        <View className="mt-1 rounded bg-chip px-2 py-0.5">
          <Text className="text-[10px] text-muted">{item.category}</Text>
        </View>
      </View>

      <Text
        className={`text-sm font-bold ${isIncome ? "text-income" : "text-primary"}`}
      >
        {formatAmount(item.amount)}
      </Text>
    </Pressable>
  );
}

export const TransactionItem = memo(TransactionItemBase);
