import { api } from "@/api";
import { LoginDto, RegisterDto, AuthResponse } from "../types";

export const login = (payload: LoginDto) =>
  api.post<AuthResponse>("/auth/login", payload);

export const register = (payload: RegisterDto) =>
  api.post<AuthResponse>("/auth/register", payload);

export const logout = () => api.post("/auth/logout");

export const refreshToken = (token: string) =>
  api.post<AuthResponse>("/auth/refresh", { refreshToken: token });
