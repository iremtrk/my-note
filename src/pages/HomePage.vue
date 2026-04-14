<template>
  <div class="home-page q-pa-md">
    <div class="home-sections">
      <section class="section-card notes-section">
        <div class="section-header row items-center justify-between">
          <div class="text-h6">{{ t("sidebar.notes") }}</div>

          <q-btn icon="sort" flat round dense color="grey-7">
            <q-menu anchor="bottom right" self="top right">
              <q-list style="min-width: 200px">
                <q-item-label header class="text-caption text-grey-6">
                  {{ t("home.sort") }}
                </q-item-label>

                <q-item
                  v-for="opt in sortOptions"
                  :key="opt.value"
                  clickable
                  v-close-popup
                  :active="notesStore.sortOrder === opt.value"
                  active-class="text-primary"
                  @click="notesStore.sortOrder = opt.value"
                >
                  <q-item-section avatar>
                    <q-icon :name="opt.icon" size="18px" />
                  </q-item-section>
                  <q-item-section>{{ opt.label }}</q-item-section>
                  <q-item-section
                    side
                    v-if="notesStore.sortOrder === opt.value"
                  >
                    <q-icon name="check" size="16px" color="primary" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>

        <div v-if="!notesStore.hasFetched" class="panel-loading">
          <q-spinner color="primary" size="44px" />
        </div>

        <div v-else-if="notesStore.notes.length === 0" class="panel-empty">
          <q-btn
            icon="task"
            color="primary"
            @click="noteEditor.openNewNoteModal()"
          />
          <div class="text-h6 q-mt-sm">{{ t("home.noNote") }}</div>
          <div class="text-grey q-mt-sm empty-text">
            {{ t("home.firstNote") }}
          </div>
        </div>

        <div v-else class="section-content notes-content">
          <div class="notes-scroll">
            <NoteCard
              v-for="note in notesStore.filteredNotes"
              :key="note.id"
              :note="note"
              @select="handleSelect"
              @delete="handleDelete"
              @toggle-star="
                (id) =>
                  notesStore.toggleStar(
                    typeof id === 'string' ? parseInt(id) : id,
                  )
              "
            />
          </div>

          <div v-if="noteEditor.showSideEditor" class="detail-panel">
            <NoteEditor
              variant="side"
              :initial-title="noteEditor.title"
              :initial-content="noteEditor.content"
              :is-editing="noteEditor.editingNoteId !== null"
              @save="handleSave"
              @cancel="noteEditor.closeSideEditor()"
              @delete="handleDelete"
            />
          </div>
        </div>
      </section>

      <section class="section-card tasks-section">
        <div class="section-header row items-center justify-between">
          <div class="text-h6">{{ t("sidebar.tasks") }}</div>
        </div>

        <div v-if="!tasksStore.hasFetched" class="panel-loading">
          <q-spinner color="primary" size="44px" />
        </div>

        <div v-else-if="tasksStore.tasks.length === 0" class="panel-empty">
          <q-btn
            icon="task"
            color="primary"
            @click="taskEditor.openAddModal()"
          />
          <div class="text-h6 q-mt-sm">{{ t("home.noTask") }}</div>
          <div class="text-grey q-mt-sm empty-text">
            {{ t("home.firstTask") }}
          </div>
        </div>

        <div v-else class="section-content tasks-content">
          <HomeTaskList
            class="task-list-panel"
            :tasks="tasksStore.filteredTasks"
            :selected-task-id="tasksStore.selectedTask?.id ?? null"
            :has-fetched="tasksStore.hasFetched"
            @select-task="handleSelectTask"
            @toggle-star="tasksStore.toggleStar"
            @toggle-complete="tasksStore.toggleComplete"
          />

          <div v-if="taskEditor.showSideEditor" class="detail-panel">
            <TaskEditor
              variant="side"
              :initial-title="taskEditor.title"
              :initial-content="taskEditor.content"
              :initial-due-date="taskEditor.dueDate"
              :initial-priority="taskEditor.priority"
              :is-completed="tasksStore.selectedTask?.completed ?? false"
              @save="handleUpdateTask"
              @cancel="taskEditor.closeSideEditor()"
              @delete="handleDeleteTask()"
              @toggle-complete="
                tasksStore.selectedTask &&
                tasksStore.toggleComplete(tasksStore.selectedTask.id)
              "
            />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";
