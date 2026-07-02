import { api } from "./axios";

interface LoginDto {
  email: string;
  password: string;
}

interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export const authApi = {
  login: (payload: LoginDto) => api.post<AuthResponse>("/auth/login", payload),

  register: (payload: RegisterDto) =>
    api.post<AuthResponse>("/auth/register", payload),

  logout: () => api.post("/auth/logout"),

  refreshToken: (refreshToken: string) =>
    api.post<AuthResponse>("/auth/refresh", { refreshToken }),

  getProfile: () => api.get("/auth/profile"),
};
