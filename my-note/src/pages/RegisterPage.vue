<template>
  <div class="auth-shell">
    <div class="auth-left">
      <div class="overlay"></div>

      <div class="auth-left-content">
        <h1 class="auth-title">
          Start building your personal note and task space.
        </h1>

        <p class="auth-subtitle">
          Create an account to save ideas, plan your day, and manage everything
          from one clean workspace.
        </p>

        <div class="feature-list">
          <div class="feature-item">• Save your notes securely</div>
          <div class="feature-item">• Organize your daily task flow</div>
          <div class="feature-item">• Access your content anytime</div>
        </div>
      </div>
    </div>

    <div class="auth-right">
      <div class="form-wrapper">
        <q-card flat class="auth-card text-primary">
          <q-card-section class="q-pb-none">
            <div class="text-h5 text-weight-bold">Create account</div>
            <div class="text-grey-7 q-mt-sm">
              Register to start managing your notes and tasks.
            </div>
          </q-card-section>

          <q-card-section class="column q-gutter-md">
            <q-input
              v-model="name"
              label="Name"
              outlined
              rounded
              :error="!!nameError"
              :error-message="nameError"
              @keyup.enter="handleRegister"
            />

            <q-input
              v-model="email"
              label="Email"
              outlined
              rounded
              :error="!!emailError"
              :error-message="emailError"
              @keyup.enter="handleRegister"
            />

            <q-input
              v-model="password"
              label="Password"
              type="password"
              outlined
              rounded
              :error="!!passwordError"
              :error-message="passwordError"
              @keyup.enter="handleRegister"
            />
          </q-card-section>

          <q-card-actions vertical class="q-px-md q-pb-md">
            <q-btn
              label="Register"
              color="primary"
              unelevated
              rounded
              class="full-width auth-btn"
              :loading="loading"
              @click="handleRegister"
            />

            <q-btn
              flat
              label="Already have an account? Login"
              class="q-mt-sm"
              @click="$router.push('/login')"
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
import { registerSchema } from "../validation/auth";
import { Notify } from "quasar";
import bcrypt from "bcryptjs";

const authStore = useAuthStore();
const router = useRouter();

const name = ref("");
const email = ref("");
const password = ref("");

const nameError = ref("");
const emailError = ref("");
const passwordError = ref("");
const loading = ref(false);

const clearErrors = () => {
  nameError.value = "";
  emailError.value = "";
  passwordError.value = "";
};

const handleRegister = async () => {
  clearErrors();
  loading.value = true;

  try {
    await registerSchema.validate(
      {
        name: name.value,
        email: email.value,
        password: password.value,
      },
      { abortEarly: false }
    );

    const hashedPassword = await bcrypt.hash(password.value, 10);

    await authStore.register({
      name: name.value.trim(),
      email: email.value.trim(),
      password: hashedPassword,
    });

    Notify.create({
      type: "positive",
      message: "Account created successfully",
      caption: "You can now login with your credentials.",
      position: "top",
      timeout: 2500,
    });

    router.push("/login");
  } catch (err: any) {
    if (err?.inner?.length) {
      err.inner.forEach((error: any) => {
        if (error.path === "name") nameError.value = error.message;
        if (error.path === "email") emailError.value = error.message;
        if (error.path === "password") passwordError.value = error.message;
      });
    } else {
      const message =
        err?.message?.toLowerCase().includes("already") ||
        err?.message?.toLowerCase().includes("exists")
          ? "This email is already registered"
          : "Registration failed";

      const caption =
        message === "This email is already registered"
          ? "Please login or use another email."
          : "Something went wrong. Please try again.";

      Notify.create({
        type:
          message === "This email is already registered"
            ? "warning"
            : "negative",
        message,
        caption,
        position: "top",
        timeout: 3000,
      });

      console.error(err);
    }
  } finally {
    loading.value = false;
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
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.9);
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