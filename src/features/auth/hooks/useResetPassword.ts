import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import type { ResetPasswordDto } from "../types";

export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: ResetPasswordDto) =>
      authService.resetPassword(payload),
  });
}
