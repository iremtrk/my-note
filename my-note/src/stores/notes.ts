import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import type { Note } from '../types/notes'

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>([])
  const selectedNote = ref<Note | null>(null)

  const API_URL = 'http://localhost:3001/notes'

  const fetchNotes = async (userId?: string) => {
    const response = userId
      ? await axios.get(`${API_URL}?userId=${userId}`)
      : await axios.get(API_URL)

    notes.value = response.data

    if (selectedNote.value) {
      const updatedSelectedNote = notes.value.find(
        (note) => note.id === selectedNote.value?.id
      )

      selectedNote.value = updatedSelectedNote || null
    }
  }

  const selectNote = (note: Note) => {
    selectedNote.value = note
  }

  const addNote = async (payload: Omit<Note, 'id'>) => {
    const response = await axios.post(API_URL, payload)
    notes.value.push(response.data)
    selectedNote.value = response.data
  }

  const updateNote = async (
    id: string,
    payload: { title: string; content: string }
  ) => {
    const currentNote = notes.value.find((note) => note.id === id)

    if (!currentNote) return

    const response = await axios.patch(`${API_URL}/${id}`, {
      ...payload,
      userId: currentNote.userId,
    })

    const index = notes.value.findIndex((note) => note.id === id)

    if (index !== -1) {
      notes.value[index] = response.data
    }

    if (selectedNote.value?.id === id) {
      selectedNote.value = response.data
    }
  }

  const deleteNote = async (id: string) => {
    await axios.delete(`${API_URL}/${id}`)

    notes.value = notes.value.filter((note) => note.id !== id)

    if (selectedNote.value?.id === id) {
      selectedNote.value = null
    }
  }

  const clearNotes = () => {
    notes.value = []
    selectedNote.value = null
  }

  const clearSelectedNote = () => {
    selectedNote.value = null
  }

  return {
    notes,
    selectedNote,
    fetchNotes,
    selectNote,
    addNote,
    updateNote,
    deleteNote,
    clearNotes,
    clearSelectedNote,
  }
})