<template>
  <div class="notes-layout q-pa-md" :class="{ 'detail-open': selectedNote }">
    <div class="notes-panel">
      <div class="notes-scroll">
        <NoteCard
          v-for="note in notesStore.notes"
          :key="note.id"
          :note="note"
          @select="handleSelect"
          @edit="openEditDialog"
          @delete="handleDelete"
        />
      </div>
    </div>

    <div v-if="selectedNote" class="detail-panel">
      <NoteDetail
        :note="selectedNote"
        :card-style="{ height: '500px' }"
        show-close
        @edit="openEditDialog"
        @delete="handleDelete"
        @close="selectedNote = null"
      />
    </div>
  </div>

  <NoteEditor
    v-model="editorDialog"
    :initial-title="editingNote?.title ?? ''"
    :initial-content="editingNote?.content ?? ''"
    :is-editing="isEditing"
    @save="handleSave"
    @cancel="closeDialog"
  />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useNotesStore } from "../stores/notes";
import NoteCard from "src/components/notes/NoteCard.vue";
import NoteEditor from "src/components/notes/NoteEditor.vue";
import type { Note } from "../types/notes";
import NoteDetail from "../components/notes/NoteDetail.vue";

const notesStore = useNotesStore();

const editorDialog = ref(false);
const isEditing = ref(false);
const selectedNote = ref<Note | null>(null);
const editingNote = ref<Note | null>(null);

onMounted(() => {
  notesStore.fetchNotes();
});

const handleSelect = (note: Note) => {
  selectedNote.value = { ...note };
};

const openEditDialog = (note: Note) => {
  editingNote.value = { ...note };
  isEditing.value = true;
  editorDialog.value = true;
};

const closeDialog = () => {
  editorDialog.value = false;
  isEditing.value = false;
  editingNote.value = null;
};

const handleSave = async (payload: { title: string; content: string }) => {
  if (!editingNote.value) return;

  await notesStore.updateNote(editingNote.value.id, payload);

  const updated = notesStore.notes.find((n) => n.id === editingNote.value?.id);

  if (updated && selectedNote.value?.id === updated.id) {
    selectedNote.value = { ...updated };
  }

  closeDialog();
};

const handleDelete = async (id: string) => {
  await notesStore.deleteNote(id);

  if (selectedNote.value?.id === id) {
    selectedNote.value = null;
  }
};
</script>

<style scoped>
.notes-layout {
  height: calc(100vh - 82px);
  min-height: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.notes-layout.detail-open {
  grid-template-columns: 1.2fr 0.8fr;
}

.notes-scroll {
  height: 500px;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;

  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 16px;
}

.detail-card {
  height: 500px;
  display: flex;
  flex-direction: column;
}

.detail-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.note-detail-html {
  overflow-wrap: anywhere;
  word-break: break-word;
}

.detail-title {
  min-width: 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-word;
}

@media (min-width: 768px) {
  .notes-scroll {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1200px) {
  .notes-scroll {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .notes-layout:not(.detail-open) .notes-panel {
    width: 100%;
  }
}
</style>