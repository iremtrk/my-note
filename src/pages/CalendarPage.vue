<template>
  <q-page class="calendar-page q-pa-md">
    <q-splitter
      v-model="splitterModel"
      unit="%"
      style="height: calc(100vh - 90px)"
      class="calendar-splitter"
    >
      <template #before>
        <CalendarPickerPanel
          :selection-mode="selectionMode"
          :selected-date="eventsStore.selectedDate"
          :range-model="rangeModel"
          :event-dates="eventsStore.eventDates"
          @update:selectionMode="selectionMode = $event"
          @pick-day="handleSingleDatePick"
          @double-pick="handleDoubleClick"
          @pick-ranges="handleMultipleRangesPick"
        />
      </template>

      <template #after>
        <EventsListPanel
          :selection-mode="activeView"
          :selected-date="eventsStore.selectedDate"
          :selected-ranges="eventsStore.selectedRanges"
          :has-fetched="eventsStore.hasFetched"
          :events-of-selected-date="eventsStore.eventsOfSelectedDate"
          :events-of-selected-ranges="eventsStore.eventsOfSelectedRanges"
          :grouped-events="eventsStore.groupedEventsOfSelectedRanges"
          @select-event="eventsStore.selectEvent"
          @edit-event="openEditDialog"
          @delete-event="handleDelete"
          @add-event="openAddDialog"
        />
      </template>
    </q-splitter>

    <EventFormDialog
      v-model="showDialog"
      :editing-event-id="editingEventId"
      :form="form"
      :type-options="typeOptions"
      @update:form="form = $event"
      @submit="handleSubmit"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { useQuasar } from "quasar";
import { useAuthStore } from "@/stores/auth";
import { useEventsStore } from "@/stores/events";
import type { CalendarEvent } from "@/types/events";
import type { DateRange } from "@/stores/events";

import CalendarPickerPanel from "@/components/calendar/CalendarPickerPanel.vue";
import EventsListPanel from "@/components/calendar/EventsListPanel.vue";
import EventFormDialog from "@/components/calendar/EventFormDialog.vue";

const $q = useQuasar();
const authStore = useAuthStore();
const eventsStore = useEventsStore();

const splitterModel = ref(40);
const showDialog = ref(false);
const editingEventId = ref<number | null>(null);
const selectionMode = ref<"day" | "ranges">("day");
const activeView = ref<"day" | "ranges">("day");
const rangeModel = ref<DateRange[]>([]);

let notifyInterval: ReturnType<typeof setInterval> | null = null;

const form = ref({
  title: "",
  description: "",
  date: "",
  time: "",
  type: "event" as "event" | "birthday",
});

const typeOptions = [
  { label: "Event", value: "event" as const },
  { label: "Birthday", value: "birthday" as const },
];

const resetForm = () => {
  form.value = {
    title: "",
    description: "",
    date: eventsStore.selectedDate || "",
    time: "",
    type: "event",
  };

  editingEventId.value = null;
};

const openAddDialog = () => {
  resetForm();
  form.value.date = eventsStore.selectedDate || "";
  showDialog.value = true;
};

const openAddDialogForDate = (date: string) => {
  eventsStore.setSelectedDate(date);
  resetForm();
  form.value.date = date;
  showDialog.value = true;
};

const openEditDialog = (event: CalendarEvent) => {
  editingEventId.value = event.id;
  form.value = {
    title: event.title,
    description: event.description,
    date: event.date,
    time: event.time ?? "",
    type: event.type,
  };
  showDialog.value = true;
};

const handleSingleDatePick = (date: string | null) => {
  if (date) {
    eventsStore.setSelectedDate(date);
    activeView.value = "day";
  }
};

const handleDoubleClick = () => {
  if (eventsStore.selectedDate) {
    openAddDialogForDate(eventsStore.selectedDate);
  }
};

const handleMultipleRangesPick = (value: DateRange[] | null) => {
  rangeModel.value = value ?? [];
  eventsStore.setSelectedRanges(value ?? []);
  if (value && value.length > 0) {
    activeView.value = "ranges";
  } else {
    activeView.value = "day";
  }
};

const handleSubmit = async () => {
  if (!authStore.user?.id) return;



  if (editingEventId.value === null) {
    await eventsStore.addEvent({
      userId: authStore.user.id,
      title: form.value.title.trim(),
      description: form.value.description.trim(),
      date: form.value.date,
      time: form.value.time || undefined,
      type: form.value.type,
      createdAt: new Date().toISOString(),
      notified: false,
    });

    $q.notify({
      type: "positive",
      message: "Event eklendi.",
      position: "bottom-right",
    });
  } else {
    await eventsStore.updateEvent(editingEventId.value, {
      title: form.value.title.trim(),
      description: form.value.description.trim(),
      date: form.value.date,
      time: form.value.time || undefined,
      type: form.value.type,
      notified: false,
    });

    $q.notify({
      type: "positive",
      message: "Event güncellendi.",
      position: "bottom-right",
    });
  }

  showDialog.value = false;
  resetForm();
};

const handleDelete = async (id: number) => {
  await eventsStore.deleteEvent(id);

  $q.notify({
    type: "positive",
    message: "Event silindi.",
    position: "bottom-right",
  });
};

const checkUpcomingEvents = async () => {
  const now = new Date();

  for (const event of eventsStore.events) {
    if (!event.time || event.notified) continue;

    const eventDateTime = new Date(`${event.date}T${event.time}`);
    const diffMs = eventDateTime.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / 1000 / 60);

    if (diffMinutes >= 0 && diffMinutes <= 10) {
      $q.notify({
        type: "info",
        message: `${event.title} yaklaşıyor (${event.time})`,
        position: "bottom-right",
        timeout: 5000,
      });

      await eventsStore.updateEvent(event.id, {
        notified: true,
      });
    }
  }
};

watch(
  rangeModel,
  (value) => {
    if (selectionMode.value !== "ranges") return;
    eventsStore.setSelectedRanges(value ?? []);
  },
  { deep: true }
);

// selectionMode watcher removed; range data now persists.

onMounted(async () => {
  if (!authStore.user?.id) return;

  const today = new Date().toISOString().split("T")[0];
  eventsStore.setSelectedDate(today);

  await eventsStore.fetchEvents(authStore.user.id);

  notifyInterval = setInterval(() => {
    checkUpcomingEvents();
  }, 60000);

  checkUpcomingEvents();
});

onBeforeUnmount(() => {
  if (notifyInterval) {
    clearInterval(notifyInterval);
  }
});
</script>

<style scoped>
.calendar-page {
  height: 100%;
}

.calendar-splitter {
  background: transparent;
}
</style>