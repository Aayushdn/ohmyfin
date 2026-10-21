// src/components/wizard/wizard.tsx
// The shell: progress bar, Back / Skip, Continue, and saving.
// It knows nothing about individual questions; those live in steps.tsx.
import { useEffect, useRef, useState } from "react";
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useProfile from "@/context/useProfile";
import { applyOnboardingChoices } from "@/data/onboarding";
import type { NewUser, User } from "@/db/schema";
import { buildBudgetInput, emptyBudgetDraft } from "./budget-helpers";
import { STEPS } from "./steps";
import type { Draft, FieldsStep, SingleStep, Step } from "./types";

function isValid(step: Step, draft: Draft): boolean {
  switch (step.kind) {
    case "fields":
      return step.fields.every(
        (f) => !f.required || draft[f.key].trim().length > 0,
      );
    case "single":
      return draft[step.field] !== null;
    case "custom":
      return step.canContinue?.(draft) ?? true;
  }
}

/** The users-table columns a config step saves when the user presses Continue. */
function userPatch(
  step: FieldsStep | SingleStep,
  draft: Draft,
): Partial<NewUser> {
  const patch: Partial<NewUser> = {};

  for (const key of step.saves) {
    if (key === "firstName") {
      const text = draft.firstName.trim();
      patch.firstName = text === "" ? null : text;
    } else if (key === "secondName") {
      const text = draft.secondName.trim();
      patch.secondName = text === "" ? null : text;
    } else if (key === "currency") {
      patch.currency = draft.currency;
    }
  }

  return patch;
}

export default function Wizard({ profile }: { profile: User }) {
  const insets = useSafeAreaInsets();
  const { updateProfile } = useProfile();

  const [index, setIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  // Start from whatever is already saved, so a returning user sees their answers
  const [draft, setDraftState] = useState<Draft>(() => ({
    firstName: profile.firstName ?? "",
    secondName: profile.secondName ?? "",
    currency: profile.currency ?? null,
    removedCategoryIds: [],
    customCategories: [],
    budget: emptyBudgetDraft(),
  }));
  const finishing = useRef(false); // stops a double tap on Finish saving twice

  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;
  const canContinue = isValid(step, draft);
  const setDraft = (patch: Partial<Draft>) =>
    setDraftState((d) => ({ ...d, ...patch }));

  // Android hardware back goes to the previous step instead of leaving the wizard
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (index === 0) return false;
      setIndex(index - 1);
      return true;
    });
    return () => sub.remove();
  }, [index]);

  /** save = true for Continue, false for Skip (discards this step's input) */
  function next(save: boolean) {
    if (finishing.current) return;
    setError(null);

    try {
      // Name and currency are saved to the users row straight away
      if (save && step.kind !== "custom") {
        updateProfile(userPatch(step, draft));
      }

      // Skipping a custom step throws away whatever was entered on it
      const reset =
        !save && step.kind === "custom" ? step.resetOnSkip : undefined;
      const finalDraft = reset ? { ...draft, ...reset } : draft;
      if (reset) setDraft(reset);

      if (!isLast) {
        setIndex((i) => i + 1);
        return;
      }

      // Last step: categories, budget and the onboarded flag are saved together
      finishing.current = true;
      try {
        applyOnboardingChoices(profile.userId, {
          removeIds: finalDraft.removedCategoryIds,
          custom: finalDraft.customCategories,
          budget: buildBudgetInput(finalDraft.budget),
        });
        updateProfile({ isOnboarded: true }); // the route guard moves the user into (app)
      } catch (e) {
        finishing.current = false;
        throw e;
      }
    } catch {
      setError("Couldn't save that. Please try again.");
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-background-element"
    >
      {/* header: back, skip, progress */}
      <View className="gap-4 px-5" style={{ paddingTop: insets.top + 12 }}>
        <View className="h-10 flex-row items-center justify-between">
          {index > 0 ? (
            <Pressable
              onPress={() => setIndex(index - 1)}
              accessibilityRole="button"
              accessibilityLabel="Back"
              hitSlop={12}
            >
              <Text className="text-base text-white">‹ Back</Text>
            </Pressable>
          ) : (
            <View />
          )}
          <Pressable
            onPress={() => next(false)}
            accessibilityRole="button"
            hitSlop={12}
          >
            <Text className="text-base text-white/80">Skip</Text>
          </Pressable>
        </View>

        <View
          className="flex-row gap-2"
          accessibilityRole="progressbar"
          accessibilityLabel={`Step ${index + 1} of ${STEPS.length}`}
        >
          {STEPS.map((s, i) => (
            <View
              key={s.id}
              className={
                i <= index
                  ? "h-1 flex-1 rounded-full bg-white"
                  : "h-1 flex-1 rounded-full bg-white/25"
              }
            />
          ))}
        </View>
      </View>

      {/* body */}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 28,
          paddingBottom: 24,
          gap: 24,
        }}
      >
        <View className="gap-2">
          <Text className="text-3xl font-bold text-white">{step.title}</Text>
          <Text className="text-base text-white/75">{step.subtitle}</Text>
        </View>

        {step.kind === "fields" && (
          <View className="gap-4">
            {step.fields.map((f) => (
              <View key={f.key} className="gap-2">
                <Text className="text-sm font-medium text-white/80">
                  {f.label}
                </Text>
                <TextInput
                  id={`field-${f.key}`}
                  value={draft[f.key]}
                  onChangeText={(v) => setDraft({ [f.key]: v })}
                  placeholder={f.placeholder}
                  placeholderTextColor="#8c8a8f"
                  autoCapitalize="words"
                  autoCorrect={false}
                  className="rounded-2xl bg-white px-4 py-3.5 text-base text-neutral-900"
                />
              </View>
            ))}
          </View>
        )}

        {step.kind === "single" && (
          <View className="gap-3">
            {step.options.map((o) => {
              const selected = draft[step.field] === o.value;
              return (
                <Pressable
                  key={o.value}
                  onPress={() => setDraft({ [step.field]: o.value })}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  className={
                    selected
                      ? "flex-row items-center justify-between rounded-2xl bg-white px-4 py-4"
                      : "flex-row items-center justify-between rounded-2xl border border-white/30 bg-white/15 px-4 py-4"
                  }
                >
                  <Text
                    className={
                      selected
                        ? "text-base font-medium text-background-element"
                        : "text-base text-white"
                    }
                  >
                    {o.hint ? `${o.hint}   ` : ""}
                    {o.label}
                  </Text>
                  <Text
                    className={
                      selected
                        ? "text-sm font-semibold text-background-element"
                        : "text-sm text-white/70"
                    }
                  >
                    {o.value}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {step.kind === "custom" && (
          <step.Component
            draft={draft}
            setDraft={setDraft}
            userId={profile.userId}
          />
        )}
      </ScrollView>

      {/* footer */}
      <View
        className="gap-3 px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        {error ? (
          <Text className="text-center text-sm text-white">{error}</Text>
        ) : null}
        <Pressable
          onPress={() => next(true)}
          disabled={!canContinue}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canContinue }}
          className={
            canContinue
              ? "items-center rounded-2xl bg-white py-4 active:opacity-80"
              : "items-center rounded-2xl bg-white/30 py-4"
          }
        >
          <Text
            className={
              canContinue
                ? "text-base font-semibold text-background-element"
                : "text-base font-semibold text-white/60"
            }
          >
            {isLast ? "Finish" : "Continue"}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
