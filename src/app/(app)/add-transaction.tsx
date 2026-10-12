import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import {
  Wallet,
  PiggyBank,
  Banknote,
  Store,
  Calendar,
  ShoppingBasket,
  Bus,
  House,
  BriefcaseMedical,
  Drama,
  Ellipsis,
} from "lucide-react-native";
import { useCSSVariable } from "uniwind";

type EntryType = "expense" | "income";

type FormValues = {
  type: EntryType;
  amount: string;
  accountId: string;
  entity: string;
  date: Date;
  categoryId: string;
  note: string;
};

const ACCOUNTS = [
  { id: "mastercard", name: "Mastercard", meta: "...8892", Icon: Wallet },
  { id: "vault", name: "Vault", meta: "...1023", Icon: PiggyBank },
  { id: "personal", name: "Personal", meta: "ONLINE", Icon: Banknote },
] as const;

const CATEGORIES = [
  { id: "food", label: "Food", Icon: ShoppingBasket },
  { id: "travel", label: "Travel", Icon: Bus },
  { id: "rent", label: "Rent", Icon: House },
  { id: "health", label: "Health", Icon: BriefcaseMedical },
  { id: "fun", label: "Fun", Icon: Drama },
  { id: "more", label: "More", Icon: Ellipsis },
] as const;

// Keep digits and a single decimal point, max 2 decimals.
const sanitizeAmount = (text: string) => {
  const cleaned = text.replace(/[^0-9.]/g, "");
  const [whole, ...rest] = cleaned.split(".");
  return rest.length ? `${whole}.${rest.join("").slice(0, 2)}` : whole;
};

