<template>
  <div
    class="notes-layout q-pa-md"
    :class="{ 'detail-open': noteEditor.showSideEditor }"
  >
    <div class="notes-panel">
      <div v-if="notesStore.notes.length === 0" class="empty-state">
        <q-icon name="sticky_note_2" size="64px" color="primary" />
        <div class="text-h6 q-mt-md">{{ t('home.noNote') }}</div>
        <div class="text-grey q-mt-sm empty-text">{{t('home.firstNote')}}</div>
        <AddNoteButton class="q-mt-lg" color="primary" icon="add" :label="t('home.firstNoteBtn')" />
      </div>

      <template v-else>
        <div class="row items-center justify-end q-mb-md">
          <q-btn icon="sort" flat round dense color="grey-7" no-caps>
            <q-menu anchor="bottom right" self="top right">
              <q-list style="min-width: 200px">
                <q-item-label header class="text-caption text-grey-6">{{ t('home.sort') }}</q-item-label>
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
        </div>

        <div class="content-area">
          <div class="notes-scroll">
            <NoteCard
              v-for="note in notesStore.filteredNotes"
              :key="note.id"
              :note="note"
              @select="handleSelect"
              @delete="handleDelete"
              @toggle-star="notesStore.toggleStar"
            />
          </div>

          <div v-if="noteEditor.showSideEditor" class="detail-panel">
            <NoteEditor
              variant="side"
              :initial-title="noteEditor.title"
              :initial-content="noteEditor.content"
              :is-editing="noteEditor.editingNoteId !== null"
              @save="handleSave"
              @cancel="noteEditor.closeSideEditor()"
              @delete="handleDelete"
            />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import NoteCard from '@/components/notes/NoteCard.vue'
import NoteEditor from '@/components/notes/NoteEditor.vue'
import AddNoteButton from '@/components/notes/AddNoteButton.vue'
import { useNoteActions } from '@/composables/useNoteActions'
import type { SortOrder } from '@/stores/notes'
import { I18n, useI18n } from 'vue-i18n'

const {t}=useI18n()

const { noteEditor, notesStore, handleSelect, handleSave, handleDelete, setupLifecycle } =
  useNoteActions()

setupLifecycle()

const sortOptions: { label: string; value: SortOrder; icon: string }[] = [
  { label: t('home.sortNewest'), value: 'newest', icon: 'arrow_downward' },
  { label: t('home.sortOldest'), value: 'oldest', icon: 'arrow_upward' },
  { label: t('home.sortUpdated'), value: 'updated', icon: 'update' },
]

watch(
  () => notesStore.searchQuery,
  () => {
    if (
      notesStore.selectedNote &&
      !notesStore.filteredNotes.some((note) => note.id === notesStore.selectedNote?.id)
    ) {
      notesStore.clearSelectedNote()
      noteEditor.closeSideEditor()
    }
  }
)
</script>

<style scoped>
.notes-layout {
  height: calc(100vh - 82px);
  max-height: 500px;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.notes-panel {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.content-area {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  max-height: 500px;
}

.content-area:has(.detail-panel) {
  grid-template-columns: 1.2fr 0.8fr;
}

.notes-scroll {
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 280px));
  gap: 16px;
  align-content: start;
  justify-content: start;
}

.detail-panel {
  min-height: 0;
  overflow: hidden;
}

.empty-state {
  flex: 1;
  border: 2px dashed #d6d6d6;
  border-radius: 20px;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px;
}

.empty-text {
  max-width: 360px;
  line-height: 1.6;
}

@media (max-width: 767px) {
  .notes-layout {
    overflow-y: auto;
  }

  .content-area,
  .content-area:has(.detail-panel) {
    grid-template-columns: 1fr;
  }

  .detail-panel {
    height: 600px;
  }
}
</style>