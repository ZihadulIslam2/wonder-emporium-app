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
  getReviewsForBook: (
    bookId: string,
    defaultBookInfo?: { title?: string; author?: string },
  ) => BookReview[];
}

const STORAGE_KEY = "@wonder_book_reviews";

const getContextualSeedReviews = (
  bookId: string,
  title?: string,
  author?: string,
): BookReview[] => {
  const displayTitle = title || "this book";
  const displayAuthor = author || "the author";

  return [
    {
      id: `seed-1-${bookId}`,
      bookId,
      reviewerName: "Sophia Martinez",
      rating: 5,
      comment: `Loved "${displayTitle}"! The perspective and writing style by ${displayAuthor} were deeply engaging throughout. Highly recommend!`,
      createdAt: "2 days ago",
    },
    {
      id: `seed-2-${bookId}`,
      bookId,
      reviewerName: "James Reynolds",
      rating: 4,
      comment: `A thought-provoking and well-structured piece. Enjoyed both the digital edition and the audiobook narration.`,
      createdAt: "1 week ago",
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

  getReviewsForBook: (bookId, defaultBookInfo) => {
    const userReviews = get().reviews[bookId];
    if (userReviews && userReviews.length > 0) {
      return userReviews;
    }
    return getContextualSeedReviews(
      bookId,
      defaultBookInfo?.title,
      defaultBookInfo?.author,
    );
  },
}));
