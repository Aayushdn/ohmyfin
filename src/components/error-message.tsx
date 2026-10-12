import { View } from "react-native";
import { ThemedText } from "./themed-text";

export default function ErrorMessage({ message }: { message: String }) {
  return (
    <View>
      <ThemedText
        type="error"
        themeColor="error"
        className="my-2 p-2 bg-red-300 rounded-sm text-red-700"
      >
        {message}
      </ThemedText>
    </View>
  );
}
