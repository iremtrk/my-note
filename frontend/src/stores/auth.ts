import { defineStore } from "pinia";
import { computed, ref } from "vue";
import axios from "axios";
import type { LoginPayload, RegisterPayload, User } from "../types/auth";

export const useAuthStore = defineStore("auth", () => {
  const API_URL = "http://localhost:5000/api/auth";

  const user = ref<User | null>(null);

  const isAuthenticated = computed(() => !!user.value);

  const loadUserFromLocalStorage = () => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      user.value = JSON.parse(storedUser);
    }
  };

  const login = async (payload: LoginPayload) => {
    const email = payload.email.trim();
    const password = payload.password.trim();

    const response = await axios.post(`${API_URL}/login`, {
      email,
      password,
    });

    user.value = response.data.user;

    localStorage.setItem("user", JSON.stringify(response.data.user));
    localStorage.setItem("token", response.data.token);
  };

  const register = async (payload: RegisterPayload) => {
    const name = payload.name.trim();
    const email = payload.email.trim();
    const password = payload.password.trim();

    const response = await axios.post(`${API_URL}/register`, {
      name,
      email,
      password,
    });
  };

  const logout = () => {
    user.value = null;
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return {
    user,
    isAuthenticated,
    loadUserFromLocalStorage,
    login,
    register,
    logout,
  };
});