import { defineStore } from "pinia";
import { computed, ref } from "vue";
import axios from "axios";
import type { LoginPayload, RegisterPayload, User } from "../types/auth";

export const useAuthStore = defineStore("auth", () => {
  const API_URL = "http://localhost:3001/users";

  const user = ref<User | null>(null);
  const isReady = ref(false);

  const isAuthenticated = computed(() => !!user.value);

  const loadUserFromLocalStorage = () => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      user.value = JSON.parse(storedUser);
    }

    isReady.value = true;
  };

  const login = async (payload: LoginPayload) => {
    const email = payload.email.trim();
    const password = payload.password.trim();

    const response = await axios.get<User[]>(`${API_URL}?email=${email}`);
    const foundUser = response.data[0];

    if (!foundUser) {
      throw new Error("User not found");
    }

    if (foundUser.password.trim() !== password) {
      throw new Error("Invalid password");
    }

    user.value = foundUser;
    localStorage.setItem("user", JSON.stringify(foundUser));
    isReady.value = true;
  };

const register = async (payload: RegisterPayload) => {
  const name = payload.name.trim();
  const email = payload.email.trim();
  const password = payload.password.trim();

  const existingUserResponse = await axios.get<User[]>(
    `${API_URL}?email=${email}`,
  );

  if (existingUserResponse.data.length > 0) {
    throw new Error("This email is already registered");
  }

  await axios.post<User>(API_URL, {
    name,
    email,
    password,
  });

  isReady.value = true;
};

  const logout = () => {
    user.value = null;
    isReady.value = true;
    localStorage.removeItem("user");
  };
  return {
    user,
    isReady,
    isAuthenticated,
    loadUserFromLocalStorage,
    login,
    register,
    logout,
  };
});
