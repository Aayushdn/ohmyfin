// src/components/dev-tools/styles.ts
import { StyleSheet } from "react-native";

export const MARGIN = 12; // gap from the screen edge
export const TAP_SLOP = 6; // movement (px) below which a touch counts as a tap

export const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 9999,
    elevation: 10,
  },

  // collapsed
  pillBox: {
    maxWidth: 240,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(20,20,30,0.88)",
  },
  pillText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },

  // expanded: a column holding the input row and, when open, the menu
  bar: {
    flexDirection: "column",
    gap: 8,
    padding: 8,
    borderRadius: 14,
    backgroundColor: "#14141E",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  grip: {
    width: 24,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  gripLine: {
    width: 14,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#8A8A99",
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#24242F",
    color: "#FFFFFF",
    fontSize: 14,
  },
  goButton: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#6F72D3",
    alignItems: "center",
    justifyContent: "center",
  },
  goText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  iconButton: {
    height: 40,
    width: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  iconButtonActive: {
    backgroundColor: "#24242F",
  },
  menuIcon: {
    color: "#C4C6FF",
    fontSize: 22,
    lineHeight: 24,
    fontWeight: "700",
  },
  closeButton: {
    height: 40,
    width: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    color: "#8A8A99",
    fontSize: 16,
  },

  // three-dot menu
  menu: {
    borderRadius: 10,
    backgroundColor: "#1C1C28",
    overflow: "hidden",
  },
  menuRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
  },
  menuRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#2C2C3A",
  },
  menuRowPressed: {
    backgroundColor: "#26263A",
  },
  menuRowDisabled: {
    opacity: 0.5,
  },
  menuLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  menuLabelDanger: {
    color: "#FF8A8A",
  },
  menuHint: {
    color: "#8A8A99",
    fontSize: 12,
  },
  menuStatus: {
    color: "#A9ACFF",
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#2C2C3A",
  },
});
