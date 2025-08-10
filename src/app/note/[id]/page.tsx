'use client';

import React, { useState, useEffect, useTransition, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { INITIAL_NOTES } from '@/lib/data';
import type { Note } from '@/lib/types';
import { NoteEditor } from '@/components/note-editor';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  }, [noteId]);

  // Function to save notes to localStorage and update the noteStore
  const saveNotes = (updatedNotes: Note[]) => {
    try {
      noteStore = updatedNotes;
      localStorage.setItem('notes', JSON.stringify(updatedNotes));
    } catch (error) {
      console.error("Failed to save notes to localStorage", error);
    }
  };

  const handleUpdateNote = (updatedFields: Partial<Note>) => {
    if (!note) return;

    const updatedNote: Note = {
        ...note,
        ...updatedFields,
        updatedAt: new Date().toISOString(),
    };
    
    // Create history entry only if content changes
    if (updatedFields.content && lastSavedVersion && lastSavedVersion.content !== updatedFields.content) {
        const newHistoryEntry = {
            content: lastSavedVersion.content,
            updatedAt: lastSavedVersion.updatedAt,
        };
        updatedNote.history = [newHistoryEntry, ...(note.history || [])];
    }
    
    setNote(updatedNote);
    setLastSavedVersion(updatedNote); // Keep track of the last version that was saved
    
    startSavingTransition(() => {
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

  if (!note) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Note not found or is loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
       <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center space-x-4">
                <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
                    <ArrowLeft />
                    <span className="sr-only">Back</span>
                </Button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold truncate">{note.title}</h1>
                </div>
                 <div className="flex items-center gap-2">
                    {isSaving && <p className="text-sm text-muted-foreground">Saving...</p>}
                    <p className="text-sm text-muted-foreground">
                        Last saved:{' '}
                        {new Date(note.updatedAt).toLocaleTimeString()}
                    </p>
                </div>
            </div>
        </header>
      <main className="flex-1 overflow-y-auto">
        <NoteEditor
          note={note}
          onUpdate={handleUpdateNote}
          onDelete={handleDeleteNote}
        />
      </main>
    </div>
  );
}
