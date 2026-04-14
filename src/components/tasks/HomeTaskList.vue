<template>
  <div class="home-task-list">
    <div class="task-scroll" v-if="hasFetched && tasks.length > 0">
      <TaskRow
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        :is-active="selectedTaskId === task.id"
        @select="$emit('select-task', $event)"
        @toggle-star="$emit('toggle-star', $event)"
        @toggle-complete="$emit('toggle-complete', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { Task } from "@/types/tasks";
import TaskRow from "./TaskRow.vue";

useI18n({ useScope: "global" });

defineProps<{
  tasks: Task[];
  selectedTaskId: number | null;
  hasFetched: boolean;
}>();

defineEmits<{
  (e: "select-task", task: Task): void;
  (e: "toggle-star", id: number): void;
  (e: "toggle-complete", id: number): void;
}>();
</script>

<style scoped>
.home-task-list {
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.task-scroll {
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
}
</style>