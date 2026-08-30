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

function isAuthResponse(data: unknown): data is {
  statusCode: number;
  message: string;
  data: {
    tokens: { accessToken: string; refreshToken: string };
    user: User;
  };
} {
  if (typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;
  if (typeof d.statusCode !== "number") return false;
  if (typeof d.message !== "string") return false;
  if (typeof d.data !== "object" || d.data === null) return false;

  const dd = d.data as Record<string, unknown>;
  if (typeof dd.tokens !== "object" || dd.tokens === null) return false;
  if (typeof dd.user !== "object" || dd.user === null) return false;

  const tokens = dd.tokens as Record<string, unknown>;
  return (
    typeof tokens.accessToken === "string" &&
    typeof tokens.refreshToken === "string"
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
    if (isAuthResponse(data)) {
      await persistAuth({
        accessToken: data.data.tokens.accessToken,
        refreshToken: data.data.tokens.refreshToken,
      });
    }
    return data;
  },

  verifyEmail: async (payload: VerifyEmailDto) => {
    const response = await authApi.verifyEmail(payload);
    return response.data;
  },

  resendVerification: async (payload: { email: string }) => {
    const response = await authApi.resendVerification(payload);
    return response.data;
  },

  resendPasswordReset: async (payload: { email: string }) => {
    const response = await authApi.resendPasswordReset(payload);
    return response.data;
  },

  login: async (payload: LoginDto) => {
    const response = await authApi.login(payload);
    const data = response.data;

    if (isAuthResponse(data)) {
      // Extract tokens from the nested structure
      const authData = {
        accessToken: data.data.tokens.accessToken,
        refreshToken: data.data.tokens.refreshToken,
        user: data.data.user,
      };
      await persistAuth(authData);
      return authData;
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
    } catch {
      // Network/server errors during logout should not prevent local cleanup
    } finally {
      await storage.remove(Constants.tokenKey);
      await storage.remove(Constants.refreshTokenKey);
    }
  },

  logoutAll: async (userId: string) => {
    try {
      await authApi.logoutAll({ userId });
    } catch {
      // Network/server errors during logout should not prevent local cleanup
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
