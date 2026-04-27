import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "axios";
import type { CalendarEvent } from "@/types/events";
import { useLoadingStore } from "./loading";

export interface DateRange {
  from: string
  to: string
}

export const useEventsStore = defineStore("events", () => {
  const events = ref<CalendarEvent[]>([]);
  const selectedEvent = ref<CalendarEvent | null>(null);
  const selectedDate = ref("");
  const selectedRanges = ref<DateRange[]>([]);
  const hasFetched = ref(false);

  const loading = useLoadingStore();
  const API_URL = "http://localhost:5000/api/events";

  const fetchEvents = async (userId?: string | number) => {
    if (!userId) {
      events.value = [];
      hasFetched.value = true;
      return;
    }



    await loading.wrap("events", async () => {
      const response = await axios.get(`${API_URL}?userId=${userId}`);
      events.value = response.data;
    });

    if (selectedEvent.value) {
      const updatedEvent = events.value.find(
        (event) => event.id === selectedEvent.value?.id,
      );
      selectedEvent.value = updatedEvent || null;
    }

    hasFetched.value = true;
  };


  const selectEvent = (event: CalendarEvent) => {
    selectedEvent.value = event;
  };

  const setSelectedDate = (date: string) => {
    selectedDate.value = date;
  };

  const setSelectedRanges = (ranges: DateRange[]) => {
    selectedRanges.value = ranges;
  };

  const addEvent = async (payload: Omit<CalendarEvent, "id">) => {
    await loading.wrap("events:add", async () => {
      const response = await axios.post(API_URL, payload);
      events.value.push(response.data);
      selectedEvent.value = response.data;
    });
  };

  const updateEvent = async (
    id: number,
    payload: Partial<Omit<CalendarEvent, "id" | "userId" | "createdAt">>,
  ) => {
    const currentEvent = events.value.find((event) => event.id === id);
    if (!currentEvent) return;

    const response = await axios.patch(`${API_URL}/${id}`, {
      ...currentEvent,
      ...payload,
    });

    const index = events.value.findIndex((event) => event.id === id);
    if (index !== -1) {
      events.value[index] = response.data;
    }

    if (selectedEvent.value?.id === id) {
      selectedEvent.value = response.data;
    }
  };

  const deleteEvent = async (id: number) => {
    await axios.delete(`${API_URL}/${id}`);
    events.value = events.value.filter((event) => event.id !== id);

    if (selectedEvent.value?.id === id) {
      selectedEvent.value = null;
    }
  };

  const clearEvents = () => {
    events.value = [];
    selectedEvent.value = null;
    selectedDate.value = "";
    selectedRanges.value = [];
    hasFetched.value = false;
  };

  const clearSelectedEvent = () => {
    selectedEvent.value = null;
  };

  const sortEvents = (list: CalendarEvent[]) => {
    return [...list].sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }

      if (!a.time && !b.time) return 0;
      if (!a.time) return 1;
      if (!b.time) return -1;

      return a.time.localeCompare(b.time);
    });
  };

  const eventsOfSelectedDate = computed(() => {
    if (!selectedDate.value) return [];

    return sortEvents(
      events.value.filter((event) => event.date === selectedDate.value),
    );
  });

  const eventsOfSelectedRanges = computed(() => {
    if (selectedRanges.value.length === 0) return [];

    return sortEvents(
      events.value.filter((event) =>
        selectedRanges.value.some(
          (range) => event.date >= range.from && event.date <= range.to,
        ),
      ),
    );
  });

  const groupedEventsOfSelectedRanges = computed(() => {
    const groups: Record<string, CalendarEvent[]> = {};

    for (const event of eventsOfSelectedRanges.value) {
      if (!groups[event.date]) {
        groups[event.date] = [];
      }
      groups[event.date].push(event);
    }

    return groups;
  });

  const eventDates = computed(() => {
    return [...new Set(events.value.map((event) => event.date))];
  });

  return {
    events,
    selectedEvent,
    selectedDate,
    selectedRanges,
    hasFetched,
    eventsOfSelectedDate,
    eventsOfSelectedRanges,
    groupedEventsOfSelectedRanges,
    eventDates,
    fetchEvents,
    selectEvent,
    setSelectedDate,
    setSelectedRanges,
    addEvent,
    updateEvent,
    deleteEvent,
    clearEvents,
    clearSelectedEvent,
  };
});