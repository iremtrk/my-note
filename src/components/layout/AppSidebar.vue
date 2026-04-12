<template>
  <div class="sidebar-container">
    <q-list bordered padding>
      <q-item>
        <q-input
          v-model="notesStore.searchQuery"
          outlined
          dense
          placeholder="Search notes..."
          class="full-width"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </q-item>

      <q-item>
        <AddNoteButton
          label="New Note"
          icon="add"
          color="primary"
          button-class="full-width"
        />
      </q-item>

      <q-item
        clickable
        to="/app/home"
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
        to="/app/notes"
        tag="router-link"
        active-class="text-primary"
      >
        <q-item-section avatar>
          <q-icon name="note" />
        </q-item-section>
        <q-item-section>Notes</q-item-section>
      </q-item>

      <q-item
        clickable
        to="/app/tasks"
        tag="router-link"
        active-class="text-primary"
      >
        <q-item-section avatar>
          <q-icon name="task" />
        </q-item-section>
        <q-item-section>Tasks</q-item-section>
      </q-item>
    </q-list>

<div class="logout-section">
  <q-separator class="q-my-sm" />

<q-item class="row items-center justify-between">

  <div class="row items-center q-gutter-sm">
    <q-avatar size="32px" color="primary" text-color="white">
      {{ authStore.user?.name?.charAt(0).toUpperCase() }}
    </q-avatar>

    <span class="text-weight-medium">
      Welcome, {{ authStore.user?.name }}
    </span>
  </div>

  <q-icon
    name="logout"
    size="20px"
    class="cursor-pointer text-grey"
    @click="handleLogout"
  />

</q-item>
</div>
  </div>
</template>

<script setup lang="ts">
import AddNoteButton from '@/components/notes/AddNoteButton.vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotesStore } from '@/stores/notes'

const router = useRouter()
const authStore = useAuthStore()
const notesStore = useNotesStore()

const handleLogout = () => {
  authStore.logout()
  notesStore.searchQuery = ''
  router.push('/login')
}
</script>

<style scoped>
.sidebar-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.q-item {
  color: grey;
}

.logout-section {
  margin-top: auto;
}
</style>