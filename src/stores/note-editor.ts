import { defineStore } from "pinia";
import { ref } from "vue";
import type { Note, NotePdf } from "@/types/notes";

export const useNoteEditorStore = defineStore("noteEditor", () => {
  const showModal = ref(false);
  const showSideEditor = ref(false);

  const editingNoteId = ref<number | null>(null);
  const title = ref("");
  const content = ref("");
  const pdfs = ref<NotePdf[]>([]);

  const resetEditor = () => {
    editingNoteId.value = null;
    title.value = "";
    content.value = "";
    pdfs.value = [];
  };

  const openNewNoteModal = () => {
    showSideEditor.value = false;
    showModal.value = true;
    resetEditor();
  };

  const openEditNoteModal = (note: Note) => {
    showSideEditor.value = false;
    showModal.value = true;

    editingNoteId.value = note.id;
    title.value = note.title;
    content.value = note.content;
    pdfs.value = note.pdfs ?? [];
  };

  const openEditNoteSide = (note: Note) => {
    showModal.value = false;
    showSideEditor.value = true;

    editingNoteId.value = note.id;
    title.value = note.title;
    content.value = note.content;
    pdfs.value = note.pdfs ?? [];
  };

  const closeModal = () => {
    showModal.value = false;
    resetEditor();
  };

  const closeSideEditor = () => {
    showSideEditor.value = false;
    resetEditor();
  };

  const closeAll = () => {
    showModal.value = false;
    showSideEditor.value = false;
    resetEditor();
  };

  return {
    showModal,
    showSideEditor,
    editingNoteId,
    title,
    content,
    pdfs,
    openNewNoteModal,
    openEditNoteModal,
    openEditNoteSide,
    closeModal,
    closeSideEditor,
    closeAll,
  };
});