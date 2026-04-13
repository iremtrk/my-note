<template>
  <div class="auth-shell">
    <div class="auth-left">
      <div class="overlay"></div>

      <div class="auth-left-content">
        <h1 class="auth-title">
          {{ currentContent.title }}
        </h1>

        <p class="auth-subtitle">
          {{ currentContent.subtitle }}
        </p>

        <div class="feature-list">
          <div
            v-for="feature in currentContent.features"
            :key="feature"
            class="feature-item"
          >
            • {{ feature }}
          </div>
        </div>
      </div>
    </div>

    <div class="auth-right">
      <div class="form-wrapper">
        <q-card flat class="auth-card text-primary">
          <router-view />
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const contentMap = {
  login: {
    title: "Capture your notes, tasks, and ideas in one place.",
    subtitle:
      "Organize your daily workflow, keep track of important tasks, and never lose your thoughts again.",
    features: [
      "Create and manage personal notes",
      "Track daily tasks",
      "Keep everything simple and accessible",
    ],
  },
  register: {
    title: "Start building your personal note and task space.",
    subtitle:
      "Create an account to save ideas, plan your day, and manage everything from one clean workspace.",
    features: [
      "Save your notes securely",
      "Organize your daily task flow",
      "Access your content anytime",
    ],
  },
};

const currentContent = computed(() => {
  if (route.path.includes("/register")) return contentMap.register;
  return contentMap.login;
});
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
  background: url("/background.avif") center/cover no-repeat;
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
