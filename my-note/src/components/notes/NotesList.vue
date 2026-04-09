<template>
  <q-card bordered class="full-height notes-card">
    <q-card-section class="row items-center justify-between">
      <div class="text-h6">My Notes</div>
      <AddNoteButton icon="add" round flat color="primary" />
    </q-card-section>

    <q-separator />

    <q-card-section v-if="notes.length === 0" class="text-grey">
      No notes yet.
    </q-card-section>

    <q-card-section v-else class="list-section">
      <q-list separator class="note-scroll">
        <q-item
          v-for="note in notes"
          :key="note.id"
          clickable
          :active="selectedNoteId === note.id"
          active-class="bg-grey-3 text-primary"
          @click="$emit('select-note', note)"
        >
          <q-item-section>
            <q-item-label class="text-weight-medium note-title">
              {{ note.title }}
            </q-item-label>
            <q-item-label caption class="note-preview">
              {{ getPreviewText(note.content) }}
            </q-item-label>
          </q-item-section>
          <q-btn class="deletebtn q-mx-xs q-mt-xs"
                icon="close"
                flat
                size="10px"
                color="negative"
                @click="handleDelete"
                
              />
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import AddNoteButton from 'src/components/notes/AddNoteButton.vue'
import type { Note } from '../../types/notes'
import { useNotesStore } from '../../stores/notes'

defineProps<{
  notes: Note[]
  selectedNoteId: string | null
}>()

defineEmits<{
  (e: 'select-note', note: Note): void
}>()

const getPreviewText = (html: string) => {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}
const notesStore = useNotesStore()

const handleDelete = async () => {
  if (!notesStore.selectedNote) return
  await notesStore.deleteNote(notesStore.selectedNote.id)
}
</script>

<style scoped>
.notes-card {
  display: flex;
  flex-direction: column;
  height: 100%;
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

.note-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.note-preview {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  word-break: break-word;
}


</style>