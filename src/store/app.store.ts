import { create } from "zustand";

interface AppState {
  isReady: boolean;
  setReady: (value: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isReady: false,
  setReady: (value) => set({ isReady: value }),
}));
