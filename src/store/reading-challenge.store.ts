import { create } from "zustand";
import { storage } from "@/services/storage.service";
import type { BookProgressData } from "./reader.store";

export type TrophyTier = "bronze" | "silver" | "gold" | "diamond";

export interface Trophy {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tier: TrophyTier;
  icon: string; // Ionicons name
  targetCount: number;
  metric: "books" | "streak" | "targetPercent" | "audioMinutes";
  unlockedAt: string | null; // ISO date string or null if locked
}

export interface ReadingChallengeState {
  isInitialized: boolean;
  annualTarget: number;
  monthlyTarget: number;
  customCompletedCount: number;
  completedBookIds: string[];
  totalMinutesRead: number;
  currentStreak: number;
  lastReadDate: string | null; // YYYY-MM-DD
  trophies: Trophy[];

  // Actions
  initChallenge: () => Promise<void>;
  setAnnualTarget: (target: number) => Promise<void>;
  markBookCompleted: (
    bookId: string,
    minutesSpent?: number,
  ) => Promise<Trophy[]>;
  logManualBook: (title: string) => Promise<Trophy[]>;
  logReadingSession: (minutes: number) => Promise<Trophy[]>;
  syncWithReaderStore: (
    progressMap: Record<string, BookProgressData>,
  ) => Promise<Trophy[]>;
}

const STORAGE_KEY = "@wonder_reading_challenges_v1";

export const DEFAULT_TROPHIES: Trophy[] = [
  {
    id: "trophy-first-book",
    title: "First Steps",
    subtitle: "Finish your first book",
    description:
      "Completed your very first book at Wonder Emporium. The journey begins!",
    tier: "bronze",
    icon: "book-outline",
    targetCount: 1,
    metric: "books",
    unlockedAt: null,
  },
  {
    id: "trophy-three-books",
    title: "Avid Explorer",
    subtitle: "Complete 3 books",
    description: "Finished 3 books! Your reading momentum is building fast.",
    tier: "bronze",
    icon: "ribbon-outline",
    targetCount: 3,
    metric: "books",
    unlockedAt: null,
  },
  {
    id: "trophy-streak-3",
    title: "Daily Habit",
    subtitle: "3-Day reading streak",
    description: "Read for 3 consecutive days. Consistency builds wisdom.",
    tier: "silver",
    icon: "flame-outline",
    targetCount: 3,
    metric: "streak",
    unlockedAt: null,
  },
  {
    id: "trophy-halfway",
    title: "Halfway Hero",
    subtitle: "Reach 50% of annual goal",
    description: "Reached the 50% milestone of your annual reading challenge.",
    tier: "silver",
    icon: "medal-outline",
    targetCount: 50,
    metric: "targetPercent",
    unlockedAt: null,
  },
  {
    id: "trophy-audio-explorer",
    title: "Audio Virtuoso",
    subtitle: "Listen to 60+ mins of audiobooks",
    description: "Immersed yourself in over an hour of voice narration.",
    tier: "silver",
    icon: "headset-outline",
    targetCount: 60,
    metric: "audioMinutes",
    unlockedAt: null,
  },
  {
    id: "trophy-goal-crushed",
    title: "Annual Champion",
    subtitle: "Complete 100% of your challenge",
    description:
      "Reached your full annual target! A crowning reading achievement.",
    tier: "gold",
    icon: "trophy",
    targetCount: 100,
    metric: "targetPercent",
    unlockedAt: null,
  },
  {
    id: "trophy-surpassed",
    title: "Grand Emporium Master",
    subtitle: "Surpass your target by 120%",
    description:
      "Exceeded your annual challenge target! You are a true literary powerhouse.",
    tier: "diamond",
    icon: "diamond-outline",
    targetCount: 120,
    metric: "targetPercent",
    unlockedAt: null,
  },
  {
    id: "trophy-streak-7",
    title: "Century Streaker",
    subtitle: "7-Day reading streak",
    description: "Read every day for an entire week without missing a beat.",
    tier: "gold",
    icon: "sparkles-outline",
    targetCount: 7,
    metric: "streak",
    unlockedAt: null,
  },
];

