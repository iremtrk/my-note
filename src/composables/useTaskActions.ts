import { onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTaskEditorStore } from '@/stores/task-editor'
import { useTasksStore } from '@/stores/tasks'
import type { Task } from '@/types/tasks'

export function useTaskActions() {
  const taskEditor = useTaskEditorStore()
  const tasksStore = useTasksStore()
  const authStore = useAuthStore()

  const handleSelectTask = (task: Task) => {
    tasksStore.selectTask(task)
    taskEditor.openSideEditor(task)
  }

  const handleAddTask = async (payload: {
    title: string
    content: string
    dueDate: string | null
    priority: Task['priority']
  }) => {
    const userId = authStore.user?.id
    if (!userId) return

    await tasksStore.addTask({
      ...payload,
      userId,
      createdAt: new Date().toISOString(),
      starred: false,
      completed: false,
    })

    taskEditor.closeAddModal()
  }

  const handleUpdateTask = async (payload: {
    title: string
    content: string
    dueDate: string | null
    priority: Task['priority']
  }) => {
    if (!taskEditor.editingTaskId) return
    await tasksStore.updateTask(taskEditor.editingTaskId, payload)

    const updated = tasksStore.tasks.find((t) => t.id === taskEditor.editingTaskId)
    if (updated) {
      taskEditor.openSideEditor(updated)
    }
  }

  const handleDeleteTask = async (id?: number) => {
    const targetId = id ?? taskEditor.editingTaskId
    if (!targetId) return

    await tasksStore.deleteTask(targetId)

    if (tasksStore.selectedTask?.id === targetId) tasksStore.clearSelectedTask()
    if (taskEditor.editingTaskId === targetId) taskEditor.closeSideEditor()
  }

  const setupLifecycle = () => {
    onMounted(async () => {
      taskEditor.closeAll()
      if (authStore.user?.id) {
        await tasksStore.fetchTasks(authStore.user.id)
      }
    })

    onBeforeUnmount(() => {
      taskEditor.closeAll()
    })
  }

  return {
    taskEditor,
    tasksStore,
    authStore,
    handleSelectTask,
    handleAddTask,
    handleUpdateTask,
    handleDeleteTask,
    setupLifecycle,
  }
}