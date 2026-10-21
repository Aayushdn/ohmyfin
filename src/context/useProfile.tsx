// src/context/useProfile.tsx
import { useContext } from "react";
import { ProfileContext } from "./ProfileProvider";

export default function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used inside ProfileProvider");
  return ctx;
}

// For screens inside (app): the route guard guarantees a profile exists.
export function useCurrentUserId(): number {
  const { profile } = useProfile();
  if (!profile) throw new Error("No profile: used outside the (app) group?");
  return profile.userId;
}
