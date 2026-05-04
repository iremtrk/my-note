<template>
  <q-card bordered class="full-height notes-card">
    <q-card-section class="notes-header">
      <div class="search-area">
        <q-input
          v-model="notesStore.searchQuery"
          outlined
          dense
          :placeholder="t('noteList.search')"
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
                {{ t("noteList.sort") }}
              </q-item-label>

              <q-item
                v-for="opt in sortOptions"
                :key="opt.value"
                clickable
                v-close-popup
                :active="notesStore.sortOrder === opt.value"
                active-class="text-primary"
                @click="notesStore.sortOrder = opt.value"
              >
                <q-item-section avatar>
                  <q-icon :name="opt.icon" size="18px" />
                </q-item-section>

                <q-item-section>{{ opt.label }}</q-item-section>

                <q-item-section side v-if="notesStore.sortOrder === opt.value">
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
          @click="noteEditor.openNewNoteModal()"
        />
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section v-if="!hasFetched">
      <q-spinner color="primary" size="50px" />
    </q-card-section>

    <q-card-section v-else-if="notes.length === 0" class="text-grey">
      {{ t("noteList.empty") }}
    </q-card-section>

    <q-card-section v-else class="list-section">
      <q-list separator class="note-scroll">
        <q-item
          v-for="note in notes"
          :key="note.id"
          clickable
          :active="selectedNoteId === note.id"
          active-class="bg-grey-4"
          class="note-item"
          @click="handleNoteClick(note)"
        >
          <q-item-section>
            <div class="note-title-row row items-start no-wrap">
              <q-item-label class="text-weight-medium note-title">
                {{ note.title }}
              </q-item-label>

              <div class="note-actions row items-center">
                <q-btn
                  :icon="note.starred ? 'star' : 'star_border'"
                  :color="note.starred ? 'primary' : 'grey-5'"
                  flat
                  round
                  dense
                  size="sm"
                  @click.stop="$emit('toggle-star', note.id)"
                />

                <q-btn
                  icon="close"
                  flat
                  round
                  dense
                  size="sm"
                  @click.stop="openDeleteConfirm(note.id)"
                />
              </div>
            </div>

            <q-item-label caption class="note-preview q-mt-xs">
              <template v-if="note.isLocked">
                <q-icon name="lock" size="14px" class="q-mr-xs" color="primary" />
                <span class="text-italic text-grey-6">Locked Note</span>
              </template>
              <template v-else>
                {{ stripHtml(note.content) }}
              </template>
            </q-item-label>

            <q-item-label caption class="note-date q-mt-xs">
              {{ formatNoteDate(note.createdAt) }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <ConfirmDelete
        v-model="showDeleteConfirm"
        :title="t('noteList.deleteTitle')"
        :message="t('noteList.deleteMessage')"
        @confirm="confirmDelete"
      />

      <PinModal
        v-model="showPinModal"
        mode="verify"
        :noteId="verifyingNoteId"
        @success="onPinSuccess"
      />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import ConfirmDelete from "@/common/ConfirmDelete.vue";
import PinModal from "@/components/notes/PinModal.vue";
import type { Note } from "@/types/notes";
import { stripHtml } from "@/utils/html";
import { formatNoteDate } from "@/utils/date";
import { useNoteEditorStore } from "@/stores/note-editor";
import { useNotesStore } from "@/stores/notes";
import type { SortOrder } from "@/stores/notes";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineProps<{
  notes: Note[];
  selectedNoteId: string | number | null;
  hasFetched: boolean;
}>();

const emit = defineEmits<{
  (e: "select-note", note: Note): void;
  (e: "delete-note", id: number): void;
  (e: "toggle-star", id: number): void;
}>();

const noteEditor = useNoteEditorStore();
const notesStore = useNotesStore();

const showDeleteConfirm = ref(false);
const deletingNoteId = ref<number | null>(null);

const showPinModal = ref(false);
const verifyingNoteId = ref<number | null>(null);

const handleNoteClick = (note: Note) => {
  if (note.isLocked) {
    verifyingNoteId.value = note.id;
    showPinModal.value = true;
  } else {
    emit("select-note", note);
  }
};

const onPinSuccess = () => {
  if (verifyingNoteId.value) {
    const verifiedNote = notesStore.notes.find((n) => n.id === verifyingNoteId.value);
    if (verifiedNote) {
      emit("select-note", verifiedNote);
    }
  }
};

const openDeleteConfirm = (id: number) => {
  deletingNoteId.value = id;
  showDeleteConfirm.value = true;
};

const confirmDelete = () => {
  if (!deletingNoteId.value) return;

  emit("delete-note", deletingNoteId.value);

  showDeleteConfirm.value = false;
  deletingNoteId.value = null;
};

const sortOptions = computed<
  { label: string; value: SortOrder; icon: string }[]
>(() => [
  { label: t("noteList.sortNewest"), value: "newest", icon: "arrow_downward" },
  { label: t("noteList.sortOldest"), value: "oldest", icon: "arrow_upward" },
  { label: t("noteList.sortUpdated"), value: "updated", icon: "update" },
]);
</script>

<style scoped>
.notes-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.notes-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.search-area {
  flex: 1;
  min-width: 0;
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
}

.note-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.note-item {
  min-width: 0;
  overflow: hidden;
}

.note-item :deep(.q-item__section--main) {
  min-width: 0;
  overflow: hidden;
}

.note-title-row {
  width: 100%;
  min-width: 0;
}

.note-title {
  flex: 1 1 auto;
  min-width: 0;
  max-width: 100%;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.note-actions {
  flex-shrink: 0;
}

.note-preview {
  max-width: 100%;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.note-date {
  font-size: 11px;
  color: #9ca3af;
  text-align: right;
}
</style>