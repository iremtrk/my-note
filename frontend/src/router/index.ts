import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

import AuthLayout from "@/layouts/AuthLayout.vue";
import MainLayout from "@/layouts/MainLayout.vue";

import LoginPage from "@/pages/LoginPage.vue";
import RegisterPage from "@/pages/RegisterPage.vue";
import HomePage from "@/pages/HomePage.vue";
import NotesPage from "@/pages/NotesPage.vue";
import TasksPage from "@/pages/TasksPage.vue";
import CalendarPage from "@/pages/CalendarPage.vue";
import SharedPage from "@/pages/SharedPage.vue";

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
      {
        path: "tasks",
        name: "tasks",
        component: TasksPage,
      },
      {
        path: "calendar",
        name: "calendar",
        component: CalendarPage,
      },
      {
        path:"shared",
        name:"shared",
        component:SharedPage
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

  if (to.path === "/login" && isAuthenticated) {
    return "/app/home";
  }

  return true;
});

export default router;
