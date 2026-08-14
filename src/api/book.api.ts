import { api } from "./axios";

export const bookApi = {
  getAll: (params?: Record<string, unknown>) => api.get("/books", { params }),

  getApproved: (params?: Record<string, unknown>) =>
    api.get("/books/approved", { params }),

  getCategories: () => api.get("/books/categories"),

  getById: (id: string) => api.get(`/books/${id}`),

  create: (data: unknown) => api.post("/books", data),

  update: (id: string, data: unknown) => api.put(`/books/${id}`, data),

  delete: (id: string) => api.delete(`/books/${id}`),
};
