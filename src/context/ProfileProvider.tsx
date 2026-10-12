import { createContext, useState } from "react";

type ProfileType = {
  isOnboarded: boolean;
  fullName: String | null;
};

export const ProfileContext = createContext({
  isOnboarded: false,
  fullName: "",
});

/** Temporary Profiel Provider TBC later with actual user from database */
export default function ProfileProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [fullName, setFullName] = useState("Aayush Swodari");

  return (
    <ProfileContext.Provider
      value={{ isOnboarded: isOnboarded, fullName: fullName }}
    >
      {children}
    </ProfileContext.Provider>
  );
}
