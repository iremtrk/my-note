<template>
  <q-page class="shared-page q-pa-md">
    <div>
      <div class="row items-center justify-between q-mb-md">
        <div>
          <div class="text-h6">{{t('shared.title')}}</div>
        </div>
      </div>

      <div v-if="!notesStore.hasFetched" class="panel-loading">
        <q-spinner color="primary" size="44px" />
      </div>

      <div v-else-if="notesStore.sharedNotes.length === 0" class="empty-state">
        <q-icon name="folder_shared" size="64px" color="grey-5" />
        <div class="text-h6 q-mt-md">{{t('shared.noNotes')}}</div>
        <div class="text-body2 text-grey-7">
          {{t('shared.noNotesinfo')}}
        </div>
      </div>

      <div v-else class="row q-col-gutter-lg">
        <div class="col-12">
          <div class="row q-col-gutter-md">
            <div
              v-for="note in notesStore.sharedNotes"
              :key="note.id"
              class="col-12 col-sm-6 col-md-4"
            >
              <q-card
                :style="{
                  background: getColor(note.id),
                  color: $q.dark.isActive ? '#f5f5f5' : '#222',
                }"
                class="shared-note-card cursor-pointer"
                @click="openSharedNote(note)"
              >
                <q-card-section>
                  <div class="text-caption q-mt-xs">
                    {{ note.user?.email }} {{t('shared.sharedWithyou')}}
                  </div>
                  <div class="row items-center justify-between no-wrap">
                    <div class="text-h6 ellipsis">
                      {{ note.title }}
                    </div>

                    <q-icon
                      :name="note.permission === 'edit' ? 'edit' : 'visibility'"
                      color="primary"
                      size="xs"
                    />
                  </div>
                  <div class="text-body2 q-mt-md note-preview">
                    {{ note.content }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>

        <div v-if="noteEditor.showSideEditor" class="col-12">
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
    </div>
  </q-page>
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
  height: 100%;
}

.shared-note-card {
  border-radius: 16px;
  height: 100%;
}

.note-preview {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 60px;
}

.empty-state {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
