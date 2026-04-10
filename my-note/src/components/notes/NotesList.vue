<template>
  <q-card bordered class="full-height notes-card">
    <q-card-section class="row items-center justify-between">
      <div class="text-h6">My Notes</div>
      <AddNoteButton icon="add" round flat color="primary" />
    </q-card-section>

    <q-separator />

    <q-card-section v-if="notes.length === 0" class="text-grey">
      No notes yet.
    </q-card-section>

    <q-card-section v-else class="list-section">
      <q-list separator class="note-scroll">
        <q-item
          v-for="note in notes"
          :key="note.id"
          clickable
          :active="selectedNoteId === note.id"
          active-class="bg-grey-3 text-primary"
          class="note-item"
          @click="$emit('select-note', note)">
          <q-item-section>
            <div class="row items-start justify-between no-wrap">
              <q-item-label class="text-weight-medium note-title">
                {{ note.title }}
              </q-item-label>

              <q-btn
                icon="close"
                flat
                round
                dense
                size="sm"
                color="grey-7"
                class="delete-btn"
                @click.stop="openDeleteConfirm(note.id)"
              />
            </div>

            <q-item-label caption class="note-preview q-mt-xs">
              {{ getPreviewText(note.content) }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>

  <ConfirmDeleteDialog
    v-model="showDeleteConfirm"
    @confirm="confirmDelete"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import AddNoteButton from "src/components/notes/AddNoteButton.vue";
import ConfirmDeleteDialog from "src/components/notes/ConfirmDeleteDialog.vue";
import type { Note } from "../../types/notes";

defineProps<{
  notes: Note[];
  selectedNoteId: string | null;
}>();

const emit = defineEmits<{
  (e: "select-note", note: Note): void;
  (e: "delete-note", id: string): void;
}>();

const showDeleteConfirm = ref(false);
const deletingNoteId = ref<string | null>(null);

const openDeleteConfirm = (id: string) => {
  deletingNoteId.value = id;
  showDeleteConfirm.value = true;
};

const confirmDelete = () => {
  if (!deletingNoteId.value) return;

  emit("delete-note", deletingNoteId.value);
  deletingNoteId.value = null;
};

const getPreviewText = (html: string) => {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
};
</script>

<style scoped>
.notes-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.list-section {
  flex: 1;
  min-height: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.note-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.note-item :deep(.q-item__section) {
  min-width: 0;
}

.note-title {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.delete-btn {
  flex-shrink: 0;
  margin-left: 8px;
  margin-top: -2px;
}

.note-preview {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  word-break: break-word;
}
</style>