<template>
  <div
    class="task-row"
    :class="{
      'task-row--active': isActive,
      'task-row--completed': task.completed,
    }"
    @click="$emit('select', task)">
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
        <span
          class="task-row__priority-icon"
          :class="`priority--${task.priority}`">
          {{ priorityIcon }}
        </span>
      </div>

      <div v-if="task.content" class="task-row__preview">
        {{ task.content }}
      </div>
    </div>

    <div class="task-row__actions">
      <q-btn
        :icon="task.starred ? 'star' : 'star_border'"
        :color="task.starred ? 'primary' : 'grey-4'"
        flat
        round
        dense
        size="sm"
        @click.stop="$emit('toggle-star', task.id)"
      />

      <q-btn 
        icon="close"
        flat round dense
        size="sm"
        class="task-delete-btn"
        @click.stop="showDeleteConfirm =true"
      />
    </div>

    <ConfirmDeleteTask
      v-model="showDeleteConfirm"
      @confirm="$emit('delete', task.id)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed,ref } from "vue";
import type { Task } from "@/types/tasks";
import ConfirmDeleteTask from "@/components/tasks/ConfirmDeleteTask.vue";

const showDeleteConfirm = ref(false)

const props = defineProps<{
  task: Task;
  isActive: boolean;
}>();

defineEmits<{
  (e: "select", task: Task): void;
  (e: "delete", id: number): void;
  (e: "toggle-star", id: number): void;
  (e: "toggle-complete", id: number): void;
}>();

const priorityIcon = computed(() => {
  const map = { low: "!", medium: "!!", high: "!!!" };
  return map[props.task.priority];
});
</script>

<style scoped>
.task-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid transparent;
}
.task-row:hover {
  background: rgba(0, 0, 0, 0.04);
}
.task-row--active {
  background: rgba(140, 140, 141, 0.08) !important;
  color: var(--q-primary);
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
.task-row__priority-icon {
  flex-shrink: 0;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -1px;
}
.priority--low {
  color: #22c55e;
}
.priority--medium {
  color: #f97316;
}
.priority--high {
  color: #ef4444;
}

.task-row__preview {
  font-size: 12px;
  color: #6b7280;
  margin-top: 3px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
.task-row__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.task-row__actions {
  flex-shrink: 0;
}
</style>
