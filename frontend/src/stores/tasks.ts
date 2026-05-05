import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/lib/axios"
import type { Task } from "@/types/tasks";
import { useLoadingStore } from "./loading";

export type TaskSortOrder = "newest" | "oldest" | "dueDate" | "priority";

export const useTasksStore = defineStore("tasks", () => {
  const tasks = ref<Task[]>([]);
  const selectedTask = ref<Task | null>(null);
  const searchQuery = ref("");
  const sortOrder = ref<TaskSortOrder>("newest");
  const hasFetched = ref(false);
  const loading = useLoadingStore();

  const API_URL = "/tasks";

  const fetchTasks = async () => {
    await loading.wrap("tasks", async () => {
      const response = await api.get(API_URL);
      tasks.value = response.data;
    });

    if (selectedTask.value) {
      const updatedTask = tasks.value.find(
        (task) => task.id === selectedTask.value?.id,
      );
      selectedTask.value = updatedTask || null;
    }

    hasFetched.value = true;
  };

  const selectTask = (task: Task) => {
    selectedTask.value = task;
  };

  const addTask = async (payload: Pick<Task, "title" | "content" | "priority" | "dueDate" | "starred" | "completed">) => {
    await loading.wrap("tasks:add", async () => {
      const response = await api.post(API_URL, payload);
      tasks.value.push(response.data);
      selectedTask.value = response.data;
    });
  };

  const updateTask = async (
    id: number,
    payload: Partial<Omit<Task, "id" | "userId" | "createdAt">>,
  ) => {
    const currentTask = tasks.value.find((task) => task.id === id);
    if (!currentTask) return;

    const response = await api.patch(`${API_URL}/${id}`, {
      ...currentTask,
      ...payload,
    });

    const index = tasks.value.findIndex((task) => task.id === id);
    if (index !== -1) tasks.value[index] = response.data;

    if (selectedTask.value?.id === id) {
      selectedTask.value = response.data;
    }
  };

  const deleteTask = async (id: number) => {
    await api.delete(`${API_URL}/${id}`);
    tasks.value = tasks.value.filter((task) => task.id !== id);

    if (selectedTask.value?.id === id) {
      selectedTask.value = null;
    }
  };

  const toggleStar = async (id: number) => {
    const task = tasks.value.find((item) => item.id === id);
    if (!task) return;

    await updateTask(id, { starred: !task.starred });
  };

  const toggleComplete = async (id: number) => {
    const task = tasks.value.find((item) => item.id === id);
    if (!task) return;

    await updateTask(id, { completed: !task.completed });
  };

  const clearSearch = ()=>{
    searchQuery.value=""
  }

  const clearTasks = () => {
    tasks.value = [];
    selectedTask.value = null;
    hasFetched.value = false;
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
    hasFetched,
    sortedTasks,
    filteredTasks,
    fetchTasks,
    selectTask,
    addTask,
    updateTask,
    deleteTask,
    toggleStar,
    toggleComplete,
    clearSearch,
    clearTasks,
    clearSelectedTask,
  };
});