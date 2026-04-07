<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <q-card style="min-width: 700px; max-width: 900px; width: 100%;">
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

      <q-card-section class="column q-gutter-md">
        <q-input
          v-model="localTitle"
          label="Title"
          outlined
        />

        <q-editor
          v-model="localContent"
          min-height="300px"
          :toolbar="editorToolbar"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          label="Cancel"
          @click="handleCancel"
        />

        <q-btn
          color="primary"
          :label="isEditing ? 'Update' : 'Add'"
          @click="handleSave"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  initialTitle: string
  initialContent: string
  isEditing: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', payload: { title: string; content: string }): void
  (e: 'cancel'): void
}>()

const localTitle = ref('')
const localContent = ref('')

const editorToolbar = [
  ['left', 'center', 'right', 'justify'],
  ['bold', 'italic', 'underline', 'strike'],
  ['unordered', 'ordered'],
  ['quote', 'hr'],
  ['link'],
  ['undo', 'redo'],
]

watch(
  () => [props.modelValue, props.initialTitle, props.initialContent],
  () => {
    localTitle.value = props.initialTitle
    localContent.value = props.initialContent
  },
  { immediate: true }
)

const handleSave = () => {
  const title = localTitle.value.trim()
  const content = localContent.value.trim()

  if (!content) return


  emit('save', { title, content })
}

const handleCancel = () => {
  emit('cancel')
  emit('update:modelValue', false)
}

</script>

<style scoped>
.q-editor{
  word-break: break-word;
}
</style>