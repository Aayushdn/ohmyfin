import GetStarted from "@/components/get-started";
import { useRouter, Redirect } from "expo-router";

import useAuth from "@/context/useAuth";
import useProfile from "@/context/useProfile";

export default function OnboardingScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { profile, createProfile } = useProfile();

  // Logged in already (back from login): skip straight to the questions
  // signOut();
  if (session) return <Redirect href="/onboarding/profileSetup" />;
  // if (session) return <Redirect href="/(app)/(tabs)" />;
  return (
    <>
      <GetStarted
        onLogin={() => router.push("/auth/login")}
        onContinueLocally={() => {
          if (!profile) createProfile({ currency: "EUR" }); // user row + default categories
          router.push("/onboarding/profileSetup");
        }}
      />
    </>
  );
}
