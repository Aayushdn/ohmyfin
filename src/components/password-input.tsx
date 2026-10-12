import { useState } from "react";
import {
  View,
  TextInput,
  Pressable,
  Text,
  StyleSheet,
  TextInputProps,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import {
  Control,
  Controller,
  FieldValues,
  Path,
  RegisterOptions,
} from "react-hook-form";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  placeholder?: string;
  rules?: RegisterOptions<T, Path<T>>;
} & Omit<
  TextInputProps,
  "value" | "onChangeText" | "onBlur" | "secureTextEntry"
>;

export function PasswordInput<T extends FieldValues>({
  control,
  name,
  rules,
  placeholder = "Password",
  ...rest
}: Props<T>) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({
        field: { value, onChange, onBlur },
        fieldState: { error },
      }) => (
        <View>
          <View style={[styles.container, error && styles.errorBorder]}>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={placeholder}
              secureTextEntry={!isVisible}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
              {...rest}
            />
            <Pressable
              onPress={() => setIsVisible((v) => !v)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={isVisible ? "Hide password" : "Show password"}
            >
              <Text>
                {!isVisible ? (
                  <Eye size={22} color="#666" />
                ) : (
                  <EyeOff size={22} color="#666" />
                )}
              </Text>
            </Pressable>
          </View>
          {error && <Text className="mt-1 text-red-500">{error.message}</Text>}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: { flex: 1, paddingVertical: 12, fontSize: 16 },
  errorBorder: { borderColor: "red" },
  errorText: { color: "red", marginTop: 4, fontSize: 12 },
});
