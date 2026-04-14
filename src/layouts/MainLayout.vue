<template>
  <q-layout view="hHh Lpr lFf">
    <q-header elevated class="bg-primary">
      <q-toolbar>
        <q-btn flat dense icon="menu" @click="drawer = !drawer" />

        <q-toolbar-title>{{ t("main.header") }}</q-toolbar-title>

        <q-btn-dropdown
          flat
          :label="locale.toUpperCase()"
          dropdown-icon="translate"
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
          @click="toggleDark"
        />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawer" bordered show-if-above :breakpoint="768">
      <AppSidebar />
    </q-drawer>

    <q-page-container class="page-container">
      <q-page class="page-content">
        <div class="page-inner">
          <router-view />
        </div>
      </q-page>
    </q-page-container>

    <NoteEditor
      v-if="noteEditor.showModal"
      v-model="noteEditor.showModal"
      variant="modal"
      :initial-title="noteEditor.title"
      :initial-content="noteEditor.content"
      :is-editing="noteEditor.editingNoteId !== null"
      @save="handleSave"
      @cancel="noteEditor.closeModal()"
    />

    <TaskEditor
      v-model="taskEditor.showAddModal"
      variant="modal"
      :initial-title="taskEditor.title"
      :initial-content="taskEditor.content"
      :initial-due-date="taskEditor.dueDate"
      :initial-priority="taskEditor.priority"
      @save="handleAddTask"
      @cancel="taskEditor.closeAddModal()"
    />
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useQuasar } from "quasar";
import AppSidebar from "../components/layout/AppSidebar.vue";
import NoteEditor from "@/components/notes/NoteEditor.vue";
import { useNoteEditorStore } from "@/stores/note-editor";
import { useNotesStore } from "@/stores/notes";
import { useAuthStore } from "@/stores/auth";
import { useI18n } from "vue-i18n";
import { useLoadingStore } from "@/stores/loading";

import TaskEditor from "@/components/tasks/TaskEditor.vue";
import { useTaskEditorStore } from "@/stores/task-editor";
import { useTasksStore } from "@/stores/tasks";


const loading = useLoadingStore();

const $q = useQuasar();
const { t, locale } = useI18n();

const changeLocale = (lang: "tr" | "en") => {
  locale.value = lang;
  localStorage.setItem("locale", lang);
};

const toggleDark = () => {
  $q.dark.toggle();
  localStorage.setItem("dark", String($q.dark.isActive));
};

const drawer = ref(true);

const noteEditor = useNoteEditorStore();
const notesStore = useNotesStore();
const authStore = useAuthStore();
const taskEditor = useTaskEditorStore()
const tasksStore =useTasksStore()

const handleSave = async (payload: { title: string; content: string }) => {
  if (noteEditor.editingNoteId === null) {
    const userId = authStore.user?.id;
    if (!userId) return;

    const now = new Date().toISOString();

    await notesStore.addNote({
      ...payload,
      userId,
      createdAt: now,
      updatedAt: now,
      starred: false,
    });
  } else {
    await notesStore.updateNote(noteEditor.editingNoteId, payload);
  }

  noteEditor.closeModal();
};

  const handleAddTask = async (payload: {
    title: string
    content: string
    dueDate: string | null
    priority: 'low' | 'medium' | 'high' 
  }) => {
    const userId = authStore.user?.id
    if (!userId) return

    await tasksStore.addTask({
      ...payload,
      userId,
      createdAt: new Date().toISOString(),
      starred: false,
      completed: false,
    })

    taskEditor.closeAddModal()
  }
</script>

<style scoped>
.page-container {
  height: 100%;
  overflow: hidden;
}

.page-content {
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

.page-inner {
  height: 100%;
  min-height: 0;
  overflow: hidden;
  padding: 16px;
  box-sizing: border-box;
}
</style>
