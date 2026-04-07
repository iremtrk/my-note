<template>
  <q-list bordered padding>
    <q-item>
      <AddNoteButton
      label="New Note"
      icon="add"
      unelevated
      color="primary"
      button-class="full-width"
    />
    </q-item>
    <q-item
      clickable
      to="/"
      tag="router-link"
      exact
      active-class="text-primary"
    >
      <q-item-section avatar>
        <q-icon name="home" />
      </q-item-section>
      <q-item-section>Home</q-item-section>
    </q-item>

    <q-item
      clickable
      to="/notes"
      tag="router-link"
      active-class="text-primary"
    >
      <q-item-section avatar>
        <q-icon name="note" />
      </q-item-section>
      <q-item-section>Notes</q-item-section>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import AddNoteButton from 'src/components/notes/AddNoteButton.vue'
</script>

<style scoped>
.q-item {
  color: grey;
}
</style>