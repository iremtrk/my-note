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

        <template v-if="props.mode === 'reset'">
          <q-input
            v-model="password"
            :label="t('pin.password')"
            outlined
            type="password"
            autofocus
          />

          <q-input
            v-model="newPin"
            :label="t('pin.newPin')"
            outlined
            type="password"
            @keyup.enter="handleSubmit"
          />
        </template>

        <template v-else>
          <q-input
            v-model="pin"
            label="PIN"
            outlined
            type="password"
            autofocus
            @keyup.enter="handleSubmit"
          />

          <q-btn
            v-if="props.mode === 'verify'"
            flat
            dense
            no-caps
            color="primary"
            :label="t('pin.forgotPin')"
            @click="changeToResetMode"
          />
        </template>
      </q-card-section>

      <q-card-actions align="right" class="actions">
        <q-btn flat :label="t('pin.cancel')" @click="closeModal" />

        <q-btn
          color="primary"
          :label="actionLabel"
          :disable="isSubmitDisabled || loading"
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
import { useI18n } from "vue-i18n";

const $q = useQuasar();
const notesStore = useNotesStore();
const { t } = useI18n();

const props = defineProps<{
  modelValue: boolean;
  mode: "lock" | "remove-lock" | "verify" | "reset";
  noteId: number | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "update:mode", value: "lock" | "remove-lock" | "verify" | "reset"): void;
  (e: "success"): void;
}>();

const pin = ref("");
const password = ref("");
const newPin = ref("");
const loading = ref(false);

const title = computed(() => {
  if (props.mode === "lock") return t("pin.lockTit");
  if (props.mode === "remove-lock") return t("pin.removeTit");
  if (props.mode === "reset") return t("pin.resetTit");
  return t("pin.unlockTit");
});

const description = computed(() => {
  if (props.mode === "lock") return t("pin.lockDesc");
  if (props.mode === "remove-lock") return t("pin.removeDesc");
  if (props.mode === "reset") return t("pin.resetDesc");
  return t("pin.unlockDesc");
});

const actionLabel = computed(() => {
  if (props.mode === "lock") return t("pin.lockAct");
  if (props.mode === "remove-lock") return t("pin.removeAct");
  if (props.mode === "reset") return t("pin.resetAct");
  return t("pin.unlockAct");
});

const isSubmitDisabled = computed(() => {
  if (props.mode === "reset") {
    return !password.value || newPin.value.length < 4;
  }

  return pin.value.length < 4;
});

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      pin.value = "";
      password.value = "";
      newPin.value = "";
      loading.value = false;
    }
  },
);

const changeToResetMode = () => {
  pin.value = "";
  password.value = "";
  newPin.value = "";
  emit("update:mode", "reset");
};

const handleSubmit = async () => {
  if (!props.noteId || loading.value || isSubmitDisabled.value) return;

  loading.value = true;

  try {
    if (props.mode === "lock") {
      await notesStore.lockNote(props.noteId, pin.value);
      $q.notify({ type: "positive", message: t("pin.lockSuccess") });
    } else if (props.mode === "remove-lock") {
      await notesStore.removeLock(props.noteId, pin.value);
      $q.notify({ type: "positive", message: t("pin.removeSuccess") });
    } else if (props.mode === "verify") {
      await notesStore.verifyPin(props.noteId, pin.value);
      $q.notify({ type: "positive", message: t("pin.unlockSuccess") });
    } else if (props.mode === "reset") {
      await notesStore.resetPin(props.noteId, password.value, newPin.value);
      $q.notify({ type: "positive", message: t("pin.resetSuccess") });
    }

    emit("success");
    closeModal();
  } catch (err: any) {
    $q.notify({
      type: "negative",
      message: err.message || t("pin.actionFailed"),
    });
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