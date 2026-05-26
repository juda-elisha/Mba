import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

export function useAuth() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const token = localStorage.getItem("rrc_token");
  const isAuthenticated = !!token;

  const login = (newToken: string) => {
    localStorage.setItem("rrc_token", newToken);
    setLocation("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("rrc_token");
    queryClient.clear();
    setLocation("/");
  };

  return {
    isAuthenticated,
    login,
    logout,
  };
}
