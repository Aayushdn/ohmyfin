import { View, Text } from "react-native";
import { Stack } from "expo-router";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import * as SplashScreen from "expo-splash-screen";
import { Uniwind } from "uniwind";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { DevPathNavigator } from "@/components/dev-tools";
import AuthProvider from "@/context/AuthProvider";
import useAuth from "@/context/useAuth";
import ProfileProvider from "@/context/ProfileProvider";
import useProfile from "@/context/useProfile";

import { db } from "../db/client";
import migrations from "../../drizzle/migrations";

SplashScreen.preventAutoHideAsync();
Uniwind.setTheme("light");

function RootNavigator() {
  const { session, isLoading } = useAuth();
  const { profile } = useProfile();

  if (isLoading) return null; // wait for the Supabase session to restore

  const isOnboarded = profile?.isOnboarded ?? false;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Order matters: the first available screen is the landing screen */}
      <Stack.Protected guard={isOnboarded}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>

      <Stack.Protected guard={!isOnboarded}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>

      {/* Guests stay able to reach login/signup later */}
      <Stack.Protected guard={!session}>
        <Stack.Screen name="auth" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  // Migrations run here, ABOVE ProfileProvider, so the users table exists
  // before ProfileProvider's first render queries it.
  const { success, error } = useMigrations(db, migrations);

  return (
    <>
      <AuthProvider>
        <AnimatedSplashOverlay />
        {error ? (
          <View>
            <Text>{String((error as any).cause ?? "")}</Text>
          </View>
        ) : success ? (
          <ProfileProvider>
            <RootNavigator />
            {/* dev-only, renders nothing in production */}
            <DevPathNavigator />
          </ProfileProvider>
        ) : null}
      </AuthProvider>
    </>
  );
}
