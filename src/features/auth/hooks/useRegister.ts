import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import type { RegisterDto } from "../types";

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterDto) => authService.register(payload),
  });
}
