import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/store";
import { authService } from "@/services/auth.service";
import type { LogoutDto } from "../types";

export function useLogout() {
  const reset = useAuthStore((state) => state.reset);

  return useMutation({
    mutationFn: (payload?: LogoutDto) => authService.logout(payload),
    onSettled: () => {
      reset();
    },
  });
}

export function useLogoutAll() {
  const reset = useAuthStore((state) => state.reset);

  return useMutation({
    mutationFn: (userId: string) => authService.logoutAll(userId),
    onSettled: () => {
      reset();
    },
  });
}
