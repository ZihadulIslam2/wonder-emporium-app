import { create } from "zustand";
import { storage } from "@/services/storage.service";

const PROGRESS_STORAGE_KEY = "wonder_book_progress";

export interface BookProgressData {
  bookId: string;
  orderItemId?: string;
  progress: number; // 0 - 100
  lastPosition?: number; // seconds for audio, page number for pdf
  totalPages?: number;
  totalDuration?: number; // seconds
  lastReadAt: string; // ISO date string
}

interface ReaderState {
  progressMap: Record<string, BookProgressData>;
  isInitialized: boolean;
  theme: "light" | "sepia" | "dark";
  fontSize: number; // in pt/px e.g. 16, 18, 20
  initProgress: () => Promise<void>;
  setProgress: (
    bookId: string,
    progress: number,
    details?: {
      orderItemId?: string;
      lastPosition?: number;
      totalPages?: number;
      totalDuration?: number;
    },
  ) => void;
  getProgress: (bookId: string) => number | undefined;
  getProgressData: (bookId: string) => BookProgressData | undefined;
  setTheme: (theme: "light" | "sepia" | "dark") => void;
  setFontSize: (size: number) => void;
}

export const useReaderStore = create<ReaderState>((set, get) => ({
  progressMap: {},
  isInitialized: false,
  theme: "light",
  fontSize: 16,

  initProgress: async () => {
    try {
      const raw = await storage.get(PROGRESS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, BookProgressData>;
        if (parsed && typeof parsed === "object") {
          set({ progressMap: parsed, isInitialized: true });
          return;
        }
      }
    } catch {
      // ignore parsing errors
    }
    set({ isInitialized: true });
  },

  setProgress: (bookId, progress, details) => {
    const clampedProgress = Math.max(0, Math.min(100, Math.round(progress)));
    const existing = get().progressMap[bookId];

    const updatedData: BookProgressData = {
      bookId,
      orderItemId: details?.orderItemId || existing?.orderItemId,
      progress: clampedProgress,
      lastPosition: details?.lastPosition ?? existing?.lastPosition,
      totalPages: details?.totalPages ?? existing?.totalPages,
      totalDuration: details?.totalDuration ?? existing?.totalDuration,
      lastReadAt: new Date().toISOString(),
    };

    const newMap = {
      ...get().progressMap,
      [bookId]: updatedData,
    };

    set({ progressMap: newMap });

    // Persist asynchronously
    storage.set(PROGRESS_STORAGE_KEY, JSON.stringify(newMap)).catch(() => {});
  },

  getProgress: (bookId: string) => {
    return get().progressMap[bookId]?.progress;
  },

  getProgressData: (bookId: string) => {
    return get().progressMap[bookId];
  },

  setTheme: (theme) => set({ theme }),
  setFontSize: (fontSize) => set({ fontSize }),
}));
