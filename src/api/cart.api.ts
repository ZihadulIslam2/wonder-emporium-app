import { api } from "./axios";

export const cartApi = {
  getCart: () => api.get("/cart"),

  addItem: (payload: { bookId: string; formatId: string; quantity?: number }) =>
    api.post("/cart/items", payload),

  updateItemQuantity: (itemId: string, payload: { quantity: number }) =>
    api.patch(`/cart/items/${itemId}`, payload),

  removeItem: (itemId: string) => api.delete(`/cart/items/${itemId}`),

  clearCart: () => api.delete("/cart"),
};
