import { useEffect } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { useAuthStore, useAppStore } from "@/store";
import { authService } from "@/services/auth.service";
import { AuthNavigator } from "./AuthNavigator";
import { MainNavigator } from "./MainNavigator";
import { OnboardingScreen } from "@/features/onboarding/screens/OnboardingScreen";
import { Colors } from "@/styles/colors";

export function RootNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const hasCompletedOnboarding = useAppStore(
    (state) => state.hasCompletedOnboarding,
  );

  useEffect(() => {
    async function init() {
      try {
        const token = await authService.getAccessToken();
        if (token) {
          const response = await authService.refreshToken();
          setUser(response.user);
        }
      } catch {
        await authService.logout();
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [setUser, setLoading]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.secondary} />
      </View>
    );
  }

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

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
  },
});