import NoteCard from "@/components/notes/NoteCard.vue";
import NoteEditor from "@/components/notes/NoteEditor.vue";
import HomeTaskList from "@/components/tasks/HomeTaskList.vue";
import TaskEditor from "@/components/tasks/TaskEditor.vue";
import { useNoteActions } from "@/composables/useNoteActions";
import { useTaskActions } from "@/composables/useTaskActions";
import type { SortOrder } from "@/stores/notes";

const { t } = useI18n();

const {
  noteEditor,
  notesStore,
  handleSelect,
  handleSave,
  handleDelete,
  setupLifecycle: setupNoteLifecycle,
} = useNoteActions();

const {
  taskEditor,
  tasksStore,
  handleSelectTask,
  handleUpdateTask,
  handleDeleteTask,
  setupLifecycle: setupTaskLifecycle,
} = useTaskActions();

setupNoteLifecycle();
setupTaskLifecycle();

onMounted(() => {
  noteEditor.closeAll();
  taskEditor.closeAll();
});

const sortOptions: { label: string; value: SortOrder; icon: string }[] = [
  { label: t("home.sortNewest"), value: "newest", icon: "arrow_downward" },
  { label: t("home.sortOldest"), value: "oldest", icon: "arrow_upward" },
  { label: t("home.sortUpdated"), value: "updated", icon: "update" },
];
</script>

<style scoped>
.home-page {
  min-height: calc(100vh - 82px);
  overflow-y: auto;
  overflow-x: hidden;
}

.home-sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 0;
}

.section-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 18px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.notes-section {
  min-height: 420px;
}

.tasks-section {
  min-height: 420px;
}

.section-header {
  flex-shrink: 0;
  margin-bottom: 12px;
}

.section-content {
  flex: 1;
  min-height: 0;
  display: grid;
  gap: 16px;
  align-items: stretch;
}

.notes-content {
  grid-template-columns: 1fr;
}

.notes-content:has(.detail-panel) {
  grid-template-columns: minmax(320px, 2fr) minmax(420px, 0.95fr);
}

.tasks-content {
  grid-template-columns: 1fr;
}

.tasks-content:has(.detail-panel) {
  grid-template-columns: minmax(320px, 1fr) minmax(460px, 1fr);
}

.notes-scroll {
  min-height: 320px;
  max-height: 520px;
  overflow-y: auto;
  overflow-x: hidden;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 280px));
  gap: 16px;
  align-content: start;
  justify-content: start;
  padding-right: 4px;
}

.task-list-panel {
  min-height: 320px;
  max-height: 520px;
  overflow: hidden;
}

.detail-panel {
  min-height: 520px;
  max-height: 520px;
  overflow: hidden;
}

.panel-loading,
.panel-empty {
  flex: 1;
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex-direction: column;
}

.empty-text {
  max-width: 360px;
  line-height: 1.6;
}

@media (max-width: 1100px) {
  .notes-content:has(.detail-panel),
  .tasks-content:has(.detail-panel) {
    grid-template-columns: 1fr;
  }

  .detail-panel {
    min-height: 560px;
  }

  .notes-scroll,
  .task-list-panel {
    max-height: 360px;
  }
}

@media (max-width: 900px) {
  .home-page {
    min-height: auto;
  }

  .section-card {
    min-height: auto;
  }

  .notes-section,
  .tasks-section {
    min-height: 380px;
  }

  .detail-panel {
    min-height: 500px;
  }
}
</style>
