import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// In-memory cache to prevent frequent slow native SecureStore bridge roundtrips
const memoryCache = new Map<string, string | null>();

export const storage = {
  get: async (key: string): Promise<string | null> => {
    if (memoryCache.has(key)) {
      return memoryCache.get(key) ?? null;
    }

    try {
      let val: string | null = null;
      if (Platform.OS === "web") {
        if (typeof window !== "undefined" && window.localStorage) {
          val = window.localStorage.getItem(key);
        }
      } else {
        val = await SecureStore.getItemAsync(key);
      }
      memoryCache.set(key, val);
      return val;
    } catch {
      return null;
    }
  },

  getFast: (key: string): string | null => {
    return memoryCache.get(key) ?? null;
  },

  set: async (key: string, value: string): Promise<void> => {
    memoryCache.set(key, value);
    try {
      if (Platform.OS === "web") {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Storage set error:", error);
    }
  },

  remove: async (key: string): Promise<void> => {
    memoryCache.delete(key);
    try {
      if (Platform.OS === "web") {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.removeItem(key);
        }
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Storage remove error:", error);
    }
  },

  clearCache: (): void => {
    memoryCache.clear();
  },
};