const getTodayString = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const calculateNewStreak = (
  lastDate: string | null,
  currentStreak: number,
): { newStreak: number; newDate: string } => {
  const today = getTodayString();
  if (!lastDate) {
    return { newStreak: 1, newDate: today };
  }
  if (lastDate === today) {
    return { newStreak: currentStreak || 1, newDate: today };
  }
  const lastD = new Date(lastDate);
  const nowD = new Date(today);
  const diffDays = Math.round(
    (nowD.getTime() - lastD.getTime()) / (1000 * 3600 * 24),
  );
  if (diffDays === 1) {
    return { newStreak: (currentStreak || 0) + 1, newDate: today };
  }
  return { newStreak: 1, newDate: today };
};

const checkUnlockedTrophies = (
  trophies: Trophy[],
  totalBooks: number,
  targetPercent: number,
  streak: number,
  audioMinutes: number,
): { updatedTrophies: Trophy[]; newlyUnlocked: Trophy[] } => {
  const newlyUnlocked: Trophy[] = [];
  const now = new Date().toISOString();

  const updatedTrophies = trophies.map((trophy) => {
    if (trophy.unlockedAt) return trophy;

    let isMet = false;
    if (trophy.metric === "books" && totalBooks >= trophy.targetCount)
      isMet = true;
    if (
      trophy.metric === "targetPercent" &&
      targetPercent >= trophy.targetCount
    )
      isMet = true;
    if (trophy.metric === "streak" && streak >= trophy.targetCount)
      isMet = true;
    if (trophy.metric === "audioMinutes" && audioMinutes >= trophy.targetCount)
      isMet = true;

    if (isMet) {
      const unlocked = { ...trophy, unlockedAt: now };
      newlyUnlocked.push(unlocked);
      return unlocked;
    }
    return trophy;
  });

  return { updatedTrophies, newlyUnlocked };
};

