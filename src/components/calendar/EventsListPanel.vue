<template>
  <div class="right-panel q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h6">Events</div>

        <div class="text-caption text-grey-6">
          <template v-if="selectionMode === 'day'">
            {{ selectedDate || "Tarih seçilmedi" }}
          </template>

          <template v-else>
            {{
              selectedRanges.length > 0
                ? `${selectedRanges.length} aralık seçildi`
                : "Aralık seçilmedi"
            }}
          </template>
        </div>
      </div>

      <q-btn
        color="primary"
        icon="add"
        label="Add Event"
        @click="emit('add-event')"
      />
    </div>

    <div
      v-if="
        hasFetched &&
        selectionMode === 'day' &&
        eventsOfSelectedDate.length === 0
      "
      class="empty-state"
    >
      Bu tarih için event bulunmuyor.
    </div>

    <div
      v-else-if="
        hasFetched &&
        selectionMode === 'ranges' &&
        eventsOfSelectedRanges.length === 0
      "
      class="empty-state"
    >
      Seçilen aralıklar için event bulunmuyor.
    </div>

    <q-list
      v-else-if="selectionMode === 'day'"
      bordered
      separator
      class="event-list"
    >
      <EventListItem
        v-for="event in eventsOfSelectedDate"
        :key="event.id"
        :event="event"
        @select="emit('select-event', $event)"
        @edit="emit('edit-event', $event)"
        @delete="emit('delete-event', $event)"
      />
    </q-list>

    <div v-else class="range-groups">
      <div
        v-for="(items, date) in groupedEvents"
        :key="date"
        class="q-mb-md"
      >
        <div class="text-subtitle2 q-mb-sm">{{ date }}</div>

        <q-list bordered separator class="event-list">
          <EventListItem
            v-for="event in items"
            :key="event.id"
            :event="event"
            @select="emit('select-event', $event)"
            @edit="emit('edit-event', $event)"
            @delete="emit('delete-event', $event)"
          />
        </q-list>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CalendarEvent } from "@/types/events";
import type { DateRange } from "@/stores/events";
import EventListItem from "./EventListItem.vue";

defineProps<{
  selectionMode: "day" | "ranges";
  selectedDate: string;
  selectedRanges: DateRange[];
  hasFetched: boolean;
  eventsOfSelectedDate: CalendarEvent[];
  eventsOfSelectedRanges: CalendarEvent[];
  groupedEvents: Record<string, CalendarEvent[]>;
}>();

const emit = defineEmits<{
  (e: "select-event", event: CalendarEvent): void;
  (e: "edit-event", event: CalendarEvent): void;
  (e: "delete-event", id: number): void;
  (e: "add-event"): void;
}>();
</script>

<style scoped>
.right-panel {
  height: 100%;
  overflow-y: auto;
}

.event-list {
  border-radius: 12px;
}

.empty-state {
  padding: 24px;
  border: 1px dashed #cfcfcf;
  border-radius: 12px;
  color: #777;
}

.range-groups {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>