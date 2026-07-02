import { NavigationContainer } from "@react-navigation/native";
import { useAuthStore, useAppStore } from "@/store";
import { AuthNavigator } from "./AuthNavigator";
import { MainNavigator } from "./MainNavigator";
import { OnboardingScreen } from "@/features/onboarding/screens/OnboardingScreen";

export function RootNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasCompletedOnboarding = useAppStore(
    (state) => state.hasCompletedOnboarding,
  );

  return (
    <NavigationContainer>
      {!isAuthenticated && !hasCompletedOnboarding ? (
        <OnboardingScreen />
      ) : isAuthenticated ? (
        <MainNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}
