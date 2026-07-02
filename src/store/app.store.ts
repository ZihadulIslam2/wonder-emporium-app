import { create } from "zustand";

interface AppState {
  isReady: boolean;
  hasCompletedOnboarding: boolean;
  setReady: (value: boolean) => void;
  setHasCompletedOnboarding: (value: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isReady: false,
  hasCompletedOnboarding: false,
  setReady: (value) => set({ isReady: value }),
  setHasCompletedOnboarding: (value) => set({ hasCompletedOnboarding: value }),
}));
