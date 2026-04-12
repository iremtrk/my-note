<template>
  <q-card
    :style="{ background: getColor(note.id) }"
    class="my-card"
    clickable
    @click="emit('select', note)">
    <q-card-section class="row items-start justify-between no-wrap" >
      <div class="text-h6 note-title">
        {{ note.title }}
      </div>

      <q-btn
        icon="close"
        flat
        round
        dense
        class="card-delete-btn"
        @click.stop="showDeleteConfirm = true"
      />
    </q-card-section>

    <q-card-section class="card-preview">
      <div class="note-content">
        {{ previewText }}
      </div>
    </q-card-section>
  </q-card>

  <ConfirmDeleteDialog
    v-model="showDeleteConfirm"
    @confirm="emit('delete', note.id)"
  />
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import ConfirmDeleteDialog from "src/components/notes/ConfirmDeleteDialog.vue";
import type { Note } from "../../types/notes";
import { stripHtml } from "../../utils/html";

const showDeleteConfirm = ref(false);

const emit = defineEmits<{
  (e: "select", note: Note): void;
  (e: "delete", id: string): void;
}>();

const props = defineProps<{
  note: Note;
}>();

const previewText = computed(() => stripHtml(props.note.content));

const colors = ["#fef3c7", "#dbeafe", "#dcfce7", "#fce7f3", "#ede9fe"];

const getColor = (id: string | number) => {
  const num = Number(id)
  return colors[num % colors.length]
}
</script>

<style scoped>
.my-card {
  width: 100%;
  max-width: 250px;
  cursor: pointer;
  position: relative;
  border-radius: 20px;
}


.card-preview {
  height: 75px;
}

.note-content {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.note-title {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-delete-btn {
  flex-shrink: 0;
  margin-left: 8px;
}
</style>