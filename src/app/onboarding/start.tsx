// src/app/onboarding/index.tsx
import { Pressable, Text, View } from "react-native";
import { Redirect, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useAuth from "@/context/useAuth";
import useProfile from "@/context/useProfile";

export default function Welcome() {
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const { profile, createProfile } = useProfile();

  // Already logged in (e.g. just came back from the login screen):
  // skip this screen and go straight to the onboarding questions.
  console.log(session);
  if (session) return <Redirect href="/onboarding/profileSetup" />;

  function continueLocally() {
    // Creates the local user row + default categories (isOnboarded = false).
    // Skipped if the user already went through here and pressed back.
    if (!profile) createProfile();
    router.push("/onboarding/profileSetup");
  }

  return (
    <View
      className="flex-1 justify-between bg-white px-6"
      style={{ paddingTop: insets.top + 64, paddingBottom: insets.bottom + 24 }}
    >
      <View className="gap-3">
        <Text className="text-4xl font-bold text-gray-900">
          Track your money, your way
        </Text>
        <Text className="text-base text-gray-600">
          Log income and expenses, set budgets, and see where it all goes.
        </Text>
      </View>

      <View className="gap-3">
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/auth/login")}
          className="items-center rounded-2xl bg-blue-600 py-4 active:opacity-80"
        >
          <Text className="text-base font-semibold text-white">
            Login / Sign up with us
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={continueLocally}
          className="items-center rounded-2xl border border-gray-300 py-4 active:bg-gray-100"
        >
          <Text className="text-base font-semibold text-gray-900">
            Continue locally
          </Text>
        </Pressable>

        <Text className="text-center text-sm text-gray-500">
          Continuing locally keeps your data on this device. You can create an
          account later in Settings.
        </Text>
      </View>
    </View>
  );
}
