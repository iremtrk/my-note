export interface NotePdf {
  id: string
  name: string
  content: string
}

export interface Note {
  userId: string
  id: number
  title: string
  content: string
  createdAt: string
  updatedAt: string
  starred: boolean
  pdfs?:NotePdf[]
}