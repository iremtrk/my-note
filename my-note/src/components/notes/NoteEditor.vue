<template>
  <component
    :is="embedded ? 'div' : 'q-dialog'"
    v-bind="embedded ? {} : dialogBindings"
    class="note-editor-root"
  >
    <q-card
      :bordered="embedded"
      :class="embedded ? 'full-height editor-card-flat' : ''"
      style="min-width: 700px; max-width: 900px; width: 100%;"
    >
      <q-card-section class="row items-center justify-between">
        <div class="text-h6">
          {{ isEditing ? 'Edit Note' : 'New Note' }}
        </div>

        <q-btn
          icon="close"
          flat
          round
          @click="handleCancel"
        />
      </q-card-section>

      <q-separator />

      <q-card-section class="editor-section">
        <q-input
          v-model="localTitle"
          label="Title"
          outlined
          class="q-mb-md"
        />

        <q-editor
          v-model="localContent"
          class="editor-fill"
          :toolbar="editorToolbar"
          content-style="overflow-y:auto; word-break:break-word; overflow-wrap:anywhere;"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          label="Reset"
          @click="resetFields"
        />

        <q-btn
          v-if="!autoSave"
          color="primary"
          :label="isEditing ? 'Update' : 'Add'"
          @click="handleSave"
        />
      </q-card-actions>
    </q-card>
  </component>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { debounce } from 'quasar'

const props = withDefaults(defineProps<{
  modelValue?: boolean
  initialTitle: string
  initialContent: string
  isEditing: boolean
  embedded?: boolean
  autoSave?: boolean
  debounceMs?: number
}>(), {
  modelValue: false,
  embedded: false,
  autoSave: false,
  debounceMs: 700,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', payload: { title: string; content: string }): void
  (e: 'cancel'): void
  (e: 'change', payload: { title: string; content: string }): void
}>()

const localTitle = ref('')
const localContent = ref('')
const isSyncingFromProps = ref(false)

const editorToolbar = [
  ['left', 'center', 'right', 'justify'],
  ['bold', 'italic', 'underline', 'strike'],
  ['unordered', 'ordered'],
  ['quote', 'hr'],
  ['link'],
  ['undo', 'redo'],
]

const dialogBindings = computed(() => ({
  modelValue: props.modelValue,
  'onUpdate:modelValue': (value: boolean) => emit('update:modelValue', value),
}))

const syncFromProps = () => {
  isSyncingFromProps.value = true
  localTitle.value = props.initialTitle
  localContent.value = props.initialContent

  setTimeout(() => {
    isSyncingFromProps.value = false
  }, 0)
}

watch(
  () => [props.modelValue, props.initialTitle, props.initialContent],
  () => {
    syncFromProps()
  },
  { immediate: true }
)

const debouncedEmitChange = debounce(() => {
  if (!props.autoSave || isSyncingFromProps.value) return

  emit('change', {
    title: localTitle.value.trim(),
    content: localContent.value.trim(),
  })
}, props.debounceMs)

watch([localTitle, localContent], () => {
  if (!props.autoSave) return
  if (isSyncingFromProps.value) return
  debouncedEmitChange()
})

const handleSave = () => {
  const title = localTitle.value.trim()
  const content = localContent.value.trim()

  if (!content) return

  emit('save', { title, content })
}

const handleCancel = () => {
  emit('cancel')

  if (!props.embedded) {
    emit('update:modelValue', false)
  }
}

const resetFields = () => {
  syncFromProps()
}
</script>

<style scoped>
.note-editor-root {
  height: 100%;
}

.editor-card-flat {
  width: 100%;
  max-width: none !important;
  min-width: 0 !important;
  display: flex;
  flex-direction: column;
}

.editor-section {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-fill {
  flex: 1;
  min-height: 0;
  height: 0;
}

:deep(.q-editor) {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

:deep(.q-editor__toolbar) {
  flex-shrink: 0;
}

:deep(.q-editor__content) {
  flex: 1;
  min-height: 0 !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  word-break: break-word;
  overflow-wrap: anywhere;
}
</style>