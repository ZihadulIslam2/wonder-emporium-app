import { api } from "./axios";
import type {
  RegisterDto,
  LoginDto,
  VerifyEmailDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  RefreshTokenDto,
  LogoutDto,
  SocialAuthDto,
} from "@/features/auth/types";

export const authApi = {
  register: (payload: RegisterDto) => api.post("/auth/register", payload),

  verifyEmail: (payload: VerifyEmailDto) =>
    api.post("/auth/verify-email", payload),

  login: (payload: LoginDto) => api.post("/auth/login", payload),

  refreshToken: (payload: RefreshTokenDto) =>
    api.post("/auth/refresh", payload),

  logout: (payload: LogoutDto) => api.post("/auth/logout", payload),

  logoutAll: (payload: { userId: string }) =>
    api.post("/auth/logout-all", payload),

  forgotPassword: (payload: ForgotPasswordDto) =>
    api.post("/auth/forgot-password", payload),

  resetPassword: (payload: ResetPasswordDto) =>
    api.post("/auth/reset-password", payload),

  getProfile: () => api.get("/auth/me"),

  updateProfile: (payload: {
    firstName?: string;
    lastName?: string;
    location?: string;
    bio?: string;
  }) => api.patch("/auth/profile", payload),

  updateAvatar: (formData: FormData) =>
    api.patch("/auth/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  changePassword: (payload: { oldPassword: string; newPassword: string }) =>
    api.post("/auth/change-password", payload),

  getGoogleAuthUrl: () => api.get("/auth/google"),

  googleCallbackPost: (payload: SocialAuthDto) =>
    api.post("/auth/google/callback", payload),

  googleCallbackGet: (params: SocialAuthDto) =>
    api.get("/auth/google/callback", { params }),
};
