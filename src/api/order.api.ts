import { api } from "./axios";

export interface CheckoutItemPayload {
  formatId: string;
  quantity: number;
}

export interface CreateCheckoutPayload {
  items: CheckoutItemPayload[];
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResponse {
  checkoutUrl: string;
}

export interface OrderItem {
  id: string;
  bookId: string;
  formatId: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface OrderHistoryItem {
  id: string;
  buyerId: string;
  stripeSessionId?: string;
  currency: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export const ordersApi = {
  createCheckout: (payload: CreateCheckoutPayload) =>
    api.post<CheckoutResponse>("/orders/checkout", payload),

  getOrderHistory: (params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }) => api.get<OrderHistoryItem[]>("/orders/history", { params }),
};
