// src/components/wizard/types.ts
import type { ComponentType } from "react";
import type { CategoryRef, CustomCategory } from "@/data/onboarding";

/** One category the user wants a spending limit for. */
export type BudgetRuleDraft = {
  category: CategoryRef;
  /** as typed, in the user's currency (e.g. "250.50"); converted to cents on save */
  amount: string;
  /** optional warning level, same format; "" means none */
  threshold: string;
};

export type BudgetDraft = {
  name: string;
  /** "month" = the current calendar month; "custom" = the two dates below */
  period: "month" | "custom";
  startDate: string; // 'YYYY-MM-DD', only used when period is "custom"
  endDate: string; // 'YYYY-MM-DD', only used when period is "custom"
  isRecurring: boolean;
  /** no rules means no budget is created */
  rules: BudgetRuleDraft[];
};

/** Everything the user has entered so far. Lives in the wizard's state. */
export type Draft = {
  firstName: string;
  secondName: string;
  currency: string | null;
  /** categories the user unticked; deleted when they finish */
  removedCategoryIds: number[];
  /** categories the user added; inserted when they finish */
  customCategories: CustomCategory[];
  budget: BudgetDraft;
};

/** Columns on the users table that a step can save on "Continue". */
export type UserField = "firstName" | "secondName" | "currency";

/** Props every custom step component receives. */
export type StepProps = {
  draft: Draft;
  setDraft: (patch: Partial<Draft>) => void;
  userId: number;
};

type StepBase = { id: string; title: string; subtitle: string };

/** One or more text inputs, driven by config. */
export type FieldsStep = StepBase & {
  kind: "fields";
  fields: {
    key: "firstName" | "secondName";
    label: string;
    placeholder: string;
    required?: boolean;
  }[];
  saves: UserField[];
};

/** Pick exactly one option, driven by config. */
export type SingleStep = StepBase & {
  kind: "single";
  field: "currency";
  options: { value: string; label: string; hint?: string }[];
  saves: UserField[];
};

/** A hand-built component for steps that don't fit the config kinds. */
export type CustomStep = StepBase & {
  kind: "custom";
  Component: ComponentType<StepProps>;
  canContinue?: (draft: Draft) => boolean;
  /** draft values restored when the user skips this step */
  resetOnSkip?: Partial<Draft>;
};

export type Step = FieldsStep | SingleStep | CustomStep;
