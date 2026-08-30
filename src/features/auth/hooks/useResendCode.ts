import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";

interface ResendPayload {
  email: string;
  isVerifyEmail: boolean;
}

export function useResendCode() {
  return useMutation({
    mutationFn: ({ email, isVerifyEmail }: ResendPayload) => {
      if (isVerifyEmail) {
        return authService.resendVerification({ email });
      }
      return authService.resendPasswordReset({ email });
    },
  });
}
