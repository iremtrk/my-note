<template>
  <q-dialog
    v-if="variant === 'modal'"
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <q-card class="editor-card modal-editor-card">
      <q-card-section class="row items-center justify-between editor-header">
        <div class="text-h6">{{ t("taskEditor.newTask") }}</div>
        <q-btn icon="close" flat round @click="handleCancel" />
      </q-card-section>

      <q-separator />

      <q-card-section class="editor-body">
        <q-input
          v-model="localTitle"
          :label="t('taskEditor.title')"
          dense
          maxlength="80"
          counter
          autofocus
          class="title-input"
        />

        <div class="meta-grid">
          <q-input
            v-model="localDueDate"
            :label="t('taskEditor.dueDate')"
            outlined
            dense
            type="date"
          />

          <div>
            <div class="text-caption text-grey-7 q-mb-xs">
              {{ t("taskEditor.priority") }}
            </div>
            <div class="row q-gutter-sm">
              <q-btn
                v-for="opt in priorityOptions"
                :key="opt.value"
                :label="opt.label"
                :color="localPriority === opt.value ? opt.color : 'grey-3'"
                :text-color="localPriority === opt.value ? 'white' : 'grey-8'"
                rounded
                unelevated
                dense
                size="sm"
                @click="localPriority = opt.value"
              />
            </div>
          </div>
        </div>

        <div class="content-area">
          <q-input
            v-model="localContent"
            :label="t('taskEditor.description')"
            outlined
            type="textarea"
            class="editor-content"
          />
        </div>
      </q-card-section>

      <q-card-actions align="right" class="editor-actions">
        <q-btn
          color="primary"
          :label="t('taskEditor.add')"
          unelevated
          :disable="!localTitle.trim()"
          @click="handleSave"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-card v-else bordered class="editor-card side-editor-card">
    <q-card-section class="row items-center justify-between editor-header">
      <div class="text-h6">{{ t("taskEditor.taskDetail") }}</div>

      <div class="row items-center q-gutter-xs">
        <q-btn
          icon="delete"
          flat
          round
          color="negative"
          dense
          @click="showDeleteConfirm = true"
        />
        <q-btn icon="close" flat round dense @click="handleCancel" />
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section class="editor-body">
      <div class="top-fields">
        <div class="row items-center no-wrap q-col-gutter-sm">
          <q-checkbox
            :model-value="isCompleted"
            color="primary"
            @update:model-value="emit('toggle-complete')"
          />
          <q-input
            v-model="localTitle"
            borderless
            dense
            class="flex-1 side-title-input"
            maxlength="80"
            :input-style="{
              fontSize: '18px',
              textDecoration: isCompleted ? 'line-through' : 'none',
            }"
          />
        </div>

        <div class="meta-grid">
          <q-input
            v-model="localDueDate"
            :label="t('taskEditor.dueDate')"
            outlined
            dense
            type="date"
          />

          <div>
            <div class="text-caption text-grey-7 q-mb-xs">
              {{ t('taskEditor.priority') }}
            </div>
            <div class="row q-gutter-sm">
              <q-btn
                v-for="opt in priorityOptions"
                :key="opt.value"
                :label="opt.label"
                :color="localPriority === opt.value ? opt.color : 'grey-3'"
                :text-color="localPriority === opt.value ? 'white' : 'grey-8'"
                rounded
                unelevated
                dense
                size="sm"
                @click="localPriority = opt.value"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="content-area">
        <q-input
          v-model="localContent"
          outlined
          type="textarea"
          
          class="editor-content"
        />
      </div>
    </q-card-section>
    <ConfirmDelete 
    v-model="showDeleteConfirm" 
    :title="t('taskEditor.deleteTitle')"
    :message="t('taskEditor.deleteMessage')"
    @confirm="confirmDelete"/>
  </q-card>


</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount,computed } from "vue";
import { useI18n } from "vue-i18n";
import type { Task } from "@/types/tasks";

