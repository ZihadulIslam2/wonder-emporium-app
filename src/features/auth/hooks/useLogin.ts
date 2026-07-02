import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store";
import { LoginDto } from "../types";

export function useLogin() {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (payload: LoginDto) => authService.login(payload),
    onSuccess: (data) => {
      setUser(data.user);
    },
  });
}
