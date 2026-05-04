<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    persistent
  >
    <q-card class="pin-modal">
      <q-card-section class="row items-center justify-between">
        <div class="text-h6">{{ title }}</div>
        <q-btn icon="close" flat round @click="closeModal" />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-gutter-md">
        <div class="text-body2 text-grey-8">
          {{ description }}
        </div>
        
        <q-input
          v-model="pin"
          label="PIN"
          outlined
          type="password"
          autofocus
          @keyup.enter="handleSubmit"
        />
      </q-card-section>

      <q-card-actions align="right" class="actions">
        <q-btn flat label="Cancel" @click="closeModal" />
        <q-btn
          color="primary"
          :label="actionLabel"
          :disable="pin.length < 4 || loading"
          :loading="loading"
          @click="handleSubmit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useNotesStore } from "@/stores/notes";
import { useQuasar } from "quasar";

const $q = useQuasar();
const notesStore = useNotesStore();

const props = defineProps<{
  modelValue: boolean;
  mode: "lock" | "remove-lock" | "verify";
  noteId: number | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "success"): void;
}>();

const pin = ref("");
const loading = ref(false);

const title = computed(() => {
  if (props.mode === "lock") return "Lock Note";
  if (props.mode === "remove-lock") return "Remove Lock";
  return "Unlock Note";
});

const description = computed(() => {
  if (props.mode === "lock") return "Set a PIN (min 4 chars) to lock this note.";
  if (props.mode === "remove-lock") return "Enter your PIN to remove the lock permanently.";
  return "Enter your PIN to view this locked note.";
});

const actionLabel = computed(() => {
  if (props.mode === "lock") return "Lock";
  if (props.mode === "remove-lock") return "Remove Lock";
  return "Unlock";
});

watch(() => props.modelValue, (val) => {
  if (val) {
    pin.value = "";
    loading.value = false;
  }
});

const handleSubmit = async () => {
  if (pin.value.length < 4 || !props.noteId || loading.value) return;

  loading.value = true;
  try {
    if (props.mode === "lock") {
      await notesStore.lockNote(props.noteId, pin.value);
      $q.notify({ type: "positive", message: "Note locked successfully" });
    } else if (props.mode === "remove-lock") {
      await notesStore.removeLock(props.noteId, pin.value);
      $q.notify({ type: "positive", message: "Lock removed successfully" });
    } else if (props.mode === "verify") {
      await notesStore.verifyPin(props.noteId, pin.value);
      $q.notify({ type: "positive", message: "Note unlocked" });
    }
    
    emit("success");
    closeModal();
  } catch (err: any) {
    $q.notify({ type: "negative", message: err.message || "Action failed" });
  } finally {
    loading.value = false;
  }
};

const closeModal = () => {
  emit("update:modelValue", false);
};
</script>

<style scoped>
.pin-modal {
  width: 420px;
  max-width: 90vw;
  border-radius: 18px;
}

.actions {
  padding: 0 20px 20px;
  gap: 8px;
}
</style>
