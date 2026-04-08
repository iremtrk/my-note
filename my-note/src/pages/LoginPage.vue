<template>
  <div class="auth-page row justify-center items-center">
    <div class="col-11 col-sm-8 col-md-5 col-lg-4">
      <q-card bordered>
        <q-card-section>
          <div class="text-h6 text-center">Login</div>
        </q-card-section>

        <q-card-section class="column q-gutter-md">
          <q-input
            v-model="email"
            label="Email"
            outlined
          />

          <q-input
            v-model="password"
            label="Password"
            type="password"
            outlined
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            label="Login"
            color="primary"
            @click="handleLogin"
          />
        </q-card-actions>

        <q-card-section class="text-center">
          <q-btn
            flat
            label="Don't have an account? Register"
            @click="$router.push('/register')"
          />
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();

const email = ref("");
const password = ref("");

const handleLogin = async () => {
  try {
    await authStore.login({
      email: email.value,
      password: password.value,
    });

    router.push("/app/notes");
  } catch (error) {
    console.error(error);
    alert("Login failed");
  }
};
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
}
</style>