import * as Device from "expo-device";
import { Button, Platform, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AnimatedIcon } from "@/components/animated-icon";
import { HintRow } from "@/components/hint-row";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { WebBadge } from "@/components/web-badge";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";

import { useRouter } from "expo-router";

import "../global.css";
import { Link } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View className="flex justify-center items-center flex-1">
      <Text className="text-black">Hello world</Text>
      <Button title="Go to start" onPress={() => router.push("/onboarding")} />
    </View>
  );
}
