<template>
  <div class="auth-shell">
    <div class="auth-left">
      <div class="overlay"></div>

      <div class="auth-left-content">
        <h1 class="auth-title">
          Capture your notes, tasks, and ideas in one place.
        </h1>

        <p class="auth-subtitle">
          Organize your daily workflow, keep track of important tasks, and never
          lose your thoughts again.
        </p>

        <div class="feature-list">
          <div class="feature-item">• Create and manage personal notes</div>
          <div class="feature-item">• Track daily tasks</div>
          <div class="feature-item">
            • Keep everything simple and accessible
          </div>
        </div>
      </div>
    </div>

    <div class="auth-right">
      <div class="form-wrapper">
        <q-card flat class="auth-card text-primary" >
          <q-card-section class="q-pb-none">
            <div class="text-h5 text-weight-bold">Welcome back</div>
            <div class="text-grey-7 q-mt-sm">
              Login to continue managing your notes and tasks.
            </div>
          </q-card-section>

          <q-card-section class="column q-gutter-md">
            <q-input
              v-model="email"
              label="Email"
              outlined
              rounded
              :error="!!emailError"
              :error-message="emailError"
              @keyup.enter="handleLogin"
            />

            <q-input
              v-model="password"
              label="Password"
              type="password"
              outlined
              rounded
              :error="!!passwordError"
              :error-message="passwordError"
              @keyup.enter="handleLogin"
            />
          </q-card-section>

          <q-card-actions vertical class="q-px-md q-pb-md">
            <q-btn
              label="Login"
              color="primary"
              unelevated
              rounded
              class="full-width auth-btn"
              @click="handleLogin"
            />

            <q-btn
              flat
              label="Don’t have an account? Register"
              class="q-mt-sm"
              @click="$router.push('/register')"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";
import { loginSchema } from "../validation/auth";
import { Notify } from "quasar";

const authStore = useAuthStore();
const router = useRouter();

const email = ref("");
const password = ref("");

const emailError = ref("");
const passwordError = ref("");

const handleLogin = async () => {
  emailError.value = "";
  passwordError.value = "";

  try {
    await loginSchema.validate(
      {
        email: email.value,
        password: password.value,
      },
      { abortEarly: false }
    );

    await authStore.login({
      email: email.value,
      password: password.value,
    });

    Notify.create({
      type: "positive",
      message: "Login successful",
      position: "top",
    });

    router.push("/app/notes");
  } catch (err: any) {
    if (err.inner) {
      err.inner.forEach((error: any) => {
        if (error.path === "email") emailError.value = error.message;
        if (error.path === "password") passwordError.value = error.message;
      });
    } else {
      Notify.create({
        type: "negative",
        message: "Login failed. Please check your credentials.",
        position: "top",
      });

      console.error(err);
    }
  }
};
</script>

<style scoped>
.auth-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  background: #f8fafc;
}

.auth-left {
  position: relative;
  overflow: hidden;
  background: url('/background.avif') center/cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  color: white;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(173, 136, 162, 0.2);
}

.auth-left-content {
  position: relative;
  z-index: 1;
  max-width: 520px;
}

.auth-title {
  font-size: 42px;
  line-height: 1.15;
  font-weight: 800;
  margin: 0 0 16px;
}

.auth-subtitle {
  font-size: 16px;
  margin-bottom: 28px;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.feature-item {
  font-size: 15px;
}

.auth-right {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background: #f8fafc;
}

.form-wrapper {
  width: 100%;
  max-width: 430px;
}

.auth-card {
  border-radius: 24px;
  padding: 16px 10px;
  background: white;
  border: 1px solid #e5e7eb;
}

.auth-btn {
  height: 46px;
  font-weight: 600;
  font-size: 15px;
}

@media (max-width: 900px) {
  .auth-shell {
    grid-template-columns: 1fr;
  }

  .auth-left {
    min-height: 280px;
    padding: 32px 24px;
  }

  .auth-title {
    font-size: 30px;
  }

  .auth-right {
    padding: 24px 16px 32px;
  }
}
</style>
