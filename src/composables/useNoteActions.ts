import { onMounted, onBeforeUnmount } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useNoteEditorStore } from "@/stores/note-editor";
import { useNotesStore } from "@/stores/notes";
import type { Note, NotePdf } from "@/types/notes";

export function useNoteActions() {
  const noteEditor = useNoteEditorStore();
  const notesStore = useNotesStore();
  const authStore = useAuthStore();

  const handleSelect = (note: Note) => {
    notesStore.selectNote(note);
    noteEditor.openEditNoteSide(note);
  };

  const handleSave = async (payload: {
    title: string;
    content: string;
    pdfs?: NotePdf[];
  }) => {
    if (noteEditor.editingNoteId === null) {
      const userId = authStore.user?.id;
      if (!userId) return;

      await notesStore.addNote({
        title: payload.title,
        content: payload.content,
        pdfs: payload.pdfs ?? [],
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        starred: false,
      });

      noteEditor.closeSideEditor();
      return;
    }

    const editingId = noteEditor.editingNoteId;

    await notesStore.updateNote(editingId, {
      title: payload.title,
      content: payload.content,
      pdfs: payload.pdfs ?? [],
    });

    const updated = notesStore.notes.find((note) => note.id === editingId);

    if (updated) {
      notesStore.selectNote(updated);
      noteEditor.openEditNoteSide(updated);
    } else {
      noteEditor.closeSideEditor();
    }
  };

  const handleDelete = async (id?: string | number) => {
    const targetId = id ?? noteEditor.editingNoteId;
    if (!targetId) return;

    await notesStore.deleteNote(Number(targetId));

    if (notesStore.selectedNote?.id === Number(targetId)) {
      notesStore.clearSelectedNote();
    }

    if (noteEditor.editingNoteId === Number(targetId)) {
      noteEditor.closeSideEditor();
    }
  };

  const setupLifecycle = () => {
    onMounted(async () => {
      noteEditor.closeAll();

      if (authStore.user?.id) {
        await notesStore.fetchNotes(authStore.user.id);
      }
    });

    onBeforeUnmount(() => {
      noteEditor.closeAll();
    });
  };

  return {
    noteEditor,
    notesStore,
    authStore,
    handleSelect,
    handleSave,
    handleDelete,
    setupLifecycle,
  };
}