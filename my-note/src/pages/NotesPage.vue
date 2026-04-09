<template>
  <div class="row q-col-gutter-md notes-page">
    <div class="col-4 full-height">
      <NotesList
        :notes="notesStore.notes"
        :selected-note-id="notesStore.selectedNote?.id ?? null"
        @select-note="handleSelectNote"
      />
    </div>

    <div class="col-8 full-height">
      <q-card bordered class="full-height detail-card">
        <template v-if="notesStore.selectedNote">
          <q-card-section class="row items-center justify-between">
            <div class="text-h6">Edit Note</div>

            <div class="row q-gutter-sm">
              <q-btn
                icon="delete"
                flat
                round
                color="negative"
                @click="handleDelete"
              />
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section class="editor-wrapper">
            <NoteEditor
              embedded
              auto-save
              :debounce-ms="700"
              :initial-title="editTitle"
              :initial-content="editContent"
              :is-editing="true"
              @change="handleEditorChange"
            />
          </q-card-section>
        </template>

        <q-card-section v-else class="text-grey">
          Select a note.
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import NotesList from 'src/components/notes/NotesList.vue'
import NoteEditor from 'src/components/notes/NoteEditor.vue'
import { useNotesStore } from '../stores/notes'
import type { Note } from '../types/notes'
import { useAuthStore } from '../stores/auth'

const notesStore = useNotesStore()
const authStore = useAuthStore()

const editTitle = ref('')
const editContent = ref('')
const isFillingEditor = ref(false)

const fillEditorFields = (note: Note | null) => {
  isFillingEditor.value = true
  editTitle.value = note?.title ?? ''
  editContent.value = note?.content ?? ''

  setTimeout(() => {
    isFillingEditor.value = false
  }, 0)
}

const handleSelectNote = (note: Note) => {
  notesStore.selectNote(note)
  fillEditorFields(note)
}

const handleEditorChange = async (payload: {
  title: string
  content: string
}) => {
  if (!notesStore.selectedNote || isFillingEditor.value) return

  const title = payload.title
  const content = payload.content

  if (!content) return

  const currentNote = notesStore.selectedNote

  if (title === currentNote.title && content === currentNote.content) return

  editTitle.value = title
  editContent.value = content

  await notesStore.updateNote(currentNote.id, {
    title,
    content,
  })
}

const handleDelete = async () => {
  if (!notesStore.selectedNote) return
  await notesStore.deleteNote(notesStore.selectedNote.id)
}

watch(
  () => authStore.isReady,
  async (isReady) => {
    if (isReady && authStore.user) {
      await notesStore.fetchNotes()
    }
  },
  { immediate: true }
)

onMounted(async () => {
  if (authStore.isReady && authStore.user) {
    await notesStore.fetchNotes()
  }
})
</script>

<style scoped>
.notes-page {
  height: calc(100vh - 60px);
}

.detail-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-wrapper {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
</style>