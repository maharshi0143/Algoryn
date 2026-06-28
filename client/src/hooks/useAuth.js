import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";
import { authService } from "../services/authService";
import { userService } from "../services/userService";
import { ROUTES } from "../constants/routes";

export function useAuth() {
  const navigate = useNavigate();
  const { user, isAuthenticated, login, logout } = useAuthStore();

  const registerMutation = useMutation({
    mutationFn: ({ name, email, password }) =>
      authService.register(name, email, password),
    onSuccess: async (res) => {
      navigate(ROUTES.login);
      toast.success("Account created! Please log in.");
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Registration failed";
      toast.error(message);
    },
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, password }) =>
      authService.login(email, password),
    onSuccess: async (res) => {
      const { user, accessToken } = res.data.data;
      login(user, accessToken);
      try {
        const profileRes = await userService.getProfile();
        const hasProfiles = profileRes.data.data?.total > 0;
        navigate(hasProfiles ? ROUTES.dashboard : ROUTES.welcome);
      } catch {
        navigate(ROUTES.welcome);
      }
      toast.success(`Welcome back, ${user.name}!`);
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Login failed";
      toast.error(message);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      logout();
      navigate(ROUTES.landing);
    },
    onError: () => {
      logout();
      navigate(ROUTES.landing);
    },
  });

  return {
    user,
    isAuthenticated,
    register: registerMutation.mutate,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isRegistering: registerMutation.isPending,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}
