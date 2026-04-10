<template>
  <div class="sidebar-container">
    <q-list bordered padding>
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
      <q-item clickable @click="handleLogout">
        <q-item-section avatar>
          <q-icon name="logout" />
        </q-item-section>
        <q-item-section>Logout</q-item-section>
      </q-item>
    </div>
  </div>
</template>

<script setup lang="ts">
import AddNoteButton from 'src/components/notes/AddNoteButton.vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
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