import { ThemedText } from "@/components/themed-text";

import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { Controller, useForm } from "react-hook-form";

import { Link, useRouter } from "expo-router";
import ErrorMessage from "@/components/error-message";
import { useState } from "react";

import { Loader } from "lucide-react-native";

import { supabase } from "@/utils/supabase";
import { AuthError } from "@supabase/supabase-js";
import useAuth from "@/context/useAuth";
import { PasswordInput } from "@/components/password-input";
type LoginForm = {
  email: string;
  password: string;
};

export default function LoginScreen() {
  const router = useRouter();
  const [error, setError] = useState<String>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (formData: LoginForm) => {
    console.log("Pressed");
    if (formData.email.trim().length == 0 || formData.password.length < 6)
      return;

    try {
      setIsSubmitting(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        throw error;
      }
      if (!data.session) {
        throw error;
      }
      setIsSubmitting(false);
      router.replace("/(app)");
    } catch (error: any) {
      console.log(error.toJSON());
      setError(error.toJSON().message);
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 justify-center px-6">
      <ThemedText type="title" className="text-black text-center">
        LOGIN
      </ThemedText>

      <ThemedText
        type="default"
        themeColor="textSecondary"
        className="text-center text-slate-800"
      >
        Login to Ohmyfin{" "}
      </ThemedText>
      {error ? <ErrorMessage message={error} /> : ""}

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
            className="rounded-lg border border-gray-300 px-6 py-3"
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

      {/* submit */}
      {!isSubmitting ? (
        <Pressable
          className="my-6 rounded-lg bg-background-element py-4"
          onPress={handleSubmit(onSubmit)}
        >
          <Text className="text-center font-bold text-white">Login</Text>
        </Pressable>
      ) : (
        <Pressable
          className="my-6 rounded-lg bg-background-selected py-4 "
          onPress={handleSubmit(onSubmit)}
          disabled={true}
        >
          <View className="flex justify-around flex-row items-center px-4">
            <Text className="text-center font-bold text-slate-300 flex-1">
              Login
            </Text>
            <Loader color="white" />
          </View>
        </Pressable>
      )}

      <Text className="text-center">Dont have a account with us?</Text>
      <ThemedText type="link" className="text-blue-700 text-center">
        <Link href="/auth/signup">Create a New Account</Link>
      </ThemedText>
    </View>
  );
}
