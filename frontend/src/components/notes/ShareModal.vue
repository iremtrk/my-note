<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <q-card class="share-modal">
      <q-card-section class="row items-center justify-between">
        <div class="text-h6">Share Note</div>
        <q-btn icon="close" flat round @click="closeModal" />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-gutter-md">
        <q-input
          v-model="email"
          label="User email"
          outlined
          type="email"
        />

        <q-select
          v-model="permission"
          label="Permission"
          outlined
          :options="permissionOptions"
          emit-value
          map-options
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" @click="closeModal" />
        <q-btn
          color="primary"
          label="Share"
          :disable="!email.trim()"
          @click="handleShare"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (
    e: "share",
    payload: {
      email: string;
      permission: "read" | "edit";
    },
  ): void;
}>();

const email = ref("");
const permission = ref<"read" | "edit">("read");

const permissionOptions = [
  { label: "Read", value: "read" },
  { label: "Edit", value: "edit" },
];

const handleShare = () => {
  if (!email.value.trim()) return;

  emit("share", {
    email: email.value.trim(),
    permission: permission.value,
  });
};

const closeModal = () => {
  emit("update:modelValue", false);

  // reset
  email.value = "";
  permission.value = "read";
};
</script>

<style scoped>
.share-modal {
  width: 420px;
  max-width: 90vw;
}
</style>