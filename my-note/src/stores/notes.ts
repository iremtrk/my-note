import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import type { Note } from "../types/notes";
import { useAuthStore } from "./auth";

export const useNotesStore = defineStore("notes", () => {
  const notes = ref<Note[]>([]);
  const selectedNote = ref<Note | null>(null);

  const API_URL = "http://localhost:3001/notes";

  const fetchNotes = async () => {
    const authStore = useAuthStore();
    const userId = authStore.user?.id;

    if (!userId) {
      notes.value = [];
      selectedNote.value = null;
      return;
    }

    const response = await axios.get(`${API_URL}?userId=${userId}`);


    notes.value = response.data;

    selectedNote.value = null; //notes.value[0] || null da yapabilirim belki
  };

  const selectNote = (note: Note) => {
    selectedNote.value = note;
  };

  const addNote = async (payload: { title: string; content: string }) => {
    const authStore = useAuthStore();
    const userId = authStore.user?.id;

    if (!userId) {
      throw new Error("User not found");
    }

    const response = await axios.post(API_URL, {
      ...payload,
      userId,
    });

    notes.value.push(response.data);
    selectedNote.value = response.data;
  };

  const updateNote = async (
    id: string,
    payload: { title: string; content: string },
  ) => {
    const authStore = useAuthStore();
    const userId = authStore.user?.id;

    if (!userId) {
      throw new Error("User not found");
    }

    const response = await axios.put(`${API_URL}/${id}`, {
      id,
      userId,
      ...payload,
    });

    const index = notes.value.findIndex((note) => note.id === id);

    if (index !== -1) {
      notes.value[index] = response.data;
    }

    if (selectedNote.value?.id === id) {
      selectedNote.value = response.data;
    }
  };

  const deleteNote = async (id: string) => {
    await axios.delete(`${API_URL}/${id}`);

    notes.value = notes.value.filter((note) => note.id !== id);

    if (selectedNote.value?.id === id) {
      selectedNote.value = notes.value[0] || null;
    }
  };

  const clearNotes = () => {
    notes.value = [];
    selectedNote.value = null;
  };

  return {
    notes,
    selectedNote,
    fetchNotes,
    selectNote,
    addNote,
    updateNote,
    deleteNote,
    clearNotes,
  };
});