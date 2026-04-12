<template>
  <q-btn v-bind="$attrs" @click="handleClick" />
</template>

<script setup lang="ts">
import { useNoteEditorStore } from '@/stores/note-editor'

defineOptions({ inheritAttrs: false })

const noteEditor = useNoteEditorStore()
const handleClick = () => noteEditor.openNewNoteModal()
</script>