import { create } from "zustand";
import { storage } from "@/services/storage.service";

export interface BookReview {
  id: string;
  bookId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewStoreState {
  reviews: Record<string, BookReview[]>;
  isLoaded: boolean;
  initReviews: () => Promise<void>;
  addReview: (
    bookId: string,
    review: { reviewerName: string; rating: number; comment: string },
  ) => Promise<void>;
  getReviewsForBook: (bookId: string) => BookReview[];
}

const STORAGE_KEY = "@wonder_book_reviews";

const SEED_REVIEW_POOL: Array<Omit<BookReview, "id" | "bookId">> = [
  {
    reviewerName: "Sophia Martinez",
    rating: 5,
    comment:
      "A compelling and deeply captivating read. The storytelling and pacing kept me hooked from the very first chapter. Highly recommend!",
    createdAt: "2 days ago",
  },
  {
    reviewerName: "James Reynolds",
    rating: 5,
    comment:
      "A beautifully crafted and thought-provoking piece. The narrative flows naturally and stays with you long after the final page.",
    createdAt: "5 days ago",
  },
  {
    reviewerName: "Elena Vance",
    rating: 4,
    comment:
      "Very well written with insightful depth and great storytelling. Both the text edition and audio narration are top-notch.",
    createdAt: "1 week ago",
  },
];

const getContextualSeedReviews = (bookId: string): BookReview[] => {
  // Deterministically select 2 natural reviews based on bookId hash
  const hash = bookId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const firstIdx = hash % SEED_REVIEW_POOL.length;
  const secondIdx = (firstIdx + 1) % SEED_REVIEW_POOL.length;

  return [
    {
      ...SEED_REVIEW_POOL[firstIdx],
      id: `seed-1-${bookId}`,
      bookId,
    },
    {
      ...SEED_REVIEW_POOL[secondIdx],
      id: `seed-2-${bookId}`,
      bookId,
    },
  ];
};

export const useReviewStore = create<ReviewStoreState>((set, get) => ({
  reviews: {},
  isLoaded: false,

  initReviews: async () => {
    try {
      const stored = await storage.get(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        set({ reviews: parsed, isLoaded: true });
        return;
      }
    } catch {
      // ignore
    }
    set({ isLoaded: true });
  },

  addReview: async (bookId, { reviewerName, rating, comment }) => {
    const newReview: BookReview = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      bookId,
      reviewerName: reviewerName.trim() || "Reader",
      rating: Math.max(1, Math.min(5, rating)),
      comment: comment.trim(),
      createdAt: "Just now",
    };

    const current = get().reviews[bookId] || [];
    const updatedReviews = {
      ...get().reviews,
      [bookId]: [newReview, ...current],
    };

    set({ reviews: updatedReviews });

    try {
      await storage.set(STORAGE_KEY, JSON.stringify(updatedReviews));
    } catch {
      // ignore
    }
  },

  getReviewsForBook: (bookId) => {
    const userReviews = get().reviews[bookId];
    if (userReviews && userReviews.length > 0) {
      return userReviews;
    }
    return getContextualSeedReviews(bookId);
  },
}));