import ConfirmDelete from "@/common/ConfirmDelete.vue";

const { t } = useI18n();

const props = withDefaults(
  defineProps<{
    modelValue?: boolean;
    initialTitle: string;
    initialContent: string;
    initialDueDate: string | null;
    initialPriority: Task["priority"];
    isCompleted?: boolean;
    variant?: "modal" | "side";
  }>(),
  { modelValue: false, variant: "modal", isCompleted: false },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "save",
    payload: {
      title: string;
      content: string;
      dueDate: string | null;
      priority: Task["priority"];
    },
  ): void;
  (e: "cancel"): void;
  (e: "delete"): void;
  (e: "toggle-complete"): void;
}>();

const localTitle = ref("");
const localContent = ref("");
const localDueDate = ref<string | null>(null);
const localPriority = ref<Task["priority"]>("low");
const isHydrating = ref(false);
const showDeleteConfirm = ref(false);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const priorityOptions = computed(() => [
  { value: "low" as const, label: t("taskEditor.low"), color: "positive" },
  { value: "medium" as const, label: t("taskEditor.medium"), color: "warning" },
  { value: "high" as const, label: t("taskEditor.high"), color: "negative" },
]);

watch(
  () => [
    props.initialTitle,
    props.initialContent,
    props.initialDueDate,
    props.initialPriority,
    props.modelValue,
  ],
  () => {
    isHydrating.value = true;
    localTitle.value = props.initialTitle;
    localContent.value = props.initialContent;
    localDueDate.value = props.initialDueDate;
    localPriority.value = props.initialPriority;

    setTimeout(() => {
      isHydrating.value = false;
    }, 0);
  },
  { immediate: true },
);

watch([localTitle, localContent, localDueDate, localPriority], () => {
  if (props.variant !== "side") return;
  if (isHydrating.value) return;

  if (debounceTimer) clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    const title = localTitle.value.trim();
    if (!title) return;

    emit("save", {
      title,
      content: localContent.value.trim(),
      dueDate: localDueDate.value,
      priority: localPriority.value,
    });
  }, 700);
});

const handleSave = () => {
  const title = localTitle.value.trim();
  if (!title) return;

  emit("save", {
    title,
    content: localContent.value.trim(),
    dueDate: localDueDate.value,
    priority: localPriority.value,
  });
};

const handleCancel = () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  emit("cancel");
  emit("update:modelValue", false);
};

const confirmDelete = () => {
  showDeleteConfirm.value = false;
  emit("delete");
};

onBeforeUnmount(() => {
  if (debounceTimer) clearTimeout(debounceTimer);
});
</script>

<style scoped>
.editor-card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.modal-editor-card {
  min-width: 520px;
  max-width: 760px;
  width: 92vw;
  height: 85vh;
  max-height: 85vh;
  border-radius: 18px;
}

.side-editor-card {
  height: 100%;
  min-height: 0;
}

.editor-header {
  flex-shrink: 0;
}

.editor-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
}

.editor-actions {
  flex-shrink: 0;
  padding: 0 20px 20px;
  gap: 8px;
}

.top-fields {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.side-title-input {
  flex: 1;
}

.title-input {
  flex-shrink: 0;
}

.meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: start;
  flex-shrink: 0;
}

.content-area {
  flex: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
}

.editor-content {
  flex: 1;
  min-height: 0;
  height: 100%;
}

:deep(.editor-content .q-field__control) {
  height: 100%;
  min-height: 0;
  align-items: stretch;
}

:deep(.editor-content .q-field__native),
:deep(.editor-content textarea) {
  height: 100% !important;
  min-height: 0 !important;
  overflow-y: auto !important;
  resize: none !important;
}

:deep(.editor-content textarea) {
  overflow-x: hidden;
  overflow-wrap: anywhere;
  word-break: break-word;
  line-height: 1.5;
  padding-top: 10px;
}

@media (max-width: 700px) {
  .meta-grid {
    grid-template-columns: 1fr;
  }
}
</style>