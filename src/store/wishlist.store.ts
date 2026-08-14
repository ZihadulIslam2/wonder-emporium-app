import { create } from "zustand";

export interface WishlistItem {
  id: string;
  title: string;
  author: string;
  price: string;
  rating: string;
  bookCover?: string;
  coverUrl?: string;
  cover?: string;
  files?: Array<{ type: string; url: string } | unknown>;
  [key: string]: unknown;
}

interface WishlistState {
  items: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  toggleWishlist: (item: WishlistItem) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  addToWishlist: (item) =>
    set((state) => {
      if (state.items.some((i) => i.id === item.id)) return state;
      return { items: [...state.items, item] };
    }),
  removeFromWishlist: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),
  toggleWishlist: (item) => {
    const { items, addToWishlist, removeFromWishlist } = get();
    if (items.some((i) => i.id === item.id)) {
      removeFromWishlist(item.id);
    } else {
      addToWishlist(item);
    }
  },
  isInWishlist: (id) => get().items.some((i) => i.id === id),
  clearWishlist: () => set({ items: [] }),
}));
