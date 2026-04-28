import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/lib/axios"
import type { Note, NotePdf } from "@/types/notes";
import { stripHtml } from "@/utils/html";
import { useLoadingStore } from "./loading";

export type SortOrder = "newest" | "oldest" | "updated";

export const useNotesStore = defineStore("notes", () => {
  const notes = ref<Note[]>([]);
  const selectedNote = ref<Note | null>(null);
  const searchQuery = ref("");
  const sortOrder = ref<SortOrder>("newest");
  const hasFetched = ref(false);

  const loading = useLoadingStore();
  const API_URL = "/notes";

  const fetchNotes = async () => {
    await loading.wrap("notes", async () => {
      const response = await api.get(API_URL);
      notes.value = response.data;
    });

    if (selectedNote.value) {
      const updatedSelectedNote = notes.value.find(
        (note) => note.id === selectedNote.value?.id,
      );
      selectedNote.value = updatedSelectedNote || null;
    }

    hasFetched.value = true;
  };

  const selectNote = (note: Note) => {
    selectedNote.value = note;
  };

  const addNote = async (payload: Omit<Note, "id">) => {
    await loading.wrap("notes:add", async () => {
      const response = await api.post(API_URL, {
      title: payload.title,
      content: payload.content,
      userId: Number(payload.userId),
      starred: payload.starred ?? false,
      pdfs:payload.pdfs ?? [],
    });
      notes.value.push(response.data);
      selectedNote.value = response.data;
    });
  };

  const updateNote = async (
    id: number,
    payload: { title: string; content: string; pdfs?: NotePdf[] },
  ) => {
    const currentNote = notes.value.find((note) => note.id === id);
    if (!currentNote) return;

    const response = await api.patch(`${API_URL}/${id}`, {
      ...payload,
      userId: currentNote.userId,
      createdAt: currentNote.createdAt,
      starred: currentNote.starred,
      updatedAt: new Date().toISOString(),
    });

    const index = notes.value.findIndex((note) => note.id === id);
    if (index !== -1) notes.value[index] = response.data;

    if (selectedNote.value?.id === id) {
      selectedNote.value = response.data;
    }
  };

  const deleteNote = async (id: number) => {
    await api.delete(`${API_URL}/${id}`);
    notes.value = notes.value.filter((note) => note.id !== id);

    if (selectedNote.value?.id === id) {
      selectedNote.value = null;
    }
  };

  const toggleStar = async (id: number) => {
    const note = notes.value.find((n) => n.id === id);
    if (!note) return;

    const response = await api.patch(`${API_URL}/${id}`, {
      starred: !note.starred,
    });

    const index = notes.value.findIndex((n) => n.id === id);
    if (index !== -1) notes.value[index] = response.data;

    if (selectedNote.value?.id === id) {
      selectedNote.value = response.data;
    }
  };

  const clearNotes = () => {
    notes.value = [];
    selectedNote.value = null;
  };

  const clearSelectedNote = () => {
    selectedNote.value = null;
  };

  const sortedNotes = computed(() => {
    return [...notes.value].sort((a, b) => {
      if (a.starred && !b.starred) return -1;
      if (!a.starred && b.starred) return 1;

      if (sortOrder.value === "updated") {
        const dateA = new Date(a.updatedAt || a.createdAt).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt).getTime();
        return dateB - dateA;
      }

      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder.value === "newest" ? dateB - dateA : dateA - dateB;
    });
  });

  const filteredNotes = computed(() => {
    const query = searchQuery.value.trim().toLowerCase();

    if (!query) return sortedNotes.value;

    return sortedNotes.value.filter((note) => {
      const title = note.title.toLowerCase();
      const content = stripHtml(note.content).toLowerCase();
      const pdfNames = (note.pdfs ?? []).map((pdf) => pdf.name.toLowerCase());

      return (
        title.includes(query) ||
        content.includes(query) ||
        pdfNames.some((name) => name.includes(query))
      );
    });
  });

  return {
    notes,
    selectedNote,
    searchQuery,
    sortOrder,
    filteredNotes,
    hasFetched,
    fetchNotes,
    selectNote,
    addNote,
    updateNote,
    deleteNote,
    toggleStar,
    clearNotes,
    clearSelectedNote,
  };
});