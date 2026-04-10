<template>
  <div
    class="notes-layout q-pa-md"
    :class="{ 'detail-open': noteEditor.showSideEditor }"
  >
    <div class="notes-panel">
      <div v-if="showEmptyState" class="empty-state">
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
          v-for="note in displayedNotes"
          :key="note.id"
          :note="note"
          :is-demo="note.id === DEMO_NOTE.id"
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
import { computed, onMounted, onBeforeUnmount, watch } from 'vue'
import NoteCard from 'src/components/notes/NoteCard.vue'
import NoteEditor from 'src/components/notes/NoteEditor.vue'
import { useAuthStore } from '../stores/auth'
import { useNoteEditorStore } from '../stores/note-editor'
import { useNotesStore } from '../stores/notes'
import type { Note } from '../types/notes'
import AddNoteButton from '../components/notes/AddNoteButton.vue'

const notesStore = useNotesStore()
const noteEditor = useNoteEditorStore()
const authStore = useAuthStore()

const DEMO_NOTE: Note = {
  id: 'demo-note',
  userId: 'demo-user',
  title: 'Welcome to My Note',
  content: `
    <p><strong>Hello and welcome 👋</strong></p>
    <p>This is a sample note to help you get started.</p>
    <ul>
      <li>Write down your ideas</li>
      <li>Keep track of your tasks</li>
      <li>Edit your notes anytime</li>
    </ul>
    <p>Create your first real note to begin.</p>
  `,
}

const hasSearchQuery = computed(() => notesStore.searchQuery.trim().length > 0)

const showEmptyState = computed(() => {
  return notesStore.notes.length === 0 && !hasSearchQuery.value
})

const displayedNotes = computed(() => {
  if (notesStore.filteredNotes.length > 0) {
    return notesStore.filteredNotes
  }

  if (showEmptyState.value) {
    return [DEMO_NOTE]
  }

  return []
})

onMounted(async () => {
  noteEditor.closeAll()

  if (authStore.user?.id) {
    await notesStore.fetchNotes(authStore.user.id)
  }
})

onBeforeUnmount(() => {
  noteEditor.closeAll()
})

watch(
  () => notesStore.searchQuery,
  () => {
    if (
      notesStore.selectedNote &&
      !notesStore.filteredNotes.some(
        (note) => note.id === notesStore.selectedNote?.id
      )
    ) {
      notesStore.clearSelectedNote()
      noteEditor.closeSideEditor()
    }
  }
)


const handleSelect = (note: Note) => {
  if (note.id === DEMO_NOTE.id) {
    return
  }

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

  if (!targetId || targetId === DEMO_NOTE.id) return

  await notesStore.deleteNote(targetId)

  if (notesStore.selectedNote?.id === targetId) {
    notesStore.clearSelectedNote()
  }

  if (noteEditor.editingNoteId === targetId) {
    noteEditor.closeSideEditor()
  }
}
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