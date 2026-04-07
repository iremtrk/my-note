<template>
  <div class="q-pa-md">

    <div class="notes-scroll">
      <NoteCard
        v-for="note in notesStore.notes"
        :key="note.id"
        :note="note"
        @edit="openEditDialog"
        @delete="handleDelete"
      />
    </div>

  </div>

  <NoteEditor
    v-model="editorDialog"
    :initial-title="selectedNote?.title ?? ''"
    :initial-content="selectedNote?.content ?? ''"
    :is-editing="isEditing"
    @save="handleSave"
    @cancel="closeDialog"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useNotesStore } from "src/stores/notes";
import NoteCard from "src/components/notes/NoteCard.vue";
import NoteEditor from "src/components/notes/NoteEditor.vue";
import type { Note } from "src/types/notes";

const notesStore = useNotesStore();

const editorDialog = ref(false);
const isEditing = ref(false);
const selectedNote = ref<Note | null>(null);
const slide = ref(0);

onMounted(() => {
  notesStore.fetchNotes();
});

const groupedNotes = computed(() => {
  const groups: Note[][] = [];
  const size = 3;

  for (let i = 0; i < notesStore.notes.length; i += size) {
    groups.push(notesStore.notes.slice(i, i + size));
  }

  return groups;
});

const openEditDialog = (note: Note) => {
  selectedNote.value = { ...note };
  isEditing.value = true;
  editorDialog.value = true;
};

const closeDialog = () => {
  editorDialog.value = false;
  isEditing.value = false;
  selectedNote.value = null;
};

const handleSave = async (payload: { title: string; content: string }) => {
  if (!selectedNote.value) return;

  await notesStore.updateNote(selectedNote.value.id, payload);
  closeDialog();
};

const handleDelete = async (id: string) => {
  await notesStore.deleteNote(id);

  if (selectedNote.value?.id === id) {
    selectedNote.value = null;
  }

  if (slide.value >= groupedNotes.value.length && slide.value > 0) {
    slide.value -= 1;
  }
};
</script>

<style scoped>
.notes-scroll {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  padding-bottom: 8px;
}

.notes-scroll > * {
  flex: 0 0 auto;
  scroll-snap-align: start;
}
</style>