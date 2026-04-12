<template>
  <div
    class="notes-layout q-pa-md"
    :class="{ 'detail-open': noteEditor.showSideEditor }"
  >
    <div class="notes-panel">
      <div v-if="notesStore.notes.length === 0" class="empty-state">
        <q-icon name="sticky_note_2" size="64px" color="primary" />

        <div class="text-h6 q-mt-md">
          No notes yet
        </div>

        <div class="text-grey q-mt-sm empty-text">
          Create your first note.
        </div>

        <AddNoteButton
          class="q-mt-lg"
          color="primary"
          icon="add"
          label="Create Your First Note"
        />
      </div>

      <div v-else class="notes-scroll">
        <NoteCard
          v-for="note in notesStore.filteredNotes"
          :key="note.id"
          :note="note"
          @select="handleSelect"
          @delete="handleDelete"
        />
      </div>
    </div>

    <div v-if="noteEditor.showSideEditor" class="detail-panel">
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
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import NoteCard from '@/components/notes/NoteCard.vue'
import NoteEditor from '@/components/notes/NoteEditor.vue'
import AddNoteButton from '@/components/notes/AddNoteButton.vue'
import { useNoteActions } from '@/composables/useNoteActions'

const { noteEditor, notesStore, handleSelect, handleSave, handleDelete, setupLifecycle } =
  useNoteActions()

setupLifecycle()

watch(
  () => notesStore.searchQuery,
  () => {
    if (
      notesStore.selectedNote &&
      !notesStore.filteredNotes.some((note) => note.id === notesStore.selectedNote?.id)
    ) {
      notesStore.clearSelectedNote()
      noteEditor.closeSideEditor()
    }
  }
)
</script>

<style scoped>
.notes-layout {
  height: calc(100vh - 82px);
  min-height: 0;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.notes-layout.detail-open {
  grid-template-columns: 1.2fr 0.8fr;
}

.notes-panel {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.notes-scroll {
  height: min(500px, 100%);
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 280px));
  gap: 16px;
  align-content: start;
  justify-content: start;
}

.detail-panel {
  min-width: 0;
  min-height: 0;
  height: min(500px, 100%);
  overflow: hidden;
}

.empty-state {
  height: min(500px, 100%);
  min-height: 0;
  border: 2px dashed #d6d6d6;
  border-radius: 20px;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px;
}

.empty-text {
  max-width: 360px;
  line-height: 1.6;
}

@media (max-width: 767px) {
  .notes-layout {
    overflow-y: auto;
  }

  .notes-layout.detail-open {
    grid-template-columns: 1fr;
  }

  .notes-scroll {
    grid-template-columns: 1fr;
  }

  .detail-panel {
    height: min(500px, 100%);
  }

  .empty-state {
    height: auto;
    min-height: 320px;
  }
}
</style>