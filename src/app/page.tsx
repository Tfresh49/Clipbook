'use client';

import React, { useState, useMemo } from 'react';
import {
  FilePlus2,
  BookText,
  ChevronRight,
  NotebookTabs,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { NoteEditor } from '@/components/note-editor';
import { INITIAL_NOTES } from '@/lib/data';
import type { Note } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(
    INITIAL_NOTES[0]?.id ?? null
  );

  const activeNote = useMemo(
    () => notes.find((note) => note.id === activeNoteId),
    [notes, activeNoteId]
  );
  
  const handleNewNote = () => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: 'Untitled Note',
      content: '',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
  };

  const handleUpdateNote = (updatedFields: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === activeNoteId
          ? { ...note, ...updatedFields, updatedAt: new Date().toISOString() }
          : note
      )
    );
  };
  
  const handleDeleteNote = (noteId: string) => {
    setNotes(prev => {
        const newNotes = prev.filter(note => note.id !== noteId);
        if (activeNoteId === noteId) {
            setActiveNoteId(newNotes[0]?.id ?? null);
        }
        return newNotes;
    });
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-between">
            <div className="p-2 flex items-center gap-2">
              <NotebookTabs className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-headline font-bold">ClipBook</h1>
            </div>
            <Button
              variant="default"
              size="sm"
              className="h-8"
              onClick={handleNewNote}
            >
              <FilePlus2 className="mr-2" />
              New Note
            </Button>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {notes.map((note) => (
              <SidebarMenuItem key={note.id}>
                <SidebarMenuButton
                  onClick={() => setActiveNoteId(note.id)}
                  isActive={note.id === activeNoteId}
                  className="h-auto py-2 px-3 flex flex-col items-start"
                >
                  <div className="font-semibold text-base w-full truncate">
                    {note.title}
                  </div>
                  <div className="text-xs text-muted-foreground w-full mt-1">
                    {formatDistanceToNow(new Date(note.updatedAt), {
                      addSuffix: true,
                    })}
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <ThemeToggle />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        {activeNote ? (
          <NoteEditor note={activeNote} onUpdate={handleUpdateNote} onDelete={handleDeleteNote} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center bg-background p-8">
            <Card className="max-w-md">
                <CardContent className="p-10">
                    <BookText className="mx-auto h-16 w-16 text-muted-foreground" />
                    <h2 className="mt-6 text-2xl font-semibold font-headline">
                    No Note Selected
                    </h2>
                    <p className="mt-2 text-muted-foreground">
                    Select a note from the list on the left to view it, or create a
                    new note to get started.
                    </p>
                    <Button onClick={handleNewNote} className="mt-6">
                    <FilePlus2 className="mr-2" />
                    Create New Note
                    </Button>
                </CardContent>
            </Card>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
