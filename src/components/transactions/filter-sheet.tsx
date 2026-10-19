import { Check, ChevronDown, ChevronUp } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/ui/icon";
import { EMPTY_FILTERS, type Filters } from "@/data/transactions";

type Props = {
  visible: boolean;
  filters: Filters;
  vendors: string[];
  categories: string[];
  onClose: () => void;
  onApply: (filters: Filters) => void;
};

export function FilterSheet({
  visible,
  filters,
  vendors,
  categories,
  onClose,
  onApply,
}: Props) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<Filters>(filters);

  // Start from the applied filters every time the sheet opens.
  useEffect(() => {
    if (visible) setDraft(filters);
  }, [visible, filters]);

  const setAmount = (key: "min" | "max", value: string) =>
    setDraft((d) => ({ ...d, [key]: value.replace(/[^0-9.]/g, "") }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-end"
      >
        {/* Backdrop */}
        <Pressable className="absolute inset-0 bg-scrim" onPress={onClose} />

        {/* Sheet */}
        <View
          className="rounded-t-3xl bg-surface px-5 pt-3"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <View className="mb-4 h-1 w-10 self-center rounded-full bg-secondary" />

          <Text className="mb-5 text-center text-base font-bold text-foreground">
            Filter Transactions
          </Text>

          <MultiSelect
            label="Vendor"
            placeholder="Select vendors..."
            options={vendors}
            selected={draft.vendors}
            onChange={(vendors) => setDraft((d) => ({ ...d, vendors }))}
          />

          <MultiSelect
            label="Categories"
            placeholder="Choose categories..."
            options={categories}
            selected={draft.categories}
            onChange={(categories) => setDraft((d) => ({ ...d, categories }))}
          />

          <Text className="mb-2 text-xs font-semibold text-foreground">
            Transaction Amount
          </Text>
          <View className="mb-6 flex-row items-center">
            <TextInput
              value={draft.min}
              onChangeText={(v) => setAmount("min", v)}
              placeholder="Min"
              placeholderTextColorClassName="accent-placeholder"
              keyboardType="decimal-pad"
              className="h-11 flex-1 rounded-lg border border-line bg-surface-dim px-3 text-sm text-foreground"
            />
            <Text className="mx-3 text-xs font-semibold text-foreground">To</Text>
            <TextInput
              value={draft.max}
              onChangeText={(v) => setAmount("max", v)}
              placeholder="Max"
              placeholderTextColorClassName="accent-placeholder"
              keyboardType="decimal-pad"
              className="h-11 flex-1 rounded-lg border border-line bg-surface-dim px-3 text-sm text-foreground"
            />
          </View>

          <View className="flex-row gap-3">
            <Pressable
              onPress={() => setDraft(EMPTY_FILTERS)}
              className="h-12 items-center justify-center rounded-xl border border-line px-5 active:bg-surface-dim"
            >
              <Text className="text-sm font-semibold text-foreground">Reset</Text>
            </Pressable>

            {/* Primary button uses --color-background-element */}
            <Pressable
              onPress={() => onApply(draft)}
              className="h-12 flex-1 items-center justify-center rounded-xl bg-background-element active:opacity-80"
            >
              <Text className="text-sm font-bold text-on-primary">Apply Filters</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */

type MultiSelectProps = {
  label: string;
  placeholder: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
};

function MultiSelect({
  label,
  placeholder,
  options,
  selected,
  onChange,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  const toggle = (option: string) =>
    onChange(
      selected.includes(option)
        ? selected.filter((o) => o !== option)
        : [...selected, option],
    );

  return (
    <View className="mb-4">
      <Text className="mb-2 text-xs font-semibold text-foreground">{label}</Text>

      <Pressable
        onPress={() => setOpen((o) => !o)}
        className="h-11 flex-row items-center justify-between rounded-lg border border-line bg-surface-dim px-3"
      >
        <Text
          numberOfLines={1}
          className={`mr-2 flex-1 text-sm ${
            selected.length ? "text-foreground" : "text-placeholder"
          }`}
        >
          {selected.length ? selected.join(", ") : placeholder}
        </Text>
        <Icon
          icon={open ? ChevronUp : ChevronDown}
          size={16}
          colorVar="--color-muted"
        />
      </Pressable>

      {open && (
        <ScrollView
          nestedScrollEnabled
          className="mt-2 max-h-40 rounded-lg border border-line bg-surface"
        >
          {options.map((option) => {
            const checked = selected.includes(option);
            return (
              <Pressable
                key={option}
                onPress={() => toggle(option)}
                className="flex-row items-center px-3 py-3 active:bg-surface-dim"
              >
                <View
                  className={`mr-3 size-5 items-center justify-center rounded border ${
                    checked
                      ? "border-background-element bg-background-element"
                      : "border-line bg-surface"
                  }`}
                >
                  {checked && (
                    <Icon icon={Check} size={14} strokeWidth={3} colorVar="--color-on-primary" />
                  )}
                </View>
                <Text className="text-sm text-foreground">{option}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
