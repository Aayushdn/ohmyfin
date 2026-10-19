import type { LucideIcon } from "lucide-react-native";
import { useCSSVariable } from "uniwind";

type Props = {
  /** A lucide icon component, e.g. `icon={Search}` */
  icon: LucideIcon;
  size?: number;
  strokeWidth?: number;
  /** Any theme token from global.css, e.g. "--color-muted" */
  colorVar?: string;
};

/**
 * Lucide icons need a raw colour value, so we resolve it from the theme
 * variable. It stays in sync with light/dark mode automatically.
 */
export function Icon({
  icon: LucideComponent,
  size = 20,
  strokeWidth = 2,
  colorVar = "--color-foreground",
}: Props) {
  const color = useCSSVariable(colorVar);
  return (
    <LucideComponent
      size={size}
      strokeWidth={strokeWidth}
      color={typeof color === "string" ? color : undefined}
    />
  );
}
