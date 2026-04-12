import { onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useNoteEditorStore } from '@/stores/note-editor'
import { useNotesStore } from '@/stores/notes'
import type { Note } from '../types/notes'

export function useNoteActions() {
  const noteEditor = useNoteEditorStore()
  const notesStore = useNotesStore()
  const authStore = useAuthStore()

  const handleSelect = (note: Note) => {
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

      await notesStore.addNote({ ...payload, userId })
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

  const setupLifecycle = () => {
    onMounted(async () => {
      noteEditor.closeAll()

      if (authStore.user?.id) {
        await notesStore.fetchNotes(authStore.user.id)
      }
    })

    onBeforeUnmount(() => {
      noteEditor.closeAll()
    })
  }

  return {
    noteEditor,
    notesStore,
    authStore,
    handleSelect,
    handleSave,
    handleDelete,
    setupLifecycle,
  }
}