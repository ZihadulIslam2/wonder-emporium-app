import { api } from "./axios";

export interface LibraryBook {
  id: string;
  title: string;
  bookCover?: string | null;
  coverUrl?: string | null;
  cover?: string | null;
  authorId?: string;
  author?:
    | string
    | {
        username?: string;
        profile?: { firstName?: string; lastName?: string };
      };
  rating?: string | number;
}

export interface LibraryItem {
  orderItemId: string;
  orderId: string;
  purchasedAt: string | Date;
  quantity: number;
  book: LibraryBook;
  format: {
    id: string;
    type: "EBOOK" | "AUDIOBOOK";
  };
  accessType: "DOWNLOAD" | "STREAM";
  progress?: number;
  status?: "COMPLETED" | "READING" | "NOT_STARTED";
}

export interface LibraryAccessResponse {
  orderItemId: string;
  bookId: string;
  format: "EBOOK" | "AUDIOBOOK";
  accessType: "DOWNLOAD" | "STREAM";
  url: string;
  expiresIn: number;
  mimeType: string | null;
  fileName: string;
}

export const libraryApi = {
  getLibrary: async () => {
    const res = await api.get<LibraryItem[]>("/library");
    return res;
  },

  getAccess: async (orderItemId: string) => {
    const res = await api.post<LibraryAccessResponse>(
      `/library/${orderItemId}/access`,
    );
    return res;
  },
};
