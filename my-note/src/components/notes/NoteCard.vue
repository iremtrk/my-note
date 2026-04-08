<template>
  <q-card class="my-card bg-primary text-white" clickable @click="$emit('select', note)">
    <q-card-section >
      <div class="text-h6 note-title">
        {{ note.title }}
      </div>
    </q-card-section>

    <q-card-section class="note-content" style="height: 75px;">
      <div v-html="note.content" class="note-content"></div>
    </q-card-section>

    <q-separator dark />

    <!-- <q-card-actions align="right">
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
    </q-card-actions> -->
  </q-card>
</template>

<script setup lang="ts">
import type { Note } from "../../types/notes";
import { computed } from "vue";

const props =defineProps<{
  note: Note;
}>();

const emit = defineEmits<{
  (e:"select",note:Note): void
  (e: "edit", note: Note): void;
  (e: "delete", id: string): void;
}>();

const previewText = computed(()=>{
  const div =document.createElement("div")
  div.innerHTML = props.note.content;
  return div.textContent || div.innerText || "";
})
</script>

<style scoped>
.my-card {
  width: 100%;
  max-width: 250px;
  cursor:pointer
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

.note-title{
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

</style>