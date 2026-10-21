// src/components/dev-tools/index.tsx
import FloatingNavigator from "./floating-navigator";

/**
 * Dev-only floating tools: a route jumper plus a three-dot menu with
 * session / profile / onboarding resets. Renders nothing in production.
 *
 * Must be rendered INSIDE <AuthProvider> and <ProfileProvider>, because the
 * menu actions use useAuth() and useProfile().
 */
export function DevPathNavigator() {
  if (!__DEV__) return null;
  return <FloatingNavigator />;
}
