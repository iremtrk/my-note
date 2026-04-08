<template>
  <div class="auth-page row justify-center items-center">
    <div class="col-11 col-sm-8 col-md-5 col-lg-4">
      <q-card bordered>
        <q-card-section>
          <div class="text-h6 text-center">Register</div>
        </q-card-section>

        <q-card-section class="column q-gutter-md">
          <q-input
            v-model="name"
            label="Name"
            outlined
          />

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
            label="Register"
            color="primary"
            @click="handleRegister"
          />
        </q-card-actions>

        <q-card-section class="text-center">
          <q-btn
            flat
            label="Already have an account? Login"
            @click="$router.push('/login')"
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

const name = ref("");
const email = ref("");
const password = ref("");

const handleRegister = async () => {
  try {
    await authStore.register({
      name: name.value,
      email: email.value,
      password: password.value,
    });

    router.push("/login");
  } catch (error) {
    console.error(error);
    alert("Register failed");
  }
};
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
}
</style>