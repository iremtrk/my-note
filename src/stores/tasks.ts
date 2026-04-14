import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "axios";
import type { Task } from "@/types/tasks";

export type TaskSortOrder = "newest" | "oldest" | "dueDate" | "priority";

export const useTasksStore = defineStore("tasks", () => {
  const tasks = ref<Task[]>([]);
  const selectedTask = ref<Task | null>(null);
  const searchQuery = ref("");
  const sortOrder = ref<TaskSortOrder>("newest");

  const API_URL = "http://localhost:3001/tasks";

  const fetchTasks = async (userId?: string | number) => {
    if (!userId) {
      tasks.value = [];
      return;
    }

    const response = await axios.get(`${API_URL}?userId=${userId}`);
    tasks.value = response.data;

    if (selectedTask.value) {
      const updated = tasks.value.find((t) => t.id === selectedTask.value?.id);
      selectedTask.value = updated || null;
    }
  };

  const selectTask = (task: Task) => {
    selectedTask.value = task;
  };

  const addTask = async (payload: Omit<Task, "id">) => {
    const response = await axios.post(API_URL, payload);
    tasks.value.push(response.data);
    selectedTask.value = response.data;
  };

  const updateTask = async (
    id: number,
    payload: Partial<Omit<Task, "id" | "userId" | "createdAt">>,
  ) => {
    const current = tasks.value.find((t) => t.id === id);
    if (!current) return;

    const response = await axios.patch(`${API_URL}/${id}`, {
      ...current,
      ...payload,
    });

    const index = tasks.value.findIndex((t) => t.id === id);
    if (index !== -1) tasks.value[index] = response.data;

    if (selectedTask.value?.id === id) selectedTask.value = response.data;
  };

  const deleteTask = async (id: number) => {
    await axios.delete(`${API_URL}/${id}`);
    tasks.value = tasks.value.filter((t) => t.id !== id);

    if (selectedTask.value?.id === id) {
      selectedTask.value = null;
    }
  };

  const toggleStar = async (id: number) => {
    const task = tasks.value.find((t) => t.id === id);
    if (!task) return;

    await updateTask(id, { starred: !task.starred });
  };

  const toggleComplete = async (id: number) => {
    const task = tasks.value.find((t) => t.id === id);
    if (!task) return;

    await updateTask(id, { completed: !task.completed });
  };

  const clearTasks = () => {
    tasks.value = [];
    selectedTask.value = null;
  };

  const clearSelectedTask = () => {
    selectedTask.value = null;
  };

  const priorityWeight: Record<Task["priority"], number> = {
    high: 0,
    medium: 1,
    low: 2,
  };

  const sortedTasks = computed(() => {
    return [...tasks.value].sort((a, b) => {
      if (a.starred && !b.starred) return -1;
      if (!a.starred && b.starred) return 1;

      if (sortOrder.value === "priority") {
        return priorityWeight[a.priority] - priorityWeight[b.priority];
      }

      if (sortOrder.value === "dueDate") {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;

        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }

      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();

      return sortOrder.value === "newest" ? dateB - dateA : dateA - dateB;
    });
  });

  const filteredTasks = computed(() => {
    const query = searchQuery.value.trim().toLowerCase();

    if (!query) return sortedTasks.value;

    return sortedTasks.value.filter((task) => {
      const title = task.title.toLowerCase();
      const content = task.content.toLowerCase();
      const priority = task.priority.toLowerCase();
      const dueDate = task.dueDate?.toLowerCase() ?? "";

      return (
        title.includes(query) ||
        content.includes(query) ||
        priority.includes(query) ||
        dueDate.includes(query)
      );
    });
  });

  return {
    tasks,
    selectedTask,
    searchQuery,
    sortOrder,
    sortedTasks,
    filteredTasks,
    fetchTasks,
    selectTask,
    addTask,
    updateTask,
    deleteTask,
    toggleStar,
    toggleComplete,
    clearTasks,
    clearSelectedTask,
  };
});
