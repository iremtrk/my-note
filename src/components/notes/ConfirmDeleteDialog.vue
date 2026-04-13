<template>
  <q-dialog
    :model-value="modelValue"
    persistent
    @update:model-value="emit('update:modelValue', $event)"
  >
    <q-card class="delete-dialog">
      <q-card-section class="dialog-header no-wrap">
        <div class="text-h6 dialog-title">{{ finalTitle }}</div>
      </q-card-section>

      <q-card-section class="dialog-message">
        {{ finalMessage }}
      </q-card-section>

      <q-card-actions align="right" class="dialog-actions">
        <q-btn
          flat
          :label=finalCancelLabel
          class="cancel-btn"
          @click="emit('update:modelValue', false)"
        />
        <q-btn
          unelevated
          color="negative"
          :label="finalConfirmLabel"
          class="delete-btn"
          @click="handleConfirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  modelValue: boolean
  title?: string
  message?: string
  confirmLabel?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
}>()

const { t } = useI18n()

const finalTitle = computed(() => t('confirm.deleteTitle'))
const finalMessage = computed(() => t('confirm.deleteMessage'))
const finalConfirmLabel = computed(() => t('confirm.delete'))
const finalCancelLabel=computed(()=>t('confirm.cancel'))

const handleConfirm = () => {
  emit('confirm')
  emit('update:modelValue', false)
}
</script>

<style scoped>
.delete-dialog {
  width: 100%;
  max-width: 380px;
  border-radius: 18px;
  padding: 4px;
}

.dialog-header {
  padding: 20px 20px 8px;
}

.dialog-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(244, 67, 54, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dialog-title {
  font-weight: 600;
  line-height: 1.2;
}

.dialog-subtitle {
  font-size: 13px;
  color: #777;
  margin-top: 4px;
}

.dialog-message {
  padding: 8px 20px 16px;
  font-size: 14px;
  color: #444;
  line-height: 1.5;
}

.dialog-actions {
  padding: 0 20px 20px;
  gap: 8px;
}

.cancel-btn {
  border-radius: 10px;
  padding: 0 14px;
}

.delete-btn {
  border-radius: 10px;
  padding: 0 16px;
}
</style>