'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Note, NoteHistory } from '@/lib/types';
import { Separator } from './ui/separator';

interface NoteVersionHistoryProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  note: Note;
  onRevert: (noteId: string, version: NoteHistory) => void;
}

export function NoteVersionHistory({ isOpen, onOpenChange, note, onRevert }: NoteVersionHistoryProps) {
  const [selectedVersion, setSelectedVersion] = useState<NoteHistory | null>(null);

  const versions = [...(note.history || [])];

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-full w-full p-0">
        <div className="flex h-full">
          <div className="w-1/3 border-r">
            <SheetHeader className="p-4 border-b">
              <SheetTitle>Version History</SheetTitle>
              <SheetDescription>For "{note.title}"</SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-[calc(100%-80px)]">
              <div className="p-4 space-y-2">
                {versions.map((version, index) => (
                  <Button
                    key={index}
                    variant={selectedVersion === version ? 'secondary' : 'ghost'}
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() => setSelectedVersion(version)}
                  >
                    <div>
                      <p className="font-semibold">Version from</p>
                      <p className="text-sm text-muted-foreground">{format(new Date(version.updatedAt), "PPP p")}</p>
                    </div>
                  </Button>
                ))}
                {versions.length === 0 && <p className="text-sm text-muted-foreground p-4 text-center">No history available.</p>}
              </div>
            </ScrollArea>
          </div>
          <div className="w-2/3 flex flex-col">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Version Preview</h3>
              {selectedVersion && (
                <p className="text-sm text-muted-foreground">
                  Showing content from {format(new Date(selectedVersion.updatedAt), "PPP p")}
                </p>
              )}
            </div>
            <ScrollArea className="flex-grow">
              <div className="p-6 whitespace-pre-wrap">
                {selectedVersion ? (
                    <p>{selectedVersion.content}</p>
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p>Select a version to preview its content.</p>
                    </div>
                )}
              </div>
            </ScrollArea>
            <SheetFooter className="p-4 border-t bg-background">
                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button 
                    disabled={!selectedVersion} 
                    onClick={() => selectedVersion && onRevert(note.id, selectedVersion)}
                >
                    Revert to this version
                </Button>
            </SheetFooter>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
