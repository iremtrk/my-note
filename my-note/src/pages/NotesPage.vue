<template>
  <div class="row q-col-gutter-md notes-page">
    <div class="col-4 full-height">
      <NotesList
        :notes="notesStore.notes"
        :selected-note-id="notesStore.selectedNote?.id ?? null"
        @select-note="handleSelectNote"
        @delete-note="handleDelete"
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
import { onMounted, onBeforeUnmount, watch } from 'vue'
import NoteEditor from 'src/components/notes/NoteEditor.vue'
import NotesList from 'src/components/notes/NotesList.vue'
import { useAuthStore } from '../stores/auth'
import { useNoteEditorStore } from '../stores/note-editor'
import { useNotesStore } from '../stores/notes'
import type { Note } from '../types/notes'

const noteEditor = useNoteEditorStore()
const notesStore = useNotesStore()
const authStore = useAuthStore()

const handleSelectNote = (note: Note) => {
  notesStore.selectNote(note)

  noteEditor.openEditNoteSide({
    id: note.id,
    title: note.title,
    content: note.content,
  })
}

const handleSave = async (payload: { title: string; content: string }) => {
  if (noteEditor.editingNoteId === null) {
    const userId = authStore.user?.id
    if (!userId) return

    await notesStore.addNote({
      ...payload,
      userId,
    })

    noteEditor.closeSideEditor()
    return
  }

  const editingId = noteEditor.editingNoteId

  await notesStore.updateNote(editingId, payload)

  const updated = notesStore.notes.find((note) => note.id === editingId)

  if (updated) {
    notesStore.selectNote(updated)

    noteEditor.openEditNoteSide({
      id: updated.id,
      title: updated.title,
      content: updated.content,
    })
  } else {
    noteEditor.closeSideEditor()
  }
}

const handleDelete = async (id?: string) => {
  const targetId = id ?? noteEditor.editingNoteId

  if (!targetId) return

  await notesStore.deleteNote(targetId)

  if (notesStore.selectedNote?.id === targetId) {
    notesStore.clearSelectedNote()
  }

  if (noteEditor.editingNoteId === targetId) {
    noteEditor.closeSideEditor()
  }
}

watch(
  () => authStore.isReady,
  async (isReady) => {
    if (isReady && authStore.user?.id) {
      await notesStore.fetchNotes(authStore.user.id)
    }
  },
  { immediate: true }
)

onMounted(async () => {
  noteEditor.closeAll()

  if (authStore.isReady && authStore.user?.id) {
    await notesStore.fetchNotes(authStore.user.id)
  }
})

onBeforeUnmount(() => {
  noteEditor.closeAll()
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
</style>