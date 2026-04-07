import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNoteEditorStore = defineStore('noteEditor', () => {
  const showForm = ref(false)
  const editingNoteId = ref<string | null>(null)
  const title = ref('')
  const content = ref('')

  const openNewNote = () => {
    editingNoteId.value = null
    title.value = ''
    content.value = ''
    showForm.value = true
  }

  const openEditNote = (payload: {
    id: string
    title: string
    content: string
  }) => {
    editingNoteId.value = payload.id
    title.value = payload.title
    content.value = payload.content
    showForm.value = true
  }

  const closeEditor = () => {
    showForm.value = false
    editingNoteId.value = null
    title.value = ''
    content.value = ''
  }

  return {
    showForm,
    editingNoteId,
    title,
    content,
    openNewNote,
    openEditNote,
    closeEditor,
  }
})