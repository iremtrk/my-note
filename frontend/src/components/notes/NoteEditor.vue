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
          v-if="isEditing && props.isOwner"
          :icon="currentNote?.isLocked ? 'lock' : 'lock_open'"
          flat
          round
          
          @click="openPinModal(currentNote?.isLocked ? 'remove-lock' : 'lock')"
        >
        </q-btn>
        <q-btn
          v-if="isEditing && props.isOwner"
          icon="share"
          flat
          round
          @click="showShareModal = true"
        >
        </q-btn>
        <q-btn
          v-if="isEditing && props.isOwner"
          icon="delete"
          flat
          round
          color="negative"
          @click="showDeleteConfirm = true"
        />
        <q-btn icon="close" flat round @click="handleCancel" />
      </div>
    </q-card-section>
    <div
      v-if="sharedWithText"
      class="text-caption text-grey-6 q-px-md"
      style="margin-top: -8px; margin-bottom: 8px"
    >
      <q-icon name="group" size="14px" class="q-mr-xs" />
      {{ sharedWithText }}
    </div>
    <q-separator />

    <q-card-section class="editor-body">
      <q-input
        v-model="localTitle"
        class="note-title-input"
        style="font-size: 18px"
        maxlength="80"
        counter
        autogrow
        :readonly="props.readonly"
      />

      <div class="editor-wrapper">
        <q-editor
          v-model="localContent"
          :toolbar="editorToolbar"
          class="editor-content"
          :readonly="props.readonly"
        />
      </div>

      <PdfAttachment
        :pdfs="localPdfs"
        :readonly="props.readonly"
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

  <ShareModal v-model="showShareModal" @share="handleShareNote" />
  <PinModal
    v-model="showPinModal"
    :mode="pinModalMode"
    :noteId="props.noteId ?? null"
  />

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
import { ref, watch, computed, onBeforeUnmount } from "vue";
import ConfirmDelete from "@/common/ConfirmDelete.vue";
import PdfAttachment from "@/components/notes/PdfAttachment.vue";
import PdfViewer from "@/components/pdf/PdfViewer.vue";
import { useI18n } from "vue-i18n";
import type { NotePdf } from "@/types/notes";
import ShareModal from "@/components/notes/ShareModal.vue";
import PinModal from "@/components/notes/PinModal.vue";
import { useNotesStore } from "@/stores/notes";
import { useQuasar } from "quasar";

const $q = useQuasar();

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
    readonly?: boolean;
    isOwner?: boolean;
    noteId?: number;
  }>(),
  {
    modelValue: false,
    variant: "modal",
    initialPdfs: () => [],
    readonly: false,
    isOwner: false,
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

const notesStore = useNotesStore();
const showShareModal = ref(false);
const showPinModal = ref(false);
const pinModalMode = ref<"lock" | "remove-lock" | "verify">("lock");

const openPinModal = (mode: "lock" | "remove-lock" | "verify") => {
  pinModalMode.value = mode;
  showPinModal.value = true;
};

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const currentNote = computed(() => {
  if (!props.noteId) return null;
  return notesStore.notes.find((n) => n.id === props.noteId) || null;
});

const sharedWithText = computed(() => {
  if (!props.isOwner) return "";

  const shares = currentNote.value?.shares || [];
  const emails = shares.map((s) => s.user?.email).filter(Boolean);

  if (emails.length === 0) return "";

  return emails.length === 1
    ? t("editor.sharedWithOne", { email: emails[0] })
    : t("editor.sharedWithMany", { emails: emails.join(", ") });
});

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

const handleShareNote = async (payload: {
  email: string;
  permission: "read" | "edit";
}) => {
  if (!props.noteId) return;

  try {
    const res = await notesStore.shareNote(props.noteId, payload);

    $q.notify({
      type: "positive",
      message: res.message || "Note shared successfully",
      position: "bottom-right",
      timeout:1000,
    });

    showShareModal.value = false;
  } catch (err: any) {
    $q.notify({
      type: "negative",
      message: err.message || "Share failed",
      position: "bottom-right",
      timeout:1500,
    });
  }
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
