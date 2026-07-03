import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import type { VerifyEmailDto } from "../types";

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (payload: VerifyEmailDto) => authService.verifyEmail(payload),
  });
}
