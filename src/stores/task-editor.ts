import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Task } from '@/types/tasks'

export const useTaskEditorStore = defineStore('taskEditor', () => {
  const showAddModal = ref(false)
  const showSideEditor = ref(false)

  const editingTaskId = ref<number | null>(null)
  const title = ref('')
  const content = ref('')
  const dueDate = ref<string | null>(null)
  const priority = ref<Task['priority']>('low')

  const openAddModal = () => {
    showSideEditor.value = false
    showAddModal.value = true
    editingTaskId.value = null
    title.value = ''
    content.value = ''
    dueDate.value = null
    priority.value = 'low'
  }

  const openSideEditor = (task: Task) => {
    showAddModal.value = false
    showSideEditor.value = true
    editingTaskId.value = task.id
    title.value = task.title
    content.value = task.content
    dueDate.value = task.dueDate
    priority.value = task.priority
  }

  const closeAddModal = () => {
    showAddModal.value = false
    editingTaskId.value = null
    title.value = ''
    content.value = ''
    dueDate.value = null
    priority.value = 'low'
  }

  const closeSideEditor = () => {
    showSideEditor.value = false
    editingTaskId.value = null
    title.value = ''
    content.value = ''
    dueDate.value = null
    priority.value = 'low'
  }

  const closeAll = () => {
    showAddModal.value = false
    showSideEditor.value = false
    editingTaskId.value = null
    title.value = ''
    content.value = ''
    dueDate.value = null
    priority.value = 'low'
  }

  return {
    showAddModal,
    showSideEditor,
    editingTaskId,
    title,
    content,
    dueDate,
    priority,
    openAddModal,
    openSideEditor,
    closeAddModal,
    closeSideEditor,
    closeAll,
  }
})