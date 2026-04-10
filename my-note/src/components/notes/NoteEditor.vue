<template>
  <q-dialog
    v-if="variant === 'modal'"
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <q-card class="editor-card modal-editor-card">
      <q-card-section class="row items-center justify-between editor-header">
        <div class="text-h6">New Note</div>

        <div class="row items-center q-gutter-sm">
          <q-btn icon="close" flat round @click="handleCancel" />
        </div>
      </q-card-section>

      <q-card-section class="editor-body">
        <q-input
          v-model="localTitle"
          class="note-title-input"
          label="Title"
          style="font-size: x-large";
          maxlength="80"
          counter
          autogrow
        />

        <div class="editor-wrapper">
          <q-editor
            v-model="localContent"
            :toolbar="editorToolbar"
            class="editor-content"
          />
        </div>
      </q-card-section>

      <q-card-actions align="right" class="editor-actions">
        <q-btn
          v-if="!isEditing"
          color="primary"
          label="Add"
          @click="handleSave"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-card v-else bordered class="editor-card side-editor-card">
    <q-card-section class="row items-center justify-between editor-header">
      <div class="text-h6">Edit Note</div>

      <div class="row items-center q-gutter-sm">
        <q-btn
          v-if="isEditing"
          icon="delete"
          flat
          round
          color="negative"
          @click="showDeleteConfirm = true"
        />
        <q-btn icon="close" flat round @click="handleCancel" />
      </div>
    </q-card-section>

    <q-card-section class="editor-body">
      <q-input 
      v-model="localTitle" 
      class="note-title-input"
      style="font-size: x-large;" 
      maxlength="80" 
      counter 
      autogrow  
      />

      <div class="editor-wrapper">
        <q-editor
          v-model="localContent"
          :toolbar="editorToolbar"
          class="editor-content"
        />
      </div>
    </q-card-section>

    <q-card-actions align="right" class="editor-actions">
      <q-btn
        v-if="!isEditing"
        color="primary"
        label="Add"
        @click="handleSave"
      />
    </q-card-actions>
  </q-card>
  <ConfirmDeleteDialog v-model="showDeleteConfirm" @confirm="confirmDelete" />
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from "vue";
import ConfirmDeleteDialog from "src/components/notes/ConfirmDeleteDialog.vue";

const props = withDefaults(
  defineProps<{
    modelValue?: boolean;
    initialTitle: string;
    initialContent: string;
    isEditing: boolean;
    variant?: "modal" | "side";
  }>(),
  {
    modelValue: false,
    variant: "modal",
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "save", payload: { title: string; content: string }): void;
  (e: "cancel"): void;
  (e: "delete"): void;
}>();

const localTitle = ref("");
const localContent = ref("");
const isHydrating = ref(false);
const showDeleteConfirm = ref(false);

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const editorToolbar = [
  ["left", "center", "right", "justify"],
  ["bold", "italic", "underline"],
  ["unordered", "ordered"],
  ["quote", "hr"],
  ["undo", "redo"],
  ["fullscreen", "print"],
];

watch(
  () => [props.initialTitle, props.initialContent, props.modelValue],
  () => {
    isHydrating.value = true;
    localTitle.value = props.initialTitle;
    localContent.value = props.initialContent;

    setTimeout(() => {
      isHydrating.value = false;
    }, 0);
  },
  { immediate: true },
);

watch([localTitle, localContent], () => {
  if (!props.isEditing) return;
  if (isHydrating.value) return;

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    const title = localTitle.value.trim();
    const content = localContent.value.trim();

    if (!title && !content) return;

    emit("save", { title, content });
  }, 700);
});

const handleSave = () => {
  const title = localTitle.value.trim();
  const content = localContent.value.trim();

  if (!title && !content) return;

  emit("save", { title, content });
};

const handleCancel = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  emit("cancel");
  emit("update:modelValue", false);
};

const confirmDelete = () => {
  showDeleteConfirm.value = false;
  emit("delete");
};

onBeforeUnmount(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
});
</script>

<style scoped>
.editor-card {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-editor-card {
  min-width: 700px;
  max-width: 900px;
  width: 100%;
  height: 85vh;
}

.side-editor-card {
  height: 100%;
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
}

.editor-wrapper {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-content {
  flex: 1;
  min-height: 0;
}

:deep(.q-editor) {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

:deep(.q-editor__toolbars-container) {
  flex-shrink: 0;
}

:deep(.q-editor__content) {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  overflow-wrap: anywhere;
  word-break: break-word;
}

:deep(.q-editor__content p),
:deep(.q-editor__content div),
:deep(.q-editor__content span) {
  overflow-wrap: anywhere;
  word-break: break-word;
}

:deep(.note-title-input textarea) {
  line-height: 1;
  padding-top: 6px;
  padding-bottom: 6px;
}
</style>
