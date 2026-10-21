// src/components/wizard/chip.tsx
import { Pressable, Text } from "react-native";

/**
 * A small pill. `active` is the filled white state.
 * role "checkbox" shows a ✓ when active; role "button" is for actions like remove.
 */
export default function Chip({
  label,
  active,
  onPress,
  role = "checkbox",
  accessibilityLabel,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  role?: "checkbox" | "button";
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={role}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={role === "checkbox" ? { checked: active } : undefined}
      className={
        active
          ? "rounded-full bg-white px-4 py-2"
          : "rounded-full border border-white/40 bg-white/10 px-4 py-2"
      }
    >
      <Text
        className={
          active
            ? "text-sm font-medium text-background-element"
            : "text-sm text-white/70"
        }
      >
        {role === "checkbox" && active ? "✓ " : ""}
        {label}
      </Text>
    </Pressable>
  );
}
