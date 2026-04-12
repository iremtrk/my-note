import { defineStore } from "pinia";
import { computed, ref } from "vue";
import axios from "axios";
import bcrypt from "bcryptjs";
import type { LoginPayload, RegisterPayload, User } from "../types/auth";

export const useAuthStore = defineStore("auth", () => {
  const API_URL = "http://localhost:3001/users";

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

    const response = await axios.get<User[]>(`${API_URL}?email=${email}`);
    const foundUser = response.data[0];

    if (!foundUser) {
      throw new Error("User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, foundUser.password);

    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    user.value = foundUser;
    localStorage.setItem("user", JSON.stringify(foundUser));
  };

  const register = async (payload: RegisterPayload) => {
    const name = payload.name.trim();
    const email = payload.email.trim();
    const password = payload.password;

    const existingUserResponse = await axios.get<User[]>(
      `${API_URL}?email=${email}`
    );

    if (existingUserResponse.data.length > 0) {
      throw new Error("This email is already registered");
    }

    await axios.post<User>(API_URL, {
      name,
      email,
      password,
    });
  };

  const logout = () => {
    user.value = null;
    localStorage.removeItem("user");
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