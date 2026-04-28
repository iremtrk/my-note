export interface CalendarEvent {
  id: number
  userId: number
  title: string
  description: string
  date: string
  time?: string
  type: "event" | "birthday"
  createdAt: string
  notified: boolean
}