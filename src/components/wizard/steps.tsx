// src/components/wizard/steps.tsx
// The whole onboarding flow, in order. To add a simple question, add an
// object here. For anything custom, point `Component` at your own component.
import BudgetStep from "./budget-step";
import { emptyBudgetDraft, validateBudget } from "./budget-helpers";
import CategoriesStep from "./categories-step";
import type { Step } from "./types";

export const STEPS: Step[] = [
  {
    id: "name",
    kind: "fields",
    title: "What should we call you?",
    subtitle: "We'll use this to greet you in the app.",
    fields: [
      {
        key: "firstName",
        label: "First name",
        placeholder: "Alex",
        required: true,
      },
      { key: "secondName", label: "Last name", placeholder: "Murphy" },
    ],
    saves: ["firstName", "secondName"],
  },
  {
    id: "currency",
    kind: "single",
    title: "Which currency do you use?",
    subtitle: "Amounts are shown in this currency. You can change it later.",
    field: "currency",
    options: [
      { value: "EUR", label: "Euro", hint: "€" },
      { value: "GBP", label: "Pound sterling", hint: "£" },
      { value: "USD", label: "US dollar", hint: "$" },
      { value: "INR", label: "Indian rupee", hint: "₹" },
      { value: "AUD", label: "Australian dollar", hint: "A$" },
      { value: "CAD", label: "Canadian dollar", hint: "C$" },
      { value: "JPY", label: "Japanese yen", hint: "¥" },
      { value: "CHF", label: "Swiss franc", hint: "Fr" },
    ],
    saves: ["currency"],
  },
  {
    id: "categories",
    kind: "custom",
    title: "Pick your categories",
    subtitle: "Untick any you won't use, or add your own.",
    Component: CategoriesStep,
    resetOnSkip: { removedCategoryIds: [], customCategories: [] },
  },
  {
    id: "budget",
    kind: "custom",
    title: "Set up a budget",
    subtitle:
      "Optional. Choose categories and set how much you want to spend in each.",
    Component: BudgetStep,
    canContinue: (draft) => validateBudget(draft.budget) === null,
    resetOnSkip: { budget: emptyBudgetDraft() },
  },
];
