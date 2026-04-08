import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

import AuthLayout from "src/layouts/AuthLayout.vue";
import MainLayout from "src/layouts/MainLayout.vue";

import LoginPage from "src/pages/LoginPage.vue";
import RegisterPage from "src/pages/RegisterPage.vue";
import HomePage from "src/pages/HomePage.vue";
import NotesPage from "src/pages/NotesPage.vue";

const routes = [
  {
    path: "/",
    component: AuthLayout,
    meta: { requiresAuth: false },
    children: [
      {
        path: "",
        redirect: "/login",
      },
      {
        path: "register",
        name: "register",
        component: RegisterPage,
      },
      {
        path: "login",
        name: "login",
        component: LoginPage,
      },

    ],
  },
  {
    path: "/app",
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        redirect: "/app/home",
      },
      {
        path: "home",
        name: "home",
        component: HomePage,
      },
      {
        path: "notes",
        name: "notes",
        component: NotesPage,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const authStore = useAuthStore();

  if (!authStore.user) {
    authStore.loadUserFromLocalStorage();
  }

  const isAuthenticated = authStore.isAuthenticated;

  if (to.meta.requiresAuth && !isAuthenticated) {
    return "/login";
  }

  if ((to.path === "/login") && isAuthenticated) {
    return "/app/home";
  }

  return true;
});

export default router;