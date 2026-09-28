import GetStarted from "@/components/get-started";
import { useRouter } from "expo-router";

export default function OnboardingScreen() {
  const router = useRouter();
  return (
    <>
      <GetStarted onStart={() => router.replace("/")} />
    </>
  );
}
