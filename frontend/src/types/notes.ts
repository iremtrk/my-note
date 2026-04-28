export interface NotePdf {
  id: string
  name: string
  url: string
}

export interface NoteShare{
  userId:string
  email:string
  permission:"read"|"edit"
}

export interface Note {
  userId: number
  id: number
  title: string
  content: string
  createdAt: string
  updatedAt: string
  starred: boolean
  pdfs?:NotePdf[]
  sharedWith:NoteShare[]
}