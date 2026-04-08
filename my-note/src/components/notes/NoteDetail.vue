<template>
  <q-card bordered class="detail-card" :class="cardClass" :style="cardStyle">
    <q-card-section class="detail-actions">
      <q-btn
        icon="edit"
        flat
        round
        color="black"
        @click="emit('edit', note)"
      />

      <q-btn
        icon="delete"
        flat
        round
        color="negative"
        @click="emit('delete', note.id)"
      />

      <q-btn
        v-if="showClose"
        icon="close"
        flat
        round
        color="grey"
        @click="emit('close')"
      />
    </q-card-section>

    <q-card-section class="detail-title-section">
      <div class="text-h6 detail-title">
        {{ note.title }}
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section class="detail-scroll">
      <div class="note-detail-html" v-html="note.content"></div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import type { PropType, StyleValue } from "vue";
import type { Note } from "../../types/notes";

defineProps({
  note: {
    type: Object as PropType<Note>,
    required: true,
  },
  showClose: {
    type: Boolean,
    default: true,
  },
  cardClass: {
    type: [String, Array, Object] as PropType<
      string | string[] | Record<string, boolean>
    >,
    default: "",
  },
  cardStyle: {
    type: [String, Array, Object] as PropType<StyleValue>,
    default: "",
  },
});

const emit = defineEmits<{
  (e: "edit", note: Note): void;
  (e: "delete", id: string): void;
  (e: "close"): void;
}>();
</script>

<style scoped>
.detail-card {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.detail-actions,
.detail-title-section {
  flex-shrink: 0;
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
</style>