<template>
  <div>
    <q-item clickable @click="emit('edit', event)">
      <q-item-section avatar>
        <q-icon
          :name="event.type === 'birthday' ? 'cake' : 'event'"
          color="primary"
        />
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ event.title }}</q-item-label>
        <q-item-label caption>
          {{ event.time }}
        </q-item-label>
        <q-item-label caption>
          {{ event.date }}
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
          size="sm"
          icon="close"
          @click.stop="showDeleteConfirm = true"
        />
      </q-item-section>
      
    </q-item>

     <ConfirmDelete
      v-model="showDeleteConfirm"
      :title="t('eventConfirm.title')"
      :message="t('eventConfirm.message')"
      @confirm="$emit('delete', event.id)"
    />

  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { CalendarEvent } from "@/types/events";
import ConfirmDelete from "@/common/ConfirmDelete.vue";
import { useI18n } from "vue-i18n";

const {t}=useI18n()

const showDeleteConfirm = ref(false);

defineProps<{
  event: CalendarEvent;
}>();

const emit = defineEmits<{
  (e: "select", event: CalendarEvent): void;
  (e: "edit", event: CalendarEvent): void;
  (e: "delete", id: number): void;
}>();
</script>
