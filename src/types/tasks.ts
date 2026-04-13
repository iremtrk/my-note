export interface Task {
  id: string
  userId: string
  title: string
  content: string
  createdAt: string
  dueDate: string | null
  priority: 'low' | 'medium' | 'high'
  starred: boolean
  completed: boolean
}