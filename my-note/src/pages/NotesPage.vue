<template>
  <div class="row q-col-gutter-md notes-page">
    <div class="col-4 full-height">
      <NotesList
        :notes="notesStore.notes"
        :selected-note-id="notesStore.selectedNote?.id ?? null"
        @select-note="notesStore.selectNote"
      />
    </div>

    <div class="col-8 full-height">
      <q-card bordered class="full-height detail-card">
        <q-card-section v-if="notesStore.selectedNote" class="detail-section">
          <div class="row items-start justify-between no-wrap detail-header">
            <div class="detail-content">
              <div class="text-h5">{{ notesStore.selectedNote.title }}</div>
            </div>

            <div class="row q-gutter-sm">
              <q-btn
                icon="edit"
                flat
                round
                color="black"
                @click="startEdit(notesStore.selectedNote)"
              />
              <q-btn
                icon="delete"
                flat
                round
                color="negative"
                @click="notesStore.deleteNote(notesStore.selectedNote.id)"
              />
            </div>
          </div>

          <div
            class="text-body1 q-mt-md note-detail-html detail-scroll"
            v-html="notesStore.selectedNote.content"
          ></div>
        </q-card-section>

        <q-card-section v-else class="text-grey">
          Select a note.
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import NotesList from 'src/components/notes/NotesList.vue'
import { useNoteEditorStore } from '../stores/note-editor'
import { useNotesStore } from '../stores/notes'
import type { Note } from '../types/notes'
import { useAuthStore } from "../stores/auth";

const noteEditor = useNoteEditorStore()
const notesStore = useNotesStore()
const authStore = useAuthStore()

const startEdit = (note: Note) => {
  noteEditor.openEditNote({
    id: note.id,
    title: note.title,
    content: note.content,
  })
}

watch(
  () => authStore.isReady,
  async (isReady) => {
    if (isReady && authStore.user) {
      await notesStore.fetchNotes()
    }
  },
  { immediate: true }
)

onMounted(async () => {
  if (authStore.isReady && authStore.user) {
    await notesStore.fetchNotes()
  }
})
</script>

<style scoped>
.notes-page {
  height: calc(100vh - 60px);
}

.detail-card {
  display: flex;
  flex-direction: column;
}

.detail-section {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.detail-header {
  flex-shrink: 0;
  word-break: break-word;
}

.detail-content {
  flex: 1;
  min-width: 0;
}

.detail-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.note-detail-html {
  overflow-wrap: anywhere;
  word-break: break-word;
}
</style>