export default function NewEntryScreen() {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      type: "expense",
      amount: "",
      accountId: "mastercard",
      entity: "",
      date: new Date(),
      categoryId: "rent",
      note: "",
    },
  });

  // Icon colors can't be set via className, so resolve them from the theme.
  const [foreground, muted, secondary, onPrimary] = useCSSVariable([
    "--color-foreground",
    "--color-muted",
    "--color-secondary",
    "--color-on-primary",
  ]) as string[];

  const type = watch("type");
  const isExpense = type === "expense";
  const amountTone = isExpense ? "text-primary" : "text-income";
  const buttonTone = isExpense ? "bg-primary" : "bg-income";

  const onSubmit = async (values: FormValues) => {
    const payload = { ...values, amount: parseFloat(values.amount) };
    // TODO: persist transaction (payload)
    console.log(payload);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background pb-10"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-8"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Expense / Income toggle */}
        <Controller
          control={control}
          name="type"
          render={({ field: { value, onChange } }) => (
            <View className="mt-5 flex-row rounded-2xl bg-track p-1.5">
              {(["expense", "income"] as const).map((t) => {
                const selected = value === t;
                const selectedBg =
                  t === "expense"
                    ? "bg-linear-to-r from-primary-dark to-primary"
                    : "bg-income";
                return (
                  <Pressable
                    key={t}
                    onPress={() => onChange(t)}
                    className={`flex-1 items-center rounded-xl py-3.5 ${selected ? selectedBg : ""}`}
                  >
                    <Text
                      className={`text-sm font-bold uppercase tracking-widest ${
                        selected ? "text-on-primary" : "text-muted"
                      }`}
                    >
                      {t}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        />

        {/* Amount */}
        <View className="mt-9 items-center">
          <Text className="text-xs uppercase tracking-widest text-muted">
            Initial amount
          </Text>
          <Controller
            control={control}
            name="amount"
            rules={{
              required: "Enter an amount",
              validate: (v) =>
                parseFloat(v) > 0 || "Amount must be greater than 0",
            }}
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={(text) => onChange(sanitizeAmount(text))}
                onBlur={onBlur}
                placeholder="0.00"
                placeholderTextColorClassName="accent-primary/70"
                keyboardType="decimal-pad"
                textAlign="center"
                className={`mt-4 w-full font-serif text-7xl font-bold ${amountTone}`}
              />
            )}
          />
          {errors.amount && (
            <Text className="mt-2 text-xs text-danger">
              {errors.amount.message}
            </Text>
          )}
          <View className="mt-4 rounded-full bg-chip px-4 py-1.5">
            <Text className="text-xs font-semibold text-muted">USD</Text>
          </View>
        </View>

        {/* Origin account */}
        <Text className="mt-10 mb-3 text-xs uppercase tracking-widest text-muted">
          Origin account
        </Text>
        <Controller
          control={control}
          name="accountId"
          render={({ field: { value, onChange } }) => (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-3"
            >
              {ACCOUNTS.map((a) => {
                const selected = value === a.id;
                return (
                  <Pressable
                    key={a.id}
                    onPress={() => onChange(a.id)}
                    className={`h-28 w-40 justify-between rounded-2xl p-4 ${
                      selected
                        ? "border-2 border-selection bg-surface"
                        : "border-2 border-transparent bg-surface-dim"
                    }`}
                  >
                    <a.Icon size={22} color={selected ? secondary : muted} />
                    <View>
                      <Text
                        className={`font-serif text-base font-bold ${
                          selected ? "text-foreground" : "text-muted"
                        }`}
                      >
                        {a.name}
                      </Text>
                      <Text className="mt-0.5 text-xs text-muted">
                        {a.meta}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        />

        {/* Entity / source */}
        <Text className="mt-8 mb-3 text-xs uppercase tracking-widest text-muted">
          Entity / source
        </Text>
        <Controller
          control={control}
          name="entity"
          render={({ field: { value, onChange, onBlur } }) => (
            <View className="flex-row items-center rounded-xl bg-surface px-4">
              <Store size={22} color={muted} />
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="e.g. Blue Bottle Coffee"
                placeholderTextColorClassName="accent-placeholder"
                className="flex-1 py-4 pl-3 text-base text-foreground"
              />
            </View>
          )}
        />

        {/* Entry date */}
        <Text className="mt-8 mb-3 text-xs uppercase tracking-widest text-muted">
          Entry date
        </Text>
        <Controller
          control={control}
          name="date"
          render={({ field: { value, onChange } }) => (
            <Pressable
              // TODO: open a date picker and call onChange(selectedDate)
              onPress={() => onChange(new Date())}
              className="flex-row items-center rounded-xl bg-surface px-4 py-4"
            >
              <Calendar size={22} color={muted} />
              <Text className="ml-3 text-base text-foreground">
                {value.toLocaleDateString("en-US", {
                  month: "2-digit",
                  day: "2-digit",
                  year: "numeric",
                })}
              </Text>
            </Pressable>
          )}
        />

        {/* Classification */}
        <View className="mt-8 mb-4 flex-row items-center justify-between">
          <Text className="text-xs uppercase tracking-widest text-muted">
            Classification
          </Text>
          <Pressable hitSlop={8}>
            <Text className="text-xs font-semibold uppercase tracking-wide text-secondary">
              Manage all
            </Text>
          </Pressable>
        </View>
        <Controller
          control={control}
          name="categoryId"
          render={({ field: { value, onChange } }) => (
            <View className="flex-row flex-wrap gap-y-3">
              {CATEGORIES.map((c) => {
                const selected = value === c.id;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => onChange(c.id)}
                    className="w-1/4 items-center"
                  >
                    <View
                      className={`items-center rounded-2xl border-2 px-2.5 py-2 ${
                        selected ? "border-selection" : "border-transparent"
                      }`}
                    >
                      <View
                        className={`size-12 items-center justify-center rounded-xl ${
                          selected ? "bg-secondary" : "bg-tile"
                        }`}
                      >
                        <c.Icon
                          size={22}
                          color={selected ? onPrimary : foreground}
                        />
                      </View>
                      <Text
                        className={`mt-1.5 text-[10px] uppercase tracking-wide ${
                          selected ? "font-bold text-foreground" : "text-muted"
                        }`}
                      >
                        {c.label}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        />

        {/* Note */}
        <Text className="mt-8 mb-3 text-xs uppercase tracking-widest text-muted">
          Archival note
        </Text>
        <Controller
          control={control}
          name="note"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Append further context to this record..."
              placeholderTextColorClassName="accent-placeholder"
              multiline
              textAlignVertical="top"
              className="h-24 rounded-xl bg-surface p-4 text-base text-foreground"
            />
          )}
        />
      </ScrollView>

      {/* Footer action */}
      <View className="bg-background px-5 pt-3 pb-safe-or-4">
        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className={`items-center rounded-2xl py-4 shadow-lg active:opacity-90 disabled:opacity-60 ${buttonTone}`}
        >
          <Text className="text-sm font-bold uppercase tracking-widest text-on-primary">
            {isSubmitting ? "Saving..." : "Capture transaction"}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
