import { Button, Platform, StyleSheet, Text, View } from "react-native";

import { Link, useRouter } from "expo-router";
import useAuth from "@/context/useAuth";
export default function HomeScreen() {
  const router = useRouter();
  const { signOut } = useAuth();

  return (
    <View className="flex justify-center items-center flex-1">
      <Text>Hello world</Text>
      <Text>Hello world</Text>
      <Text>Hello world</Text>
      <Text>Hello world</Text>
      <Text>Hello world</Text>
      {/* <Button title="Go to start" onPress={() => router.push("/onboarding")} /> */}

      {/* <Button title="Signout" onPress={() => signOut()} /> */}
      {/* <Button
        title="ADD TRANSACTION  "
        onPress={() => router.push("/(app)/addTransaction")}
      /> */}
      <Link href="/(app)/add-transaction">
        <Text>ADD TRANSACTION</Text>
      </Link>
    </View>
  );
}
