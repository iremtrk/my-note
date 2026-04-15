import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {Note} from '@/types/notes'

export const useNoteEditorStore = defineStore('noteEditor', () => {
  const showModal = ref(false)
  const showSideEditor = ref(false)

  const editingNoteId = ref<number | null>(null)
  const title = ref('')
  const content = ref('')

  const openNewNoteModal = () => {
    showSideEditor.value = false
    showModal.value = true
    editingNoteId.value = null
    title.value = ''
    content.value = ''
  }

  const openEditNoteModal = (note:Note) => {
    showSideEditor.value = false
    showModal.value = true

    editingNoteId.value = note.id
    title.value = note.title
    content.value = note.content
  }

  const openEditNoteSide = (note:Note) => {
    showModal.value = false
    showSideEditor.value = true
    editingNoteId.value = note.id
    title.value = note.title
    content.value = note.content
  }

  const closeModal = () => {
    showModal.value = false
    editingNoteId.value = null
    title.value = ''
    content.value = ''
  }

  const closeSideEditor = () => {
    showSideEditor.value = false
    editingNoteId.value = null
    title.value = ''
    content.value = ''
  }

  const closeAll = () => {
    showModal.value = false
    showSideEditor.value = false

    editingNoteId.value = null
    title.value = ''
    content.value = ''
  }

  return {
    showModal,
    showSideEditor,
    editingNoteId,
    title,
    content,
    openNewNoteModal,
    openEditNoteModal,
    openEditNoteSide,
    closeModal,
    closeSideEditor,
    closeAll,
  }
})