<template>
  <q-card bordered class="full-height notes-card">
    <q-card-section class="row items-center justify-between">
      <div class="text-h6">My Notes</div>

      <div class="row items-center q-gutter-xs">
        <!-- Filtre dropdown -->
        <q-btn icon="sort" flat round dense color="grey-7">
          <q-menu anchor="bottom right" self="top right">
            <q-list style="min-width: 180px">
              <q-item-label header class="text-caption text-grey-6">Sırala</q-item-label>

              <q-item
                v-for="opt in sortOptions"
                :key="opt.value"
                clickable
                v-close-popup
                :active="notesStore.sortOrder === opt.value"
                active-class="text-primary"
                @click="notesStore.sortOrder = opt.value"
              >
                <q-item-section avatar>
                  <q-icon :name="opt.icon" size="18px" />
                </q-item-section>
                <q-item-section>{{ opt.label }}</q-item-section>
                <q-item-section side v-if="notesStore.sortOrder === opt.value">
                  <q-icon name="check" size="16px" color="primary" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <q-btn icon="add" round flat color="primary" @click="noteEditor.openNewNoteModal()" />
      </div>
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
          @click="$emit('select-note', note)"
        >
          <q-item-section>
            <div class="row items-start justify-between no-wrap">
              <q-item-label class="text-weight-medium note-title">
                {{ note.title }}
              </q-item-label>

              <div class="row items-center">
                <q-btn
                  :icon="note.starred ? 'star' : 'star_border'"
                  :color="note.starred ? 'pink' : 'grey-5'"
                  flat round dense size="sm"
                  @click.stop="$emit('toggle-star', note.id)"
                />
                <q-btn
                  icon="close"
                  flat round dense size="sm"
                  color="grey-7"
                  class="delete-btn"
                  @click.stop="openDeleteConfirm(note.id)"
                />
              </div>
            </div>

            <q-item-label caption class="note-preview q-mt-xs">
              {{ stripHtml(note.content) }}
            </q-item-label>

            <q-item-label caption class="note-date q-mt-xs">
              {{ formatNoteDate(note.createdAt) }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>

  <ConfirmDeleteDialog v-model="showDeleteConfirm" @confirm="confirmDelete" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ConfirmDeleteDialog from '@/components/notes/ConfirmDeleteDialog.vue'
import type { Note } from '@/types/notes'
import { stripHtml } from '@/utils/html'
import { formatNoteDate } from '@/utils/date'
import { useNoteEditorStore } from '@/stores/note-editor'
import { useNotesStore } from '@/stores/notes'
import type { SortOrder } from '@/stores/notes'

defineProps<{
  notes: Note[]
  selectedNoteId: string | number | null
}>()

const emit = defineEmits<{
  (e: 'select-note', note: Note): void
  (e: 'delete-note', id: string | number): void
  (e: 'toggle-star', id: string | number): void
}>()

const noteEditor = useNoteEditorStore()
const notesStore = useNotesStore()

const sortOptions: { label: string; value: SortOrder; icon: string }[] = [
  { label: 'Oluşturma: Yeniden Eskiye', value: 'newest', icon: 'arrow_downward' },
  { label: 'Oluşturma: Eskiden Yeniye', value: 'oldest', icon: 'arrow_upward' },
  { label: 'Son Güncellenen', value: 'updated', icon: 'update' },
]

const showDeleteConfirm = ref(false)
const deletingNoteId = ref<string | number | null>(null)

const openDeleteConfirm = (id: string | number) => {
  deletingNoteId.value = id
  showDeleteConfirm.value = true
}

const confirmDelete = () => {
  if (!deletingNoteId.value) return
  emit('delete-note', deletingNoteId.value)
  deletingNoteId.value = null
}
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
  margin-left: 2px;
  margin-top: -2px;
}

.note-preview {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  word-break: break-word;
}

.note-date {
  font-size: 11px;
  color: #9ca3af;
  text-align: right;
}
</style>