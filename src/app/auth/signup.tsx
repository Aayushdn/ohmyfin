import { ThemedText } from "@/components/themed-text";

import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { Controller, useForm } from "react-hook-form";

import { supabase } from "@/utils/supabase";
import { useRouter, Link } from "expo-router";
import { PasswordInput } from "@/components/password-input";

type SignupForm = {
  email: string;
  password: string;
};

export default function SignupScreen() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (formData: SignupForm) => {
    // formData validation
    if (formData.email.trim().length == 0 || formData.password.length < 2)
      return;

    // signup process to supabse

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        throw error;
      }
      if (!data.session) {
        throw error;
      }
      router.replace("/(app)");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View className="flex-1 justify-center px-6">
      <ThemedText type="title" className="text-black text-center">
        SIGN UP
      </ThemedText>
      <ThemedText
        type="default"
        themeColor="textSecondary"
        className="text-center text-slate-800"
      >
        Sign up to Ohmyfin{" "}
      </ThemedText>

      {/* email */}
      <Text className="mb-2">Email</Text>

      <Controller
        control={control}
        name="email"
        rules={{
          required: "Email is required",
          pattern: {
            value: /^\S+@\S+\.\S+$/,
            message: "Enter a valid email",
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className="rounded-lg border border-gray-300 px-4 py-3"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />

      {errors.email && (
        <Text className="mt-1 text-red-500">{errors.email.message}</Text>
      )}

      {/* password */}
      <Text className="mb-2 mt-4">Password</Text>

      {/* <Controller
        control={control}
        name="password"
        rules={{
          required: "Password is required",
          minLength: {
            value: 6,
            message: "Password must be at least 6 characters",
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className="rounded-lg border border-gray-300 px-4 py-3"
            placeholder="Enter your password"
            secureTextEntry
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      /> */}
      <PasswordInput
        control={control}
        name="password"
        rules={{
          required: "Password is required",
          minLength: {
            value: 8,
            message: "Password must be at least 8 characters",
          },
        }}
      />

      {errors.password && (
        <Text className="mt-1 text-red-500">{errors.password.message}</Text>
      )}

      {/* submit */}
      <Pressable
        className="my-6 rounded-lg bg-background-element py-4"
        onPress={handleSubmit(onSubmit)}
      >
        <Text className="text-center font-bold text-white">Create Account</Text>
      </Pressable>

      <Text className="text-center">Already have a account with us</Text>
      <ThemedText type="link" className="text-blue-700 text-center">
        <Link href="/auth/login">Login to your account</Link>
      </ThemedText>
    </View>
  );
}
