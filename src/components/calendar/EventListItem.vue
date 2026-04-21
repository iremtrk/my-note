<template>
  <q-item clickable @click="emit('select', event)">
    <q-item-section avatar>
      <q-icon
        :name="event.type === 'birthday' ? 'cake' : 'event'"
        color="primary"
      />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ event.title }}</q-item-label>
      <q-item-label caption>
        {{ event.time || "Saat belirtilmedi" }}
      </q-item-label>
      <q-item-label caption v-if="event.description">
        {{ event.description }}
      </q-item-label>
    </q-item-section>

    <q-item-section side class="row items-center no-wrap">
      <q-btn
        flat
        round
        dense
        icon="edit"
        color="grey-7"
        @click.stop="emit('edit', event)"
      />
      <q-btn
        flat
        round
        dense
        icon="delete"
        color="negative"
        @click.stop="emit('delete', event.id)"
      />
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import type { CalendarEvent } from "@/types/events";

defineProps<{
  event: CalendarEvent;
}>();

const emit = defineEmits<{
  (e: "select", event: CalendarEvent): void;
  (e: "edit", event: CalendarEvent): void;
  (e: "delete", id: number): void;
}>();
</script>