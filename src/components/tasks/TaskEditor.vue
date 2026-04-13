<template>
  <!-- ADD MODAL -->
  <q-dialog
    v-if="variant === 'modal'"
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <q-card class="add-task-card">
      <q-card-section class="row items-center justify-between editor-header">
        <div class="text-h6">{{ t("taskEditor.newTask") }}</div>
        <q-btn icon="close" flat round @click="handleCancel" />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-gutter-md">
        <q-input
          v-model="localTitle"
          :label="t('taskEditor.title')"
          outlined
          dense
          maxlength="80"
          counter
          autofocus
        />
        <q-input
          v-model="localContent"
          :label="t('taskEditor.description')"
          outlined
          dense
          type="textarea"
          rows="3"
          autogrow
        />
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
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat :label="t('taskEditor.cancel')" @click="handleCancel" />
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

  <!-- SIDE DETAIL EDITOR -->
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

    <q-card-section class="q-gutter-md side-body">
      <div class="row items-center q-gutter-sm">
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
          :input-style="{
            fontSize: '18px',
            fontWeight: '600',
            textDecoration: isCompleted ? 'line-through' : 'none',
          }"
        />
      </div>

      <q-input
        v-model="localContent"
        :label="t('taskEditor.description')"
        outlined
        dense
        type="textarea"
        rows="4"
        autogrow
      />
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
    </q-card-section>

    <q-dialog v-model="showDeleteConfirm">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ t("taskEditor.deleteTitle") }}</div>
        </q-card-section>
        <q-card-section>{{ t("taskEditor.deleteMessage") }}</q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('taskEditor.cancel')" v-close-popup />
          <q-btn
            flat
            color="negative"
            :label="t('taskEditor.delete')"
            @click="confirmDelete"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from "vue";
import { useI18n } from "vue-i18n";
import type { Task } from "@/types/tasks";

const { t } = useI18n({ useScope: "global" });

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
  (
    e: "save",
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

const priorityOptions = [
  { value: "low" as const, label: t("taskEditor.low"), color: "positive" },
  { value: "medium" as const, label: t("taskEditor.medium"), color: "warning" },
  { value: "high" as const, label: t("taskEditor.high"), color: "negative" },
];

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
.add-task-card {
  min-width: 480px;
  max-width: 560px;
  width: 100%;
}
.editor-card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.side-editor-card {
  height: 100%;
}
.editor-header {
  flex-shrink: 0;
}
.side-body {
  flex: 1;
  overflow-y: auto;
}
.side-title-input {
  flex: 1;
}

</style>
