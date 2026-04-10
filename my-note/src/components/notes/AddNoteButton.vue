<template>
  <q-btn
    :label="label"
    :icon="icon"
    :round="round"
    :flat="flat"
    :color="color"
    :class="buttonClass"
    @click="handleClick"
  />
</template>

<script setup lang="ts">
import { useNoteEditorStore } from '../../stores/note-editor'

withDefaults(
  defineProps<{
    label?: string
    icon?: string
    round?: boolean
    flat?: boolean
    color?: string
    buttonClass?: string
  }>(),
  {
    label: '',
    icon: 'add',
    round: false,
    flat: false,
    color: 'primary',
    buttonClass: '',
  }
)

const noteEditor = useNoteEditorStore()

const handleClick = () => {
  noteEditor.openNewNoteModal()
}
</script>