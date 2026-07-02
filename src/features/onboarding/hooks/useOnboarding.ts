import { useCallback } from "react";
import { useAppStore } from "@/store";

export function useOnboarding() {
  const setHasCompletedOnboarding = useAppStore(
    (state) => state.setHasCompletedOnboarding,
  );

  const completeOnboarding = useCallback(() => {
    setHasCompletedOnboarding(true);
  }, [setHasCompletedOnboarding]);

  return { completeOnboarding };
}
