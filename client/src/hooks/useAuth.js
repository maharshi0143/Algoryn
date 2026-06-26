import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";
import { authService } from "../services/authService";
import { ROUTES } from "../constants/routes";

export function useAuth() {
  const navigate = useNavigate();
  const { user, isAuthenticated, login, logout } = useAuthStore();

  const registerMutation = useMutation({
    mutationFn: ({ name, email, password }) =>
      authService.register(name, email, password),
    onSuccess: () => {
      toast.success("Registration successful! Check your email to verify.");
      navigate(ROUTES.login);
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
    onSuccess: (res) => {
      const { user, accessToken } = res.data.data;
      login(user, accessToken);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(ROUTES.welcome);
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
