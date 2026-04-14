<template>
  <div class="row q-col-gutter-md tasks-page">
    <div class="col-4 full-height">
      <TaskList
        :tasks="tasksStore.filteredTasks"
        :selected-task-id="tasksStore.selectedTask?.id ?? null"
        @select-task="handleSelectTask"
        @toggle-star="tasksStore.toggleStar"
        @toggle-complete="tasksStore.toggleComplete"
        @add-task="taskEditor.openAddModal()"
      />
    </div>

    <div class="col-8 full-height">
      <div v-if="taskEditor.showSideEditor" class="full-height">
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

      <q-card v-else bordered class="full-height detail-card">
        <q-card-section class="text-grey">
          {{ t("tasks.empty") }}
        </q-card-section>
      </q-card>
    </div>
  </div>

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
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import TaskList from "@/components/tasks/TaskList.vue";
import TaskEditor from "@/components/tasks/TaskEditor.vue";
import { useTaskActions } from "@/composables/useTaskActions";

const { t } = useI18n({ useScope: "global" });

const {
  taskEditor,
  tasksStore,
  handleSelectTask,
  handleAddTask,
  handleUpdateTask,
  handleDeleteTask,
  setupLifecycle,
} = useTaskActions();

setupLifecycle();
</script>

<style scoped>
.tasks-page {
  height: calc(100vh - 60px);
}
.detail-card {
  display: flex;
  flex-direction: column;
}
</style>
