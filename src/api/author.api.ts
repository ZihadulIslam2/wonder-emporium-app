import { api } from "./axios";

export const authorApi = {
  getFoundingAuthors: (params?: Record<string, unknown>) =>
    api.get("/authors/founding", { params }),

  getFoundingAuthorById: (id: string) => api.get(`/authors/founding/${id}`),
};
