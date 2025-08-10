'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { INITIAL_NOTES } from '@/lib/data';
import type { Note } from '@/lib/types';
import { NoteEditor } from '@/components/note-editor';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// A simple in-memory store for notes
let noteStore: Note[] = [...INITIAL_NOTES];

export default function NotePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const noteId = params.id as string;

  const [note, setNote] = useState<Note | null>(null);
  const [isSaving, startSavingTransition] = useTransition();
  const [lastSavedVersion, setLastSavedVersion] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load notes from localStorage on initial render if it exists, otherwise use INITIAL_NOTES
  useEffect(() => {
    try {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        noteStore = JSON.parse(storedNotes);
      }
    } catch (error) {
      console.error("Failed to parse notes from localStorage", error);
    }
    const currentNote = noteStore.find((n) => n.id === noteId) || null;
    setNote(currentNote);
    setLastSavedVersion(currentNote);
    setIsLoading(false);
  }, [noteId]);

  // Function to save notes to localStorage and update the noteStore
  const saveNotes = (updatedNotes: Note[]) => {
    try {
      noteStore = updatedNotes;
      localStorage.setItem('notes', JSON.stringify(updatedNotes));
    } catch (error)
      {
      console.error("Failed to save notes to localStorage", error);
    }
  };

  const handleUpdateNote = (updatedFields: Partial<Note>) => {
    if (!note || note.id === 'note-1') return;
  
    const updatedNote = { ...note, ...updatedFields };
  
    // Debounce saving
    startSavingTransition(() => {
      const isContentChanged = updatedFields.content && lastSavedVersion && lastSavedVersion.content !== updatedFields.content;
      if (isContentChanged) {
        const newHistoryEntry = {
          content: lastSavedVersion.content,
          updatedAt: lastSavedVersion.updatedAt,
        };
        updatedNote.history = [newHistoryEntry, ...(note.history || [])];
      }
  
      updatedNote.updatedAt = new Date().toISOString();
  
      setNote(updatedNote);
      setLastSavedVersion(updatedNote); 
  
      const newNotes = noteStore.map((n) => (n.id === noteId ? updatedNote : n));
      saveNotes(newNotes);
    });
  };

  const handleDeleteNote = (id: string) => {
    const newNotes = noteStore.filter((n) => n.id !== id);
    saveNotes(newNotes);
    toast({ title: 'Note Deleted', description: 'Returning to the note list.' });
    router.push('/');
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="mb-4">Note not found.</p>
        <Button onClick={() => router.push('/')} variant="outline">
          <ArrowLeft className="mr-2" />
          Back to Notes
        </Button>
      </div>
    );
  }

  const isWelcomeNote = note.id === 'note-1';

  return (
    <NoteEditor
      note={note}
      onUpdate={handleUpdateNote}
      onDelete={handleDeleteNote}
      isSaving={isSaving}
      readOnly={isWelcomeNote}
      onBack={() => router.push('/')}
    />
  );
}
