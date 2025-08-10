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

export type EditorTheme = 'light' | 'dark' | 'sepia';
export type EditorFont = 'serif' | 'sans' | 'mono';
export type EditorDirection = 'ltr' | 'rtl';

export type NoteSettings = {
  theme: EditorTheme;
  font: EditorFont;
  fontSize: number;
  direction: EditorDirection;
};
