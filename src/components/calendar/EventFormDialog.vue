<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <q-card class="event-dialog">
      <q-card-section class="row items-center justify-between">
        <div class="text-h6">
          {{ editingEventId === null ? "Add Event" : "Edit Event" }}
        </div>
        <q-btn flat round icon="close" @click="emit('update:modelValue', false)" />
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <q-input
          :model-value="form.title"
          label="Title"
          outlined
          @update:model-value="updateField('title', String($event ?? ''))"
        />

        <q-input
          :model-value="form.description"
          label="Description"
          type="textarea"
          autogrow
          outlined
          @update:model-value="updateField('description', String($event ?? ''))"
        />

        <q-input :model-value="form.date" label="Date" outlined readonly />

        <q-input
          :model-value="form.time"
          label="Time"
          type="time"
          outlined
          @update:model-value="updateField('time', String($event ?? ''))"
        />

        <q-select
          :model-value="form.type"
          :options="typeOptions"
          label="Type"
          outlined
          emit-value
          map-options
          @update:model-value="updateField('type', $event)"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          color="primary"
          :label="editingEventId === null ? 'Save' : 'Update'"
          :disable="!form.title.trim()"
          @click="emit('submit')"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
type EventForm = {
  title: string;
  description: string;
  date: string;
  time: string;
  type: "event" | "birthday";
};

const props = defineProps<{
  modelValue: boolean;
  editingEventId: number | null;
  form: EventForm;
  typeOptions: { label: string; value: "event" | "birthday" }[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "update:form", value: EventForm): void;
  (e: "submit"): void;
}>();

const updateField = <K extends keyof EventForm>(
  field: K,
  value: EventForm[K],
) => {
  emit("update:form", {
    ...props.form,
    [field]: value,
  });
};
</script>

<style scoped>
.event-dialog {
  min-width: 420px;
  max-width: 520px;
  width: 100%;
}
</style>
