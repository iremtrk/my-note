import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/lib/axios";
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

  const ownedNotes = computed(() => notes.value.filter((note) => note.isOwner));

  const sharedNotes = computed(() =>
    notes.value.filter((note) => !note.isOwner),
  );

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

  const addNote = async (payload: Pick<Note, "title" | "content" | "starred" | "pdfs">) => {
    await loading.wrap("notes:add", async () => {
      const response = await api.post(API_URL, {
        title: payload.title,
        content: payload.content,
        starred: payload.starred ?? false,
        pdfs: payload.pdfs ?? [],
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
      starred: currentNote.starred,
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

  const shareNote = async (noteId: number, payload: any) => {
    try {
      const response = await api.post(`${API_URL}/${noteId}/share`, payload);

      const index = notes.value.findIndex((n) => n.id === noteId);
      if (index !== -1) {
        const shareData = response.data;
        if (!notes.value[index].shares) {
          notes.value[index].shares = [];
        }
        const existingShareIndex = notes.value[index].shares.findIndex((s: any) => s.userId === shareData.userId);
        if (existingShareIndex !== -1) {
          notes.value[index].shares[existingShareIndex] = shareData;
        } else {
          notes.value[index].shares.push(shareData);
        }
      }

      return { message: "Note shared successfully", data: response.data };
    } catch (error: any) {
      throw error.response?.data || { message: "Something went wrong" };
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

  const lockNote = async (id: number, pin: string) => {
    try {
      const response = await api.post(`${API_URL}/${id}/lock`, { pin });
      const index = notes.value.findIndex((n) => n.id === id);
      if (index !== -1) {
        notes.value[index].isLocked = true;
        notes.value[index].content = "";
        notes.value[index].pdfs = [];
      }
      if (selectedNote.value?.id === id) {
        selectedNote.value.isLocked = true;
        selectedNote.value.content = "";
        selectedNote.value.pdfs = [];
      }
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: "Could not lock the note" };
    }
  };

  const removeLock = async (id: number, pin: string) => {
    try {
      const response = await api.post(`${API_URL}/${id}/remove-lock`, { pin });
      const index = notes.value.findIndex((n) => n.id === id);
      if (index !== -1) {
        notes.value[index].isLocked = false;
      }
      if (selectedNote.value?.id === id) {
        selectedNote.value.isLocked = false;
      }
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: "Could not remove lock" };
    }
  };

  const verifyPin = async (id: number, pin: string) => {
    try {
      const response = await api.post(`${API_URL}/${id}/verify-pin`, { pin });
      const index = notes.value.findIndex((n) => n.id === id);
      if (index !== -1) {
        notes.value[index].content = response.data.content;
        notes.value[index].pdfs = response.data.pdfs;
      }
      if (selectedNote.value?.id === id) {
        selectedNote.value.content = response.data.content;
        selectedNote.value.pdfs = response.data.pdfs;
      }
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: "Incorrect PIN" };
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

  const sortedOwnedNotes = computed(() =>
    sortedNotes.value.filter((note) => note.isOwner),
  );

  const filteredOwnedNotes = computed(() =>
    filteredNotes.value.filter((note) => note.isOwner),
  );

  const filteredSharedNotes = computed(() =>
    filteredNotes.value.filter((note) => !note.isOwner),
  );

  return {
    notes,
    selectedNote,
    searchQuery,
    sortOrder,
    filteredNotes,
    sortedOwnedNotes,
    filteredOwnedNotes,
    filteredSharedNotes,
    hasFetched,
    ownedNotes,
    sharedNotes,
    fetchNotes,
    selectNote,
    addNote,
    updateNote,
    deleteNote,
    shareNote,
    toggleStar,
    lockNote,
    removeLock,
    verifyPin,
    clearNotes,
    clearSelectedNote,
  };
});
