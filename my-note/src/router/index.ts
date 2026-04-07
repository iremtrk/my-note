import { createRouter, createWebHistory } from "vue-router";
import HomePage from "src/pages/HomePage.vue";
import MainLayout from "../layouts/MainLayout.vue";
import NotesPage from "../pages/NotesPage.vue";

const routes = [
  {
    path: "/",
    component: MainLayout,
    children: [
      {
        path: "",
        name: "home",
        component: HomePage,
      },
      {
        path: "notes",
        name: "notes",
        component:NotesPage
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
