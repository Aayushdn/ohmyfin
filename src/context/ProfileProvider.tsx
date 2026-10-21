// src/context/ProfileProvider.tsx
import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User, NewUser } from "../db/schema";
import {
  createLocalUser,
  getFirstUser,
  updateUser,
  deleteAllProfiles,
} from "../data/users";

export type ProfileContextValue = {
  profile: User | null; // null = onboarding not finished
  createProfile: (input?: Omit<NewUser, "userId">) => void;
  updateProfile: (patch: Partial<NewUser>) => void;
  linkAccount: (authId: string, email?: string | null) => void;
  clearProfile: () => void;
};

export const ProfileContext = createContext<ProfileContextValue | null>(null);

export default function ProfileProvider({ children }: { children: ReactNode }) {
  // Sync read on first render; this provider only renders after migrations succeed.
  const [profile, setProfile] = useState<User | null>(() => getFirstUser());

  const createProfile = useCallback(
    (input: Omit<NewUser, "userId"> = {}) => setProfile(createLocalUser(input)),
    [],
  );

  const updateProfile = useCallback(
    (patch: Partial<NewUser>) => {
      if (profile) setProfile(updateUser(profile.userId, patch));
    },
    [profile],
  );

  const linkAccount = useCallback(
    (authId: string, email?: string | null) =>
      updateProfile({ authId, emailAddress: email }),
    [updateProfile],
  );

  //dev temporary
  const clearProfile = useCallback(() => {
    deleteAllProfiles();
    setProfile(null); // route guards send you back to onboarding
  }, []);

  const value = useMemo(
    () => ({
      profile,
      createProfile,
      updateProfile,
      linkAccount,
      clearProfile,
    }),
    [profile, createProfile, updateProfile, linkAccount, clearProfile],
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}
