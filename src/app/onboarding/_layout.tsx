import { Stack } from "expo-router";

export default function StackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="profileSetup"
        options={{
          animation: "slide_from_bottom",
          // optional extras
          gestureDirection: "vertical", // swipe down to dismiss
          headerShown: false,
        }}
      />
    </Stack>
  );
}
