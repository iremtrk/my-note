<template>
  <q-btn
    icon="add"
    round
    flat
    color="primary"
    class="buttonClass"
    @click="noteEditor.openNewNote()"
  />
</template>

<script setup lang="ts">
import { useNoteEditorStore } from '../../stores/note-editor'

const noteEditor = useNoteEditorStore()
</script>