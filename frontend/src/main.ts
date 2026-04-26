import { createApp } from "vue";
import { createPinia } from "pinia";
import { Quasar, Notify } from "quasar";
import router from "./router";
import App from "./App.vue";
import { useAuthStore } from "./stores/auth";
import { i18n } from './i18n' 

import "quasar/src/css/index.sass";
import "@quasar/extras/material-icons/material-icons.css";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

const authStore = useAuthStore(pinia);
authStore.loadUserFromLocalStorage();

app.use(i18n)

app.use(router);
app.use(Quasar, {
  plugins: {
    Notify
  },
  config:{
    dark:false
  }
});

app.mount("#app");