<template>
  <div>
    <q-card bordered class="full-height">
      <q-card-section class="row items-center justify-between">
        <div class="text-h6">My Notes</div>
        <AddNoteButton icon="add" round flat color="primary" />
      </q-card-section>

      <q-separator />

      <q-card-section v-if="notes.length === 0" class="text-grey">
        No notes yet.
      </q-card-section>

      <q-list v-else separator>
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
        </q-item>
      </q-list>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import AddNoteButton from 'src/components/notes/AddNoteButton.vue'
import type { Note } from '../../types/notes'

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
</script>

<style scoped>
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