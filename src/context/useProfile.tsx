import { useContext } from "react";
import { ProfileContext } from "./ProfileProvider";

export default function useProfile() {
  const context = useContext(ProfileContext);
  return context;
}
