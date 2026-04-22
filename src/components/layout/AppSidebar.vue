<template>
  <div class="sidebar-container">
    <q-list bordered padding>
      <q-item class="buttons-row">
        <div class="btn-wrapper">
          <q-btn
            :label="t('sidebar.newNote')"
            color="primary"
            @click="noteEditor.openNewNoteModal()"
          />
        </div>

        <div class="btn-wrapper">
          <q-btn
            :label="t('sidebar.newTask')"
            color="primary"
            @click="taskEditor.openAddModal()"
          />
        </div>
      </q-item>

      <q-item
        clickable
        to="/app/home"
        tag="router-link"
        exact
        active-class="text-primary"
      >
        <q-item-section avatar>
          <q-icon name="home" />
        </q-item-section>
        <q-item-section>{{ t("sidebar.home") }}</q-item-section>
      </q-item>

      <q-item
        clickable
        to="/app/notes"
        tag="router-link"
        active-class="text-primary"
      >
        <q-item-section avatar>
          <q-icon name="note" />
        </q-item-section>
        <q-item-section>{{ t("sidebar.notes") }}</q-item-section>
      </q-item>

      <q-item
        clickable
        to="/app/tasks"
        tag="router-link"
        active-class="text-primary">
        <q-item-section avatar>
          <q-icon name="task" />
        </q-item-section>
        <q-item-section>{{ t("sidebar.tasks") }}</q-item-section>
      </q-item>

      <q-item
        clickable
        to="/app/calendar"
        tag="router-link"
        active-class="text-primary">
        <q-item-section avatar>
          <q-icon name="event"/>
        </q-item-section>
        <q-item-section>{{ t("sidebar.calendar") }}</q-item-section>
      </q-item>

      <q-item
        clickable
        to="/app/shared"
        tag="router-link"
        active-class="text-primary">
        <q-item-section avatar>
          <q-icon name="event"/>
        </q-item-section>
        <q-item-section>{{ t("sidebar.shared") }}</q-item-section>
      </q-item>
    </q-list>

    <div class="logout-section">
      <q-separator class="q-my-sm" />

      <q-item class="row items-center justify-between">
        <div class="row items-center q-gutter-sm">
          <q-avatar size="32px" color="primary" text-color="white">
            {{ authStore.user?.name?.charAt(0).toUpperCase() }}
          </q-avatar>

          <span class="text-weight-medium">
            {{ t("sidebar.welcome") }}, {{ authStore.user?.name }}
          </span>
        </div>

        <q-icon
          name="logout"
          size="20px"
          class="cursor-pointer text-grey"
          @click="handleLogout"
        />
      </q-item>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useNotesStore } from "@/stores/notes";
import { useI18n } from "vue-i18n";
import { useTasksStore } from "@/stores/tasks";
import { useNoteEditorStore } from "@/stores/note-editor";
import { useTaskEditorStore } from "@/stores/task-editor";

const { t, locale } = useI18n();

const router = useRouter();
const authStore = useAuthStore();

const noteEditor = useNoteEditorStore();
const taskEditor = useTaskEditorStore();

const handleLogout = () => {
  authStore.logout();
  locale.value = "en";
  router.push("/login");
};
</script>

<style scoped>
.sidebar-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.q-item {
  color: grey;
}

.buttons-row {
  display: flex;
  gap: 8px;
}

.btn-wrapper {
  flex: 1;
}

.logout-section {
  margin-top: auto;
}
</style>
