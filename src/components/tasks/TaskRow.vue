<template>
  <div
    class="task-row"
    :class="{
      'task-row--active': isActive,
      'task-row--completed': task.completed,
    }"
    @click="$emit('select', task)"
  >
    <div class="task-row__left">
      <q-checkbox
        :model-value="task.completed"
        color="primary"
        dense
        @update:model-value="$emit('toggle-complete', task.id)"
        @click.stop
      />
    </div>

    <div class="task-row__body">
      <div class="task-row__title-row">
        <span class="task-row__title">{{ task.title }}</span>
        <q-badge
          :color="priorityColor"
          class="task-row__priority"
          :label="task.priority"
          rounded
        />
      </div>

      <div v-if="task.content" class="task-row__preview">
        {{ task.content }}
      </div>

      <div class="task-row__meta">
        <span
          v-if="task.dueDate"
          class="task-row__due"
          :class="{ 'task-row__due--overdue': isOverdue }"
        >
          <q-icon name="event" size="12px" />
          {{ formatNoteDate(task.dueDate) }}
        </span>
      </div>
    </div>

    <div class="task-row__actions">
      <q-btn
        :icon="task.starred ? 'star' : 'star_border'"
        :color="task.starred ? 'amber' : 'grey-4'"
        flat
        round
        dense
        size="sm"
        @click.stop="$emit('toggle-star', task.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Task } from "@/types/tasks";
import { formatNoteDate } from "@/utils/date";

const props = defineProps<{
  task: Task;
  isActive: boolean;
}>();

defineEmits<{
  (e: "select", task: Task): void;
  (e: "toggle-star", id: number): void;
  (e: "toggle-complete", id: number): void;
}>();

const priorityColor = computed(() => {
  const map = { high: "negative", medium: "warning", low: "positive" };
  return map[props.task.priority];
});

const isOverdue = computed(() => {
  if (!props.task.dueDate || props.task.completed) return false;
  return new Date(props.task.dueDate) < new Date();
});
</script>

<style scoped>
.task-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
  border: 1px solid transparent;
  margin-bottom: 4px;
}
.task-row:hover {
  background: rgba(0, 0, 0, 0.04);
}
.task-row--active {
  background: rgba(25, 118, 210, 0.08) !important;
  border-color: rgba(25, 118, 210, 0.25);
}
.task-row--completed .task-row__title {
  text-decoration: line-through;
  color: #9ca3af;
}
.task-row__left {
  padding-top: 2px;
  flex-shrink: 0;
}
.task-row__body {
  flex: 1;
  min-width: 0;
}
.task-row__title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
}
.task-row__title {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}
.task-row__priority {
  flex-shrink: 0;
  font-size: 10px;
  text-transform: capitalize;
}
.task-row__preview {
  font-size: 12px;
  color: #6b7280;
  margin-top: 3px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.task-row__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}
.task-row__due {
  font-size: 11px;
  color: #9ca3af;
  display: flex;
  align-items: center;
  gap: 3px;
}
.task-row__due--overdue {
  color: #ef4444;
}
.task-row__actions {
  flex-shrink: 0;
}
</style>
