<template>
  <q-btn v-bind="$attrs" @click="handleClick" />
</template>

<script setup lang="ts">
import { useTaskEditorStore } from '@/stores/task-editor'
import { useI18n } from "vue-i18n";

const t = useI18n

defineOptions({ inheritAttrs: false })

const taskEditor = useTaskEditorStore()
const handleClick = () => taskEditor.openAddModal()
</script>