import axios from "axios";
import { env } from "@/config/env";
import { storage } from "@/services/storage.service";
import { deviceService } from "@/services/device.service";
import { Constants } from "@/config/constants";

export const api = axios.create({
  baseURL: env.apiUrl,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
}

api.interceptors.request.use(
  async (config) => {
    const [deviceId, token] = await Promise.all([
      deviceService.getDeviceId(),
      storage.get(Constants.tokenKey),
    ]);
    if (deviceId) {
      config.headers["x-device"] = deviceId;
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/register") ||
      originalRequest?.url?.includes("/auth/refresh") ||
      originalRequest?.url?.includes("/auth/verify-email") ||
      originalRequest?.url?.includes("/auth/forgot-password") ||
      originalRequest?.url?.includes("/auth/reset-password");

    if (
      error.response?.status !== 401 ||
      originalRequest?._retry ||
      isAuthEndpoint
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await storage.get(Constants.refreshTokenKey);
      if (!refreshToken) {
        throw new Error("No refresh token");
      }

      const response = await axios.post(
        `${env.apiUrl}/auth/refresh`,
        { refreshToken },
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      const { accessToken, refreshToken: newRefreshToken } = response.data.data;

      await storage.set(Constants.tokenKey, accessToken);
      await storage.set(Constants.refreshTokenKey, newRefreshToken);

      processQueue(null, accessToken);

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      await storage.remove(Constants.tokenKey);
      await storage.remove(Constants.refreshTokenKey);
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);
