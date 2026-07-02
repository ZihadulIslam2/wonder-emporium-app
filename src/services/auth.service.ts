import { authApi } from "@/api";
import { storage } from "./storage.service";
import { Constants } from "@/config/constants";

export const authService = {
  login: async (payload: { email: string; password: string }) => {
    const response = await authApi.login(payload);
    const { accessToken, refreshToken } = response.data;
    await storage.set(Constants.tokenKey, accessToken);
    await storage.set(Constants.refreshTokenKey, refreshToken);
    return response.data;
  },

  logout: async () => {
    await storage.remove(Constants.tokenKey);
    await storage.remove(Constants.refreshTokenKey);
  },

  getAccessToken: () => storage.get(Constants.tokenKey),

  getRefreshToken: () => storage.get(Constants.refreshTokenKey),
};
