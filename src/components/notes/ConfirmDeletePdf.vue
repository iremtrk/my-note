<template>
  <q-dialog
    :model-value="modelValue"
    persistent
    @update:model-value="emit('update:modelValue', $event)"
  >
    <q-card class="delete-dialog">
      <q-card-section class="dialog-header no-wrap">
        <div>
          <div class="text-h6 dialog-title">{{ t('pdf.deleteTitle') }}</div>
        </div>
      </q-card-section>

      <q-card-section class="dialog-message">
        {{ t('pdf.deleteMessage') }}
      </q-card-section>

      <q-card-actions align="right" class="dialog-actions">
        <q-btn
          flat
          :label="t('pdf.cancel')"
          class="cancel-btn"
          @click="emit('update:modelValue', false)"
        />
        <q-btn
          unelevated
          color="negative"
          :label="t('pdf.delete')"
          class="delete-btn"
          @click="handleConfirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">

import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps<{
  modelValue: boolean

}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
}>()

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