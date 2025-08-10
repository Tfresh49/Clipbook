export type NoteHistory = {
  content: string;
  updatedAt: string;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  history?: NoteHistory[];
};
