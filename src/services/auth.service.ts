import { authApi } from "@/api";
import { storage } from "./storage.service";
import { Constants } from "@/config/constants";
import type {
  RegisterDto,
  LoginDto,
  VerifyEmailDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  LogoutDto,
  User,
} from "@/features/auth/types";

function isAuthResponse(
  data: unknown,
): data is {
  success: boolean;
  data: { accessToken: string; refreshToken: string; user: User };
} {
  if (typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;
  if (typeof d.success !== "boolean") return false;
  if (typeof d.data !== "object" || d.data === null) return false;
  const dd = d.data as Record<string, unknown>;
  return (
    typeof dd.accessToken === "string" &&
    typeof dd.refreshToken === "string" &&
    typeof dd.user === "object"
  );
}

async function persistAuth(data: {
  accessToken: string;
  refreshToken: string;
}) {
  await storage.set(Constants.tokenKey, data.accessToken);
  await storage.set(Constants.refreshTokenKey, data.refreshToken);
}

export const authService = {
  register: async (payload: RegisterDto) => {
    const response = await authApi.register(payload);
    const data = response.data;
    if (data.success && data.data?.accessToken && data.data?.refreshToken) {
      await persistAuth(data.data);
    }
    return data;
  },

  verifyEmail: async (payload: VerifyEmailDto) => {
    const response = await authApi.verifyEmail(payload);
    return response.data;
  },

  login: async (payload: LoginDto) => {
    const response = await authApi.login(payload);
    const data = response.data;
    if (isAuthResponse(data)) {
      await persistAuth(data.data);
      return data.data;
    }
    throw new Error("Invalid auth response");
  },

  refreshToken: async () => {
    const refreshToken = await storage.get(Constants.refreshTokenKey);
    if (!refreshToken) throw new Error("No refresh token");

    const response = await authApi.refreshToken({ refreshToken });
    const data = response.data;
    if (data.success && data.data?.accessToken && data.data?.refreshToken) {
      await persistAuth(data.data);
      return data.data;
    }
    throw new Error("Invalid refresh response");
  },

  logout: async (payload?: LogoutDto) => {
    const refreshToken =
      payload?.refreshToken || (await storage.get(Constants.refreshTokenKey));
    try {
      if (refreshToken) {
        await authApi.logout({ refreshToken });
      }
    } finally {
      await storage.remove(Constants.tokenKey);
      await storage.remove(Constants.refreshTokenKey);
    }
  },

  logoutAll: async (userId: string) => {
    try {
      await authApi.logoutAll({ userId });
    } finally {
      await storage.remove(Constants.tokenKey);
      await storage.remove(Constants.refreshTokenKey);
    }
  },

  forgotPassword: async (payload: ForgotPasswordDto) => {
    const response = await authApi.forgotPassword(payload);
    return response.data;
  },

  resetPassword: async (payload: ResetPasswordDto) => {
    const response = await authApi.resetPassword(payload);
    return response.data;
  },

  getAccessToken: () => storage.get(Constants.tokenKey),

  getRefreshToken: () => storage.get(Constants.refreshTokenKey),
};
