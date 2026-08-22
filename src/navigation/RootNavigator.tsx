import { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useAuthStore, useAppStore, useReaderStore } from "@/store";
import { authService } from "@/services/auth.service";
import { authApi } from "@/api";
import { AuthNavigator } from "./AuthNavigator";
import { MainNavigator } from "./MainNavigator";
import { OnboardingScreen } from "@/features/onboarding/screens/OnboardingScreen";
import { SplashScreen } from "@/features/splash";

export function RootNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const hasCompletedOnboarding = useAppStore(
    (state) => state.hasCompletedOnboarding,
  );

  const [minSplashElapsed, setMinSplashElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinSplashElapsed(true);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        useReaderStore
          .getState()
          .initProgress()
          .catch(() => {});
        const token = await authService.getAccessToken();
        if (token) {
          try {
            const profileRes = await authApi.getProfile();
            const userData = profileRes?.data?.data;
            if (isMounted && userData) {
              setUser(userData);
            }
          } catch {
            // Token might be expired, try refreshing
            try {
              const refreshData = await authService.refreshToken();
              if (refreshData?.accessToken) {
                const profileRes = await authApi.getProfile();
                const userData = profileRes?.data?.data;
                if (isMounted && userData) {
                  setUser(userData);
                }
              }
            } catch {
              await authService.logout().catch(() => {});
            }
          }
        }
      } catch {
        await authService.logout().catch(() => {});
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [setUser, setLoading]);

  if (isLoading || !minSplashElapsed) {
    return <SplashScreen />;
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
