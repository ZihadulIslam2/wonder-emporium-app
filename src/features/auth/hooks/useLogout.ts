import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store";
import { authService } from "@/services/auth.service";
import type { LogoutDto } from "../types";

export function useLogout() {
  const reset = useAuthStore((state) => state.reset);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload?: LogoutDto) => authService.logout(payload),
    onSettled: () => {
      reset();
      queryClient.clear();
    },
  });
}

export function useLogoutAll() {
  const reset = useAuthStore((state) => state.reset);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => authService.logoutAll(userId),
    onSettled: () => {
      reset();
      queryClient.clear();
    },
  });
}
