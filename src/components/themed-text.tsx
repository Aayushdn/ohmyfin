import { Text, type TextProps } from "react-native";

import { Fonts } from "@/constants/theme";

export type ThemedTextProps = TextProps & {
  type?:
    | "default"
    | "title"
    | "small"
    | "smallBold"
    | "subtitle"
    | "link"
    | "linkPrimary"
    | "code";

  themeColor?:
    | "text"
    | "background"
    | "backgroundElement"
    | "backgroundSelected"
    | "textSecondary";
};

const typeStyles = {
  default: "text-base leading-6 font-medium",
  title: "text-5xl leading-[52px] font-semibold",
  small: "text-sm leading-5 font-medium",
  smallBold: "text-sm leading-5 font-bold",
  subtitle: "text-[32px] leading-[44px] font-semibold",
  link: "text-sm leading-[30px]",
  linkPrimary: "text-sm leading-[30px] text-primary",
  code: "text-xs",
} as const;

const themeColorStyles = {
  text: "text-text",
  background: "text-background",
  backgroundElement: "text-background-element",
  backgroundSelected: "text-background-selected",
  textSecondary: "text-text-secondary",
} as const;

export function ThemedText({
  className,
  type = "default",
  themeColor = "text",
  ...rest
}: ThemedTextProps) {
  return (
    <Text
      className={`${typeStyles[type]} ${themeColorStyles[themeColor]} ${
        className ?? ""
      }`}
      style={type === "code" ? { fontFamily: Fonts?.mono } : undefined}
      {...rest}
    />
  );
}
