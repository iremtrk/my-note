

<template>
<q-layout view="hHh Lpr lFf" >
    <q-header elevated class="bg-primary">
      <q-toolbar>
        <q-btn
          flat
          dense
          icon="menu"
          @click="drawer = !drawer"
        />
        <q-toolbar-title>My App</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="drawer"
      show-if-above
      bordered
      :breakpoint="768"
    >
      <AppSidebar />
    </q-drawer>

    <q-page-container>
      <q-page padding>
        <router-view />
      </q-page>
    </q-page-container>

    <NoteEditor
      v-model="noteEditor.showForm"
      :initial-title="noteEditor.title"
      :initial-content="noteEditor.content"
      :is-editing="noteEditor.editingNoteId !== null"
      @save="handleSave"
      @cancel="noteEditor.closeEditor()"
    />
  </q-layout>
</template>


<script setup lang="ts">
import { ref } from "vue";
import axios from 'axios'
import AppSidebar from "../components/layout/AppSidebar.vue";
import NoteEditor from 'src/components/notes/NoteEditor.vue'
import { useNoteEditorStore } from '../stores/note-editor'
import { useNotesStore } from '../stores/notes'

const drawer = ref(true);

const noteEditor = useNoteEditorStore()
const notesStore = useNotesStore()

const handleSave = async (payload: { title: string; content: string }) => {
  if (noteEditor.editingNoteId === null) {
    await notesStore.addNote(payload)
  } else {
    await notesStore.updateNote(noteEditor.editingNoteId, payload)
  }

  noteEditor.closeEditor()
}
</script>

<style scoped>


</style>