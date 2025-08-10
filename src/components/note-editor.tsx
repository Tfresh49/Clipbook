'use client';

import type { Note } from '@/lib/types';
import React, { useState, useTransition, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Bot, Info, Loader2, Sparkles, Tag, X } from 'lucide-react';
import { summarizeNoteAction, suggestTagsAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface NoteEditorProps {
  note: Note;
  onUpdate: (updatedFields: Partial<Note>) => void;
  onDelete: (noteId: string) => void;
  readOnly?: boolean;
}

export function NoteEditor({ note, onUpdate, onDelete, readOnly = false }: NoteEditorProps) {
  const [isSummarizing, startSummarizeTransition] = useTransition();
  const [isSuggesting, startSuggestTransition] = useTransition();
  const [summary, setSummary] = useState('');
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const tagInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // When note changes, clear the AI-generated content
    setSummary('');
    setSuggestedTags([]);
  }, [note.id]);

  const handleSummarize = () => {
    startSummarizeTransition(async () => {
      try {
        const result = await summarizeNoteAction({ noteContent: note.content });
        setSummary(result.summary);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not summarize the note. Please try again.',
        });
      }
    });
  };

  const handleSuggestTags = () => {
    startSuggestTransition(async () => {
      try {
        const result = await suggestTagsAction({ noteContent: note.content });
        const newTags = result.map(t => t.tag).filter(t => !note.tags.includes(t));
        setSuggestedTags(newTags);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not suggest tags. Please try again.',
        });
      }
    });
  };
  
  const handleAddTag = (tag: string) => {
    const newTag = tag.trim();
    if (newTag && !note.tags.includes(newTag)) {
      onUpdate({ tags: [...note.tags, newTag] });
    }
    setTagInput('');
    setSuggestedTags(prev => prev.filter(t => t !== newTag));
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    onUpdate({ tags: note.tags.filter(tag => tag !== tagToRemove) });
  };
  
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-headline font-semibold">Editor</h2>
        </div>
        {!readOnly && (
          <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={handleSummarize}
                disabled={isSummarizing || !note.content}
              >
                {isSummarizing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Bot className="mr-2 h-4 w-4" />
                )}
                Summarize
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSuggestTags}
                disabled={isSuggesting || !note.content}
              >
                {isSuggesting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Suggest Tags
              </Button>
              <Button variant="destructive" size="sm" onClick={() => onDelete(note.id)}>Delete Note</Button>
          </div>
        )}
      </div>
      <div className="flex-grow p-6 overflow-y-auto">
        {readOnly && (
           <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertTitle>Read-Only Note</AlertTitle>
            <AlertDescription>
              This is the welcome note and serves as a tutorial. It cannot be edited or deleted.
            </AlertDescription>
          </Alert>
        )}
        <Input
          value={note.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Note Title"
          className="text-3xl font-bold font-headline border-0 shadow-none focus-visible:ring-0 px-0 h-auto mb-4 bg-transparent"
          readOnly={readOnly}
        />
        <Textarea
          value={note.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          placeholder="Start writing your note here..."
          className="flex-grow w-full resize-none border-0 shadow-none focus-visible:ring-0 p-0 text-base leading-relaxed bg-transparent min-h-[calc(100vh-300px)]"
          readOnly={readOnly}
        />
        <div className="mt-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Tags</h3>
          <div className="flex flex-wrap gap-2 items-center">
            {note.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-sm py-1 px-3">
                {tag}
                {!readOnly && (
                  <button onClick={() => handleRemoveTag(tag)} className="ml-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
            {!readOnly && (
              <div className="relative">
                <Input
                  ref={tagInputRef}
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Add a tag..."
                  className="h-8 pl-8"
                />
                 <Tag className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        {!readOnly && suggestedTags.length > 0 && (
          <div className="mt-4">
             <h3 className="text-sm font-medium text-muted-foreground mb-2">Suggestions</h3>
             <div className="flex flex-wrap gap-2">
                {suggestedTags.map(tag => (
                    <Button key={tag} size="sm" variant="outline" onClick={() => handleAddTag(tag)}>
                        + {tag}
                    </Button>
                ))}
             </div>
          </div>
        )}
      </div>

      <AlertDialog open={!!summary} onOpenChange={(open) => !open && setSummary('')}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Bot /> AI Summary
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left whitespace-pre-wrap">
              {summary}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setSummary('')}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
