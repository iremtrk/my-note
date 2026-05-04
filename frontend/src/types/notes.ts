export interface NotePdf {
  id: string;
  name: string;
  url: string;
  type?:string
}

export interface NoteShareUser {
  id: number;
  name?: string;
  email: string;
}

export interface NoteShare {
  id: number;
  noteId: number;
  userId: number;
  permission: "read" | "edit";
  user?: NoteShareUser;
}

export interface Note {
  userId: number;
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  starred: boolean;
  pdfs?: NotePdf[];
  isOwner?: boolean;
  permission?: "owner" | "read" | "edit";
  shares?: NoteShare[];
  user?: NoteShareUser;
  isLocked: boolean
}
