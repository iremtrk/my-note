<template>
  <q-card class="my-card bg-primary text-white">
    <q-card-section>
      <div class="text-h6">
        {{ note.title }}
      </div>
    </q-card-section>

    <q-card-section class="note-content">
      <div v-html="note.content"></div>
    </q-card-section>

    <q-separator dark />

    <q-card-actions align="right">
      <q-btn
        flat
        color="white"
        icon="edit"
        @click="emit('edit', note)"
      />

      <q-btn
        flat
        color="white"
        icon="delete"
        @click="emit('delete', note.id)"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import type { Note } from "src/types/notes";

defineProps<{
  note: Note;
}>();

const emit = defineEmits<{
  (e: "edit", note: Note): void;
  (e: "delete", id: string): void;
}>();
</script>

<style scoped>
.my-card {
  width: 100%;
  max-width: 250px;
}

.note-content {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
  overflow-wrap: anywhere;
}

</style>