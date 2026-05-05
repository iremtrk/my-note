<template>
  <q-card bordered class="full-height tasks-card">
    <q-card-section class="task-header">
      <div class="search-area">
        <q-input
          v-model="tasksStore.searchQuery"
          outlined
          dense
          :placeholder="t('taskList.search')"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <div class="actions-area">
        <q-btn icon="sort" flat round dense color="grey-7">
          <q-menu anchor="bottom right" self="top right">
            <q-list style="min-width: 180px">
              <q-item-label header class="text-caption text-grey-6">
                {{ t("taskList.sort") }}
              </q-item-label>
              <q-item
                v-for="opt in sortOptions"
                :key="opt.value"
                clickable
                v-close-popup
                :active="tasksStore.sortOrder === opt.value"
                active-class="text-primary"
                @click="tasksStore.sortOrder = opt.value"
              >
                <q-item-section avatar>
                  <q-icon :name="opt.icon" size="18px" />
                </q-item-section>
                <q-item-section>{{ opt.label }}</q-item-section>
                <q-item-section side v-if="tasksStore.sortOrder === opt.value">
                  <q-icon name="check" size="16px" color="primary" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <q-btn
          icon="add"
          round
          flat
          color="primary"
          @click="$emit('add-task')"
        />
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section v-if="!hasFetched">
      <q-spinner color="primary" size="50px" />
    </q-card-section>

    <q-card-section v-else-if="tasks.length === 0" class="text-grey">
      {{ t("taskList.empty") }}
    </q-card-section>

    <q-card-section v-else class="list-section">
      <div class="task-scroll">
        <template v-for="(task, index) in tasks" :key="task.id">
          <TaskRow
            :task="task"
            :is-active="selectedTaskId === task.id"
            @select="$emit('select-task', $event)"
            @toggle-star="$emit('toggle-star', $event)"
            @toggle-complete="$emit('toggle-complete', $event)"
            @delete="$emit('delete-task', $event)"
          />

          <q-separator v-if="index !== tasks.length - 1" />
        </template>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import TaskRow from "./TaskRow.vue";
import type { Task } from "@/types/tasks";
import { useTasksStore } from "@/stores/tasks";
import type { TaskSortOrder } from "@/stores/tasks";

const { t } = useI18n({ useScope: "global" });

defineProps<{
  tasks: Task[];
  selectedTaskId: number | null;
  hasFetched: boolean;
}>();

defineEmits<{
  (e: "select-task", task: Task): void;
  (e: "toggle-star", id: number): void;
  (e: "toggle-complete", id: number): void;
  (e: "add-task"): void;
  (e: "delete-task", id: number): void;
}>();

const tasksStore = useTasksStore();

const sortOptions = computed<
  { label: string; value: TaskSortOrder; icon: string }[]
>(() => [
  { label: t("taskList.sortNewest"), value: "newest", icon: "arrow_downward" },
  { label: t("taskList.sortOldest"), value: "oldest", icon: "arrow_upward" },
  { label: t("taskList.sortDueDate"), value: "dueDate", icon: "event" },
  { label: t("taskList.sortPriority"), value: "priority", icon: "flag" },
]);

onUnmounted(() => {
  tasksStore.clearSearch();
});
</script>

<style scoped>
.tasks-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.task-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.search-area :deep(.q-field) {
  width: 100%;
}

.actions-area {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.list-section {
  flex: 1;
  min-height: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.task-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
</style>
