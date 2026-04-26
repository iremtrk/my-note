<template>
  <q-dialog
    v-if="variant === 'modal'"
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <q-card class="editor-card modal-editor-card">
      <q-card-section class="row items-center justify-between editor-header">
        <div class="text-h6">{{ t("editor.newNote") }}</div>
        <q-btn icon="close" flat round @click="handleCancel" />
      </q-card-section>

      <q-separator />

      <q-card-section class="editor-body">
        <q-input
          v-model="localTitle"
          class="note-title-input"
          :label="t('editor.title')"
          maxlength="80"
          counter
          autogrow
          autofocus
        />

        <div class="editor-wrapper">
          <q-editor
            v-model="localContent"
            :toolbar="editorToolbar"
            class="editor-content"
            min-height="100%"
          />
        </div>

        <div class="pdf-attachment-wrapper">
          <PdfAttachment
            :pdfs="localPdfs"
            @attach="handlePdfAttach"
            @remove="handlePdfRemove"
            @preview="handlePdfPreview"
          />
        </div>
      </q-card-section>

      <q-card-actions align="right" class="editor-actions">
        <q-btn
          v-if="!isEditing"
          color="primary"
          :label="t('editor.add')"
          :disable="!localContent.trim() && !localTitle.trim()"
          @click="handleSave"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-card v-else bordered class="editor-card side-editor-card">
    <q-card-section class="row items-center justify-between editor-header">
      <div class="text-h6">{{ t("editor.editNote") }}</div>

      <div class="row items-center q-gutter-xs">
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
    <q-separator />

    <q-card-section class="editor-body">
      <q-input
        v-model="localTitle"
        class="note-title-input"
        style="font-size: 18px"
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

      <PdfAttachment
        :pdfs="localPdfs"
        @attach="handlePdfAttach"
        @remove="handlePdfRemove"
        @preview="handlePdfPreview"
      />
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

  <ConfirmDelete
    v-model="showDeleteConfirm"
    :title="t('noteList.deleteTitle')"
    :message="t('noteList.deleteMessage')"
    @confirm="confirmDelete"
  />

  <q-dialog v-model="showPdfPreview" maximized>
    <q-card class="pdf-preview-dialog">
      <q-card-section class="row items-center justify-between preview-header">
        <div class="text-h6 ellipsis">
          {{ selectedPreviewPdf?.name }}
        </div>
        <q-btn icon="close" flat round @click="showPdfPreview = false" />
      </q-card-section>

      <q-separator />

      <div class="pdf-dialog-body">
        <PdfViewer
          v-if="selectedPreviewPdf"
          :pdf-data="selectedPreviewPdf.url"
          :file-name="selectedPreviewPdf.name"
          :visible="showPdfPreview"
        />
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from "vue";
import ConfirmDelete from "@/common/ConfirmDelete.vue";
import PdfAttachment from "@/components/notes/PdfAttachment.vue";
import PdfViewer from "@/components/pdf/PdfViewer.vue";
import { useI18n } from "vue-i18n";
import type { NotePdf } from "@/types/notes";

const { t } = useI18n();

const showPdfPreview = ref(false);

const props = withDefaults(
  defineProps<{
    modelValue?: boolean;
    initialTitle: string;
    initialContent: string;
    initialPdfs?: NotePdf[];
    isEditing: boolean;
    variant?: "modal" | "side";
  }>(),
  {
    modelValue: false,
    variant: "modal",
    initialPdfs: () => [],
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (
    e: "save",
    payload: {
      title: string;
      content: string;
      pdfs?: NotePdf[];
    },
  ): void;
  (e: "cancel"): void;
  (e: "delete"): void;
}>();

const localTitle = ref("");
const localContent = ref("");
const localPdfs = ref<NotePdf[]>([]);
const selectedPreviewPdf = ref<NotePdf | null>(null);
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
  () => [
    props.initialTitle,
    props.initialContent,
    props.initialPdfs,
    props.modelValue,
  ],
  () => {
    isHydrating.value = true;
    localTitle.value = props.initialTitle;
    localContent.value = props.initialContent;
    localPdfs.value = props.initialPdfs ?? [];
    selectedPreviewPdf.value = null;
    showPdfPreview.value = false;

    setTimeout(() => {
      isHydrating.value = false;
    }, 0);
  },
  { immediate: true },
);

watch([localTitle, localContent, localPdfs], () => {
  if (!props.isEditing) return;
  if (isHydrating.value) return;

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    const title = localTitle.value.trim();
    const content = localContent.value.trim();

    if (!title && !content && localPdfs.value.length === 0) return;

    emit("save", {
      title,
      content,
      pdfs: localPdfs.value,
    });
  }, 700);
});

const handlePdfAttach = (data: NotePdf[]) => {
  localPdfs.value = data;

  if (!selectedPreviewPdf.value && data.length > 0) {
    selectedPreviewPdf.value = data[0];
  }
};

const handlePdfRemove = (id: string | number) => {
  localPdfs.value = localPdfs.value.filter((pdf) => pdf.id !== id);

  if (selectedPreviewPdf.value?.id === id) {
    selectedPreviewPdf.value = localPdfs.value[0] ?? null;
  }
};

const handleRemoveAllPdfs = () => {
  localPdfs.value = [];
  selectedPreviewPdf.value = null;
};

const handlePdfPreview = (pdf: NotePdf) => {
  selectedPreviewPdf.value = pdf;
  showPdfPreview.value = true;
};

const handleSave = () => {
  const title = localTitle.value.trim();
  const content = localContent.value.trim();

  if (!title && !content && localPdfs.value.length === 0) return;

  emit("save", {
    title,
    content,
    pdfs: localPdfs.value,
  });
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
  min-width: 520px;
  max-width: 760px;
  width: 92vw;
  height: 85vh;
  max-height: 85vh;
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
  height: 100%;
}

.pdf-preview-dialog {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.preview-header {
  flex-shrink: 0;
}

.pdf-dialog-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
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
  padding: 12px;
}

:deep(.q-editor__content p),
:deep(.q-editor__content div),
:deep(.q-editor__content span) {
  overflow-wrap: anywhere;
  word-break: break-word;
}

:deep(.note-title-input textarea) {
  line-height: 1.2;
  padding-top: 8px;
  padding-bottom: 8px;
}

:deep(.note-title-input .q-field__native),
:deep(.note-title-input textarea) {
  overflow-wrap: anywhere;
  word-break: break-word;
}
</style>
