<template>
  <div class="left-panel q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">Calendar</div>

      <q-btn-toggle
        :model-value="selectionMode"
        unelevated
        toggle-color="primary"
        :options="[
          { label: 'Day', value: 'day' },
          { label: 'Ranges', value: 'ranges' }
        ]"
        @update:model-value="emit('update:selectionMode', $event)"
      />
    </div>

    <q-date
      v-if="selectionMode === 'day'"
      :model-value="selectedDate"
      mask="YYYY-MM-DD"
      color="primary"
      today-btn
      :events="eventDates"
      event-color="primary"
      class="calendar-widget"
      @update:model-value="emit('pick-day', $event)"
    />

    <q-date
      v-else
      :model-value="rangeModel"
      mask="YYYY-MM-DD"
      color="primary"
      today-btn
      range
      multiple
      :events="eventDates"
      event-color="primary"
      class="calendar-widget"
      @update:model-value="emit('pick-ranges', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type { DateRange } from "@/stores/events";

defineProps<{
  selectionMode: "day" | "ranges";
  selectedDate: string;
  rangeModel: DateRange[];
  eventDates: string[];
}>();

const emit = defineEmits<{
  (e: "update:selectionMode", value: "day" | "ranges"): void;
  (e: "pick-day", value: string): void;
  (e: "pick-ranges", value: DateRange[] | null): void;
}>();
</script>

<style scoped>
.left-panel {
  height: 100%;
  overflow-y: auto;
}

.calendar-widget {
  width: 100%;
}
</style>