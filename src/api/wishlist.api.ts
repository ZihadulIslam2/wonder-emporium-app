import { useWishlistStore, WishlistItem } from "@/store/wishlist.store";

export const wishlistApi = {
  getWishlist: () => useWishlistStore.getState().items,
  toggleWishlist: (item: WishlistItem) =>
    useWishlistStore.getState().toggleWishlist(item),
  isInWishlist: (id: string) => useWishlistStore.getState().isInWishlist(id),
};
