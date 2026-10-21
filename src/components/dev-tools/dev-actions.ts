// src/components/dev-tools/dev-actions.ts
// The things the three-dot menu can do. To add an action, add an object here.
import useAuth from "@/context/useAuth";
import useProfile from "@/context/useProfile";

export type DevAction = {
  id: string;
  label: string;
  hint: string;
  /** shown in red */
  destructive?: boolean;
  /** when set, the user must confirm with this message first */
  confirm?: string;
  /** returns the text shown as the result */
  run: () => string | Promise<string>;
};

export function useDevActions(): DevAction[] {
  const { signOut } = useAuth();
  const { profile, updateProfile, clearProfile } = useProfile();

  return [
    {
      id: "clear-session",
      label: "Clear session",
      hint: "Sign out of Supabase",
      run: async () => {
        await signOut();
        return "Session cleared";
      },
    },
    {
      id: "reset-onboarding",
      label: "Set onboarding to false",
      hint: profile
        ? "Keeps your data and shows onboarding again"
        : "No local profile yet",
      run: () => {
        if (!profile) return "No profile to update";
        updateProfile({ isOnboarded: false });
        return "isOnboarded = false";
      },
    },
    {
      id: "clear-profile",
      label: "Clear profile",
      hint: "Deletes the local user and everything under it",
      destructive: true,
      confirm:
        "This deletes the local user row, plus its categories, transactions and budgets.",
      run: () => {
        clearProfile();
        return "Profile deleted";
      },
    },
    {
      id: "reset-all",
      label: "Reset everything",
      hint: "Clear session and clear profile (fresh install)",
      destructive: true,
      confirm:
        "This signs you out and deletes the local user and all of its data.",
      run: async () => {
        await signOut();
        clearProfile();
        return "Signed out and profile deleted";
      },
    },
  ];
}
