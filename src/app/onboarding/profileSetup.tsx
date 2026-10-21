// src/app/onboarding/profileSetup.tsx
import { useEffect, useRef } from "react";
import Wizard from "@/components/wizard/wizard";
import useAuth from "@/context/useAuth";
import useProfile from "@/context/useProfile";

export default function ProfileSetup() {
  const { session } = useAuth();
  const { profile, createProfile } = useProfile();
  const creating = useRef(false);

  // A user who logged in arrives here without a local row yet. Create it
  // once, so every wizard step has a profile to save into.
  useEffect(() => {
    if (profile || creating.current) return;
    creating.current = true;
    createProfile({
      authId: session?.user.id,
      emailAddress: session?.user.email,
    });
  }, [profile, session, createProfile]);

  if (!profile) return null;
  return <Wizard profile={profile} />;
}
