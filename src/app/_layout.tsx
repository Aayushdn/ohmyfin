import * as SplashScreen from "expo-splash-screen";
import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { DevPathNavigator } from "@/components/dev-path-navigator";

import { Stack } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  return (
    <>
      <AnimatedSplashOverlay />
      <Stack>
        <Stack.Screen
          name="onboarding"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
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
        />

        <Stack.Screen
          name="(app)"
          options={{
            headerShown: false,
          }}
        />
      </Stack>

      {/* dev-only, renders nothing in production */}
      <DevPathNavigator />
    </>
  );
}
