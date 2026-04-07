<script setup lang="ts">
import { onMounted } from 'vue'
import NotesList from 'src/components/notes/NotesList.vue'
import { useNoteEditorStore } from '../stores/note-editor'
import { useNotesStore } from '../stores/notes'
import type { Note } from '../types/notes'

const noteEditor = useNoteEditorStore()
const notesStore = useNotesStore()

const startEdit = (note: Note) => {
  noteEditor.openEditNote({
    id: note.id,
    title: note.title,
    content: note.content,
  })
}

onMounted(() => {
  notesStore.fetchNotes()
})
</script>

<template>
  <div class="row q-col-gutter-md notes-page">
    <div class="col-4">
      <NotesList
        :notes="notesStore.notes"
        :selected-note-id="notesStore.selectedNote?.id ?? null"
        @select-note="notesStore.selectNote"
      />
    </div>

    <div class="col-8">
      <q-card bordered class="full-height">
        <q-card-section v-if="notesStore.selectedNote">
          <div class="row items-start justify-between no-wrap">
            <div class="detail-content">
              <div class="text-h5">{{ notesStore.selectedNote.title }}</div>
              <div
                class="text-body1 q-mt-md note-detail-html"
                v-html="notesStore.selectedNote.content"
              ></div>
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
        </q-card-section>

        <q-card-section v-else class="text-grey">
          Select a note.
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>