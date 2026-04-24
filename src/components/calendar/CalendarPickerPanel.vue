<template>
  <div class="left-panel q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">{{ t("calendarPicker.title") }}</div>
      <q-btn
        flat
        :no-caps="true"
        :ripple="false"
        class="mode-toggle-btn"
        @click="
          emit(
            'update:selectionMode',
            props.selectionMode === 'day' ? 'ranges' : 'day',
          )
        "
      >
        <q-btn class="q-mt-sm" style="font-size: small;">
          <span v-if="props.selectionMode==='day'"> {{ t('calendarPicker.badgeDay') }}</span>
          <span v-else> {{ t('calendarPicker.badgeRange') }}</span>
        </q-btn>
      </q-btn>
    </div>

    <q-date
      v-if="selectionMode === 'day'"
      :model-value="selectedDate"
      mask="YYYY-MM-DD"
      color="primary"
      today-btn
      :events="eventDates"
      event-color="purple"
      class="calendar-widget"
      @update:model-value="emit('pick-day', $event)"
      @dblclick="emit('double-pick')"
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
import { onMounted, onBeforeUnmount } from "vue";
import type { DateRange } from "@/stores/events";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps<{
  selectionMode: "day" | "ranges" | "all";
  selectedDate: string;
  rangeModel: DateRange[];
  eventDates: string[];
}>();

const emit = defineEmits<{
  (e: "update:selectionMode", value: "day" | "ranges"): void;
  (e: "pick-day", value: string | null): void;
  (e: "double-pick"): void;
  (e: "pick-ranges", value: DateRange[] | null): void;
}>();

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Shift" && !e.repeat) {
    emit(
      "update:selectionMode",
      props.selectionMode === "day" ? "ranges" : "day",
    );
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeyDown);
});
</script>

<style scoped>
.calendar-widget {
  width: 100%;
}

:deep(.mode-toggle-btn .q-focus-helper) {
  display: none !important;
}
</style>
