<template>
  <div class="auth-shell">
    <div class="auth-left" :class="{ 'auth-left-dark': $q.dark.isActive }">
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
      <div class="auth-top-actions">
        <q-btn-dropdown
          flat
          dense
          :label="currentLocaleLabel"
          dropdown-icon="translate"
          class="top-action-btn"
        >
          <q-list>
            <q-item clickable v-close-popup @click="changeLocale('tr')">
              <q-item-section>TR</q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="changeLocale('en')">
              <q-item-section>EN</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <q-btn
          flat
          round
          :icon="$q.dark.isActive ? 'dark_mode' : 'light_mode'"
          class="top-action-btn"
          @click="toggleDark"
        />
      </div>

      <div class="form-wrapper">
        <q-card flat class="auth-card">
          <router-view />
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n({ useScope: "global" });

const changeLocale = (lang: "tr" | "en") => {
  locale.value = lang;
  localStorage.setItem("locale", lang);
};

const currentLocaleLabel = computed(() =>
  locale.value === "tr" ? "TR" : "EN"
);

const $q = useQuasar();

const toggleDark = () => {
  $q.dark.toggle();
  localStorage.setItem("dark", String($q.dark.isActive));
};

const route = useRoute();

const contentMap = computed(() => ({
  login: {
    title: t("authLayout.loginTitle"),
    subtitle: t("authLayout.loginSubtitle"),
    features: [
      t("authLayout.loginFeature1"),
      t("authLayout.loginFeature2"),
      t("authLayout.loginFeature3"),
    ],
  },
  register: {
    title: t("authLayout.registerTitle"),
    subtitle: t("authLayout.registerSubtitle"),
    features: [
      t("authLayout.registerFeature1"),
      t("authLayout.registerFeature2"),
      t("authLayout.registerFeature3"),
    ],
  },
}));

const currentContent = computed(() => {
  if (route.path.includes("/register")) return contentMap.value.register;
  return contentMap.value.login;
});
</script>

<style scoped>
.auth-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.1fr 1fr;

}

.auth-left {
  position: relative;
  overflow: hidden;
  background: url("/background.avif") center/cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;

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
  color: #111827;
}

.auth-title {
  font-size: 42px;
  line-height: 1.15;
  font-weight: 800;
  margin: 0 0 16px;
    color: rgba(17, 24, 39, 0.85);
}

.auth-subtitle {
  font-size: 16px;
  line-height: 1.7;

  margin-bottom: 28px;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.feature-item {
  font-size: 15px;
   color: #111827;
}

.auth-right {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;

}

.auth-top-actions {
  position: absolute;
  top: 20px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 2;
}

.form-wrapper {
  width: 100%;
  max-width: 430px;
}

.auth-card {
  border-radius: 24px;
  padding: 16px 10px;
  border: 1px solid #ec8fae;
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

  .auth-top-actions {
    top: 12px;
    right: 12px;
  }
}
</style>