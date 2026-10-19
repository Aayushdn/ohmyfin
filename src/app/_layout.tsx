import * as SplashScreen from "expo-splash-screen";
import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { DevPathNavigator } from "@/components/dev-path-navigator";

import { Stack } from "expo-router";
import AuthProvider from "@/context/AuthProvider";
import useAuth from "@/context/useAuth";
import ProfileProvider from "@/context/ProfileProvider";
import useProfile from "@/context/useProfile";

import { Uniwind } from "uniwind";

SplashScreen.preventAutoHideAsync();
Uniwind.setTheme("light");

function RootNavigator() {
  const { session, isLoading } = useAuth();
  const { isOnboarded } = useProfile();

  return (
    <Stack>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="auth" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={!isOnboarded}>
        <Stack.Screen
          name="onboarding"
          options={{
            headerShown: false,
          }}
        />
      </Stack.Protected>

      <Stack.Protected guard={!!session && !!isOnboarded}>
        <Stack.Screen
          name="(app)"
          options={{
            headerShown: false,
          }}
        />
      </Stack.Protected>

      {/* <Stack.Screen
        name="index"
        options={{
          headerStyle: {
            backgroundColor: "#f4511e",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      /> */}
    </Stack>
  );
}
export default function RootLayout() {
  return (
    <>
      <AuthProvider>
        <AnimatedSplashOverlay />
        <ProfileProvider>
          <RootNavigator />
        </ProfileProvider>
      </AuthProvider>
      {/* dev-only, renders nothing in production */}
      <DevPathNavigator />
    </>
  );
}
