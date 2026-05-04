<template>
  <div class="shared-page q-pa-md">
    <div class="shared-sections">
      <section class="section-card notes-section">
        <div class="section-header row items-center justify-between">
          <div class="text-h6">{{t('shared.title')}}</div>
        </div>

        <div v-if="!notesStore.hasFetched" class="panel-loading">
          <q-spinner color="primary" size="44px" />
        </div>

        <div v-else-if="notesStore.sharedNotes.length === 0" class="panel-empty">
          <q-icon name="folder_shared" size="64px" color="grey-5" />
          <div class="text-h6 q-mt-md">{{t('shared.noNotes')}}</div>
          <div class="text-body2 text-grey-7 empty-text">
            {{t('shared.noNotesinfo')}}
          </div>
        </div>

        <div v-else class="section-content notes-content">
          <div class="notes-scroll">
            <q-card
              v-for="note in notesStore.sharedNotes"
              :key="note.id"
              :style="{
                background: getColor(note.id),
                color: $q.dark.isActive ? '#f5f5f5' : '#222',
              }"
              class="my-card"
              clickable
              @click="openSharedNote(note)"
            >
              <q-card-section class="row items-start justify-between no-wrap">
                <div class="text-h6 note-title">
                  {{ note.title }}
                </div>
                <div class="row items-center">
                  <q-icon
                    :name="note.permission === 'edit' ? 'edit' : 'visibility'"
                    color="primary"
                    size="sm"
                  />
                </div>
              </q-card-section>
              
              <q-card-section class="card-preview" style="padding-top: 0">
                <div class="text-caption text-grey q-mb-xs" style="line-height: 1;">
                  {{ note.user?.email }} {{t('shared.sharedWithyou')}}
                </div>
                <div class="note-content">{{ stripHtml(note.content) }}</div>
              </q-card-section>

              <q-card-section class="card-footer">
                <span class="note-date" style="font-size: 11px">{{ formatNoteDate(note.createdAt) }}</span>
              </q-card-section>
            </q-card>
          </div>

          <div v-if="noteEditor.showSideEditor" class="detail-panel">
            <NoteEditor
              variant="side"
              :initial-title="noteEditor.title"
              :initial-content="noteEditor.content"
              :initial-pdfs="noteEditor.pdfs"
              :is-editing="noteEditor.editingNoteId !== null"
              :readonly="notesStore.selectedNote?.permission === 'read'"
              :is-owner="notesStore.selectedNote?.userId === authStore.user?.id"
              @save="handleSave"
              @cancel="noteEditor.closeSideEditor()"
            />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from "quasar";
import { onMounted } from "vue";
import { useNotesStore } from "@/stores/notes";
import { useNoteEditorStore } from "@/stores/note-editor";
import type { Note } from "@/types/notes";
import NoteEditor from "@/components/notes/NoteEditor.vue";
import { useAuthStore } from "@/stores/auth";
import { useI18n } from "vue-i18n";
import { stripHtml } from "@/utils/html";
import { formatNoteDate } from "@/utils/date";

const { t } = useI18n();

const authStore = useAuthStore();

const $q = useQuasar();

const notesStore = useNotesStore();
const noteEditor = useNoteEditorStore();

onMounted(async () => {
  if (!notesStore.hasFetched) {
    await notesStore.fetchNotes();
  }
});

const openSharedNote = (note: Note) => {
  notesStore.selectNote(note);
  noteEditor.openEditNoteSide(note);
};

const handleSave = async (payload: {
  title: string;
  content: string;
  pdfs?: Note["pdfs"];
}) => {
  const noteId = noteEditor.editingNoteId;
  if (!noteId) return;

  await notesStore.updateNote(noteId, {
    title: payload.title,
    content: payload.content,
    pdfs: payload.pdfs ?? [],
  });
};

const lightColors = ["#fef3c7", "#dbeafe", "#dcfce7", "#fce7f3", "#ede9fe"];
const darkColors = ["#3a2f12", "#1e3a5f", "#1f4d3a", "#4a2238", "#352a56"];

const getColor = (id: string | number) => {
  const palette = $q.dark.isActive ? darkColors : lightColors;
  return palette[Number(id) % palette.length];
};
</script>

<style scoped>
.shared-page {
  min-height: calc(100vh - 82px);
  overflow-y: auto;
  overflow-x: hidden;
}

.shared-sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 0;
}

.section-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 18px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.notes-section {
  min-height: 420px;
}

.section-header {
  flex-shrink: 0;
  margin-bottom: 12px;
}

.section-content {
  flex: 1;
  min-height: 0;
  display: grid;
  gap: 16px;
  align-items: stretch;
}

.notes-content {
  grid-template-columns: 1fr;
}

.notes-content:has(.detail-panel) {
  grid-template-columns: minmax(320px, 1fr) minmax(460px, 1fr);
}

.notes-scroll {
  min-height: 320px;
  max-height: 600px;
  overflow-y: auto;
  overflow-x: hidden;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  align-content: start;
  padding-right: 4px;
}

.detail-panel {
  min-height: 520px;
  max-height: 600px;
  overflow: hidden;
}

.panel-loading,
.panel-empty {
  flex: 1;
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex-direction: column;
}

.empty-text {
  max-width: 360px;
  line-height: 1.6;
}

/* Note Card Styling */
.my-card {
  width: 100%;
  cursor: pointer;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
}

.card-preview {
  height: 80px;
  padding-bottom: 4px;
}

.note-title {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.note-content {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.card-footer {
  padding-top: 4px;
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
}

.note-date {
  font-size: 11px;
  color: grey;
}

@media (max-width: 1100px) {
  .notes-content:has(.detail-panel) {
    grid-template-columns: 1fr;
  }

  .detail-panel {
    min-height: 560px;
    max-height: 560px;
  }

  .notes-scroll {
    max-height: 360px;
  }
}

@media (max-width: 900px) {
  .shared-page {
    min-height: auto;
  }

  .section-card {
    min-height: auto;
  }

  .notes-section {
    min-height: 380px;
  }

  .detail-panel {
    min-height: 500px;
    max-height: 500px;
  }
}
</style>