export const useReadingChallengeStore = create<ReadingChallengeState>(
  (set, get) => ({
    isInitialized: false,
    annualTarget: 12,
    monthlyTarget: 2,
    customCompletedCount: 0,
    completedBookIds: [],
    totalMinutesRead: 45,
    currentStreak: 2,
    lastReadDate: getTodayString(),
    trophies: DEFAULT_TROPHIES,

    initChallenge: async () => {
      try {
        const raw = await storage.get(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === "object") {
            // Merge with any new default trophies in case list grew
            const savedTrophies: Trophy[] = parsed.trophies || [];
            const mergedTrophies = DEFAULT_TROPHIES.map((def) => {
              const match = savedTrophies.find((s) => s.id === def.id);
              return match ? { ...def, unlockedAt: match.unlockedAt } : def;
            });

            set({
              isInitialized: true,
              annualTarget: parsed.annualTarget || 12,
              monthlyTarget: parsed.monthlyTarget || 2,
              customCompletedCount: parsed.customCompletedCount || 0,
              completedBookIds: parsed.completedBookIds || [],
              totalMinutesRead: parsed.totalMinutesRead || 0,
              currentStreak: parsed.currentStreak || 1,
              lastReadDate: parsed.lastReadDate || null,
              trophies: mergedTrophies,
            });
            return;
          }
        }
      } catch {
        // ignore
      }
      set({ isInitialized: true });
    },

    setAnnualTarget: async (target: number) => {
      const validTarget = Math.max(1, Math.min(100, Math.round(target)));
      const state = get();
      const totalBooks =
        state.completedBookIds.length + state.customCompletedCount;
      const targetPercent = Math.round((totalBooks / validTarget) * 100);

      const { updatedTrophies } = checkUnlockedTrophies(
        state.trophies,
        totalBooks,
        targetPercent,
        state.currentStreak,
        state.totalMinutesRead,
      );

      const newState = {
        ...state,
        annualTarget: validTarget,
        trophies: updatedTrophies,
      };
      set(newState);
      storage.set(STORAGE_KEY, JSON.stringify(newState)).catch(() => {});
    },

    markBookCompleted: async (bookId: string, minutesSpent = 30) => {
      const state = get();
      const alreadyCompleted = state.completedBookIds.includes(bookId);
      const completedBookIds = alreadyCompleted
        ? state.completedBookIds
        : [...state.completedBookIds, bookId];

      const { newStreak, newDate } = calculateNewStreak(
        state.lastReadDate,
        state.currentStreak,
      );
      const newMinutes = state.totalMinutesRead + minutesSpent;
      const totalBooks = completedBookIds.length + state.customCompletedCount;
      const targetPercent = Math.round((totalBooks / state.annualTarget) * 100);

      const { updatedTrophies, newlyUnlocked } = checkUnlockedTrophies(
        state.trophies,
        totalBooks,
        targetPercent,
        newStreak,
        newMinutes,
      );

      const newState = {
        ...state,
        completedBookIds,
        totalMinutesRead: newMinutes,
        currentStreak: newStreak,
        lastReadDate: newDate,
        trophies: updatedTrophies,
      };

      set(newState);
      storage.set(STORAGE_KEY, JSON.stringify(newState)).catch(() => {});
      return newlyUnlocked;
    },

    logManualBook: async () => {
      const state = get();
      const customCompletedCount = state.customCompletedCount + 1;
      const { newStreak, newDate } = calculateNewStreak(
        state.lastReadDate,
        state.currentStreak,
      );
      const newMinutes = state.totalMinutesRead + 45;
      const totalBooks = state.completedBookIds.length + customCompletedCount;
      const targetPercent = Math.round((totalBooks / state.annualTarget) * 100);

      const { updatedTrophies, newlyUnlocked } = checkUnlockedTrophies(
        state.trophies,
        totalBooks,
        targetPercent,
        newStreak,
        newMinutes,
      );

      const newState = {
        ...state,
        customCompletedCount,
        totalMinutesRead: newMinutes,
        currentStreak: newStreak,
        lastReadDate: newDate,
        trophies: updatedTrophies,
      };

      set(newState);
      storage.set(STORAGE_KEY, JSON.stringify(newState)).catch(() => {});
      return newlyUnlocked;
    },

    logReadingSession: async (minutes: number) => {
      const state = get();
      const { newStreak, newDate } = calculateNewStreak(
        state.lastReadDate,
        state.currentStreak,
      );
      const newMinutes = state.totalMinutesRead + minutes;
      const totalBooks =
        state.completedBookIds.length + state.customCompletedCount;
      const targetPercent = Math.round((totalBooks / state.annualTarget) * 100);

      const { updatedTrophies, newlyUnlocked } = checkUnlockedTrophies(
        state.trophies,
        totalBooks,
        targetPercent,
        newStreak,
        newMinutes,
      );

      const newState = {
        ...state,
        totalMinutesRead: newMinutes,
        currentStreak: newStreak,
        lastReadDate: newDate,
        trophies: updatedTrophies,
      };

      set(newState);
      storage.set(STORAGE_KEY, JSON.stringify(newState)).catch(() => {});
      return newlyUnlocked;
    },

    syncWithReaderStore: async (
      progressMap: Record<string, BookProgressData>,
    ) => {
      const state = get();
      const finishedFromReader = Object.values(progressMap)
        .filter((p) => p.progress >= 100)
        .map((p) => p.bookId);

      const uniqueCompleted = Array.from(
        new Set([...state.completedBookIds, ...finishedFromReader]),
      );

      // Calculate audio listening minutes from reader progress
      const audioSeconds = Object.values(progressMap).reduce((acc, p) => {
        return acc + (p.lastPosition || 0);
      }, 0);
      const audioMinutesFromStore = Math.round(audioSeconds / 60);
      const totalMinutes = Math.max(
        state.totalMinutesRead,
        audioMinutesFromStore,
      );

      const totalBooks = uniqueCompleted.length + state.customCompletedCount;
      const targetPercent = Math.round((totalBooks / state.annualTarget) * 100);

      const { updatedTrophies, newlyUnlocked } = checkUnlockedTrophies(
        state.trophies,
        totalBooks,
        targetPercent,
        state.currentStreak,
        totalMinutes,
      );

      const newState = {
        ...state,
        completedBookIds: uniqueCompleted,
        totalMinutesRead: totalMinutes,
        trophies: updatedTrophies,
      };

      set(newState);
      storage.set(STORAGE_KEY, JSON.stringify(newState)).catch(() => {});
      return newlyUnlocked;
    },
  }),
);
