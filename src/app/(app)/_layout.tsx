import { Pressable } from "react-native";
import { Stack } from "expo-router";
import { useCSSVariable } from "uniwind";
import { useRouter } from "expo-router";
import { X } from "lucide-react-native";

export default function appLayout() {
  const [foreground, surface] = useCSSVariable([
    "--color-foreground",
    "--color-surface",
  ]) as string[];
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="add-transaction"
        options={{
          title: "New Entry",
          headerTitleAlign: "center",
          headerShadowVisible: true,
          headerStyle: { backgroundColor: surface },
          headerTitleStyle: {
            color: foreground,
            fontFamily: "NotoSerif-Bold",
            fontSize: 18,
          },
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <X size={24} color={foreground} />
            </Pressable>
          ),
        }}
      ></Stack.Screen>
    </Stack>
  );
}
