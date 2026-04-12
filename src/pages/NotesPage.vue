<template>
  <div class="row q-col-gutter-md notes-page">
    <div class="col-4 full-height">
      <NotesList
        :notes="notesStore.filteredNotes"
        :selected-note-id="notesStore.selectedNote?.id ?? null"
        @select-note="handleSelect"
        @delete-note="handleDelete"
        @toggle-star="notesStore.toggleStar"
      />
    </div>

    <div class="col-8 full-height">
      <div v-if="noteEditor.showSideEditor" class="full-height">
        <NoteEditor
          variant="side"
          :initial-title="noteEditor.title"
          :initial-content="noteEditor.content"
          :is-editing="noteEditor.editingNoteId !== null"
          @save="handleSave"
          @cancel="noteEditor.closeSideEditor()"
          @delete="handleDelete"
        />
      </div>

      <q-card v-else bordered class="full-height detail-card">
        <q-card-section class="text-grey">
          Select a note.
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import NoteEditor from '@/components/notes/NoteEditor.vue'
import NotesList from '@/components/notes/NotesList.vue'
import { useNoteActions } from '@/composables/useNoteActions'

const { noteEditor, notesStore, handleSelect, handleSave, handleDelete, setupLifecycle } =
  useNoteActions()

setupLifecycle()

watch(
  () => notesStore.filteredNotes,
  (newFilteredNotes) => {
    if (!notesStore.selectedNote) return

    const stillVisible = newFilteredNotes.some(
      (note) => note.id === notesStore.selectedNote?.id
    )

    if (!stillVisible) {
      notesStore.clearSelectedNote()
      noteEditor.closeSideEditor()
    }
  }
)
</script>

<style scoped>
.notes-page {
  height: calc(100vh - 60px);
}

.detail-card {
  display: flex;
  flex-direction: column;
}
</style>