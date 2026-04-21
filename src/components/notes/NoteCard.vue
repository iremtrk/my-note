<template>
  <q-card
    :style="{
      background: getColor(note.id),
      color: $q.dark.isActive ? '#f5f5f5' : '#222',
    }"
    class="my-card"
    clickable
    @click="emit('select', note)"
  >
    <q-card-section class="row items-start justify-between no-wrap">
      <div class="text-h6 note-title">
        {{ note.title }}
      </div>

      <div class="row items-center">
        <q-btn
          :icon="note.starred ? 'star' : 'star_border'"
          :color="note.starred ? 'primary' : 'grey-5'"
          flat
          round
          dense
          size="sm"
          class="star-btn"
          @click.stop="emit('toggle-star', note.id)"
        />
        <q-btn
          icon="close"
          flat
          round
          dense
          size="sm"
          @click.stop="showDeleteConfirm = true"
        />
      </div>
    </q-card-section>

    <q-card-section class="card-preview">
      <div class="note-content">{{ previewText }}</div>
    </q-card-section>

    <q-card-section class="card-footer">
      <span class="note-date">{{ formattedDate }}</span>
    </q-card-section>
  </q-card>

  <ConfirmDelete
    v-model="showDeleteConfirm"
    :title="t('noteList.deleteTitle')"
    :message="t('noteList.deleteMessage')"
    @confirm="emit('delete', note.id)"
  />
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import ConfirmDelete from "@/common/ConfirmDelete.vue";
import type { Note } from "@/types/notes";
import { stripHtml } from "@/utils/html";
import { formatNoteDate } from "@/utils/date";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";

const {t}=useI18n()

const $q = useQuasar();

const showDeleteConfirm = ref(false);

const emit = defineEmits<{
  (e: "select", note: Note): void;
  (e: "delete", id: string | number): void;
  (e: "toggle-star", id: string | number): void;
}>();

const props = defineProps<{ note: Note }>();

const previewText = computed(() => stripHtml(props.note.content));
const formattedDate = computed(() => formatNoteDate(props.note.createdAt));

const lightColors = ["#fef3c7", "#dbeafe", "#dcfce7", "#fce7f3", "#ede9fe"];
const darkColors = ["#3a2f12", "#1e3a5f", "#1f4d3a", "#4a2238", "#352a56"];

const getColor = (id: string | number) => {
  const palette = $q.dark.isActive ? darkColors : lightColors;
  return palette[Number(id) % palette.length];
};
</script>

<style scoped>
.my-card {
  width: 100%;
  /* max-width: 250px; */
  cursor: pointer;
  border-radius: 20px;
}

.card-preview {
  height: 60px;
  padding-bottom: 4px;
}

.note-title {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

.card-footer {
  padding-top: 4px;
  display: flex;
  justify-content: flex-end;
}

.note-date {
  font-size: 11px;
  color: #9ca3af;
}

.star-btn {
  flex-shrink: 0;
}

</style>
