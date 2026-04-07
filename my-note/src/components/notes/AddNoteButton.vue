<template>
  <q-btn
    :icon="icon"
    :label="label"
    :round="round"
    :flat="flat"
    :unelevated="unelevated"
    :color="color"
    :class="buttonClass"
    @click="noteEditor.openNewNote()"
  />
</template>

<script setup lang="ts">
import { useNoteEditorStore } from '../../stores/note-editor'

withDefaults(
  defineProps<{
    label?: string
    icon?: string
    color?: string
    round?: boolean
    flat?: boolean
    unelevated?: boolean
    buttonClass?: string
  }>(),
  {
    label: '',
    icon: 'add',
    color: 'primary',
    round: false,
    flat: false,
    unelevated: false,
    buttonClass: '',
  }
)

const noteEditor = useNoteEditorStore()
</script>