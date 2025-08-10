'use client';

import type { Note, NoteSettings, EditorTheme, EditorFont, EditorDirection } from '@/lib/types';
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Info,
  Settings,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Palette,
  PaintBucket,
  Link,
  Code2,
  FileImage,
  ArrowLeft,
  Loader2,
  Trash2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface NoteEditorProps {
  note: Note;
  onUpdate: (updatedFields: Partial<Note>) => void;
  onDelete: (noteId: string) => void;
  isSaving: boolean;
  readOnly?: boolean;
  onBack: () => void;
}

const FONT_CLASSES: Record<EditorFont, string> = {
  serif: 'font-serif',
  sans: 'font-sans',
  mono: 'font-mono',
};

const THEME_CLASSES: Record<EditorTheme, string> = {
  light: 'bg-white text-gray-900',
  dark: 'bg-gray-800 text-gray-100',
  sepia: 'bg-[#fbf0d9] text-gray-800',
};

export function NoteEditor({ note, onUpdate, onDelete, isSaving, readOnly = false, onBack }: NoteEditorProps) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<NoteSettings>({
    theme: 'light',
    font: 'serif',
    fontSize: 16,
    direction: 'ltr',
  });
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // You would typically load/save these settings per-note or globally
  const handleSettingsChange = (newSettings: Partial<NoteSettings>) => {
    setSettings(prev => ({...prev, ...newSettings}));
  }

  const editorStyle: React.CSSProperties = {
    fontSize: `${settings.fontSize}px`,
    direction: settings.direction,
  };
  
  return (
    <div className={cn("flex flex-col h-screen bg-muted", FONT_CLASSES[settings.font])}>
       <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center space-x-2 sm:space-x-4">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <ArrowLeft />
                    <span className="sr-only">Back</span>
                </Button>
                <div className="flex-1">
                    <Input
                      value={note.title}
                      onChange={(e) => onUpdate({ title: e.target.value })}
                      placeholder="Note Title"
                      className="text-xl font-bold border-0 shadow-none focus-visible:ring-0 px-0 h-auto bg-transparent truncate"
                      readOnly={readOnly}
                    />
                </div>
                 <div className="flex items-center gap-2">
                    {isSaving && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground"/>}
                    <p className="text-sm text-muted-foreground hidden sm:block">
                        Last saved: {new Date(note.updatedAt).toLocaleTimeString()}
                    </p>
                    <Button variant="ghost" size="icon" onClick={() => setIsInfoModalOpen(true)}>
                      <Info className="h-5 w-5" />
                      <span className="sr-only">Note Info</span>
                    </Button>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon">
                                <Settings className="h-5 w-5" />
                                <span className="sr-only">Editor Settings</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                             <DropdownMenuLabel>Editor Settings</DropdownMenuLabel>
                             <DropdownMenuSeparator/>
                             <DropdownMenuLabel className="text-xs font-normal">Theme</DropdownMenuLabel>
                             <DropdownMenuRadioGroup value={settings.theme} onValueChange={(v) => handleSettingsChange({theme: v as EditorTheme})}>
                                <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="sepia">Sepia</DropdownMenuRadioItem>
                             </DropdownMenuRadioGroup>
                             <DropdownMenuSeparator/>
                              <DropdownMenuLabel className="text-xs font-normal">Font</DropdownMenuLabel>
                             <DropdownMenuRadioGroup value={settings.font} onValueChange={(v) => handleSettingsChange({font: v as EditorFont})}>
                                <DropdownMenuRadioItem value="serif">Serif</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="sans">Sans-serif</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="mono">Monospace</DropdownMenuRadioItem>
                             </DropdownMenuRadioGroup>
                              <DropdownMenuSeparator/>
                              <DropdownMenuLabel className="text-xs font-normal">Direction</DropdownMenuLabel>
                             <DropdownMenuRadioGroup value={settings.direction} onValueChange={(v) => handleSettingsChange({direction: v as EditorDirection})}>
                                <DropdownMenuRadioItem value="ltr">Left-to-Right</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="rtl">Right-to-Left</DropdownMenuRadioItem>
                             </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {!readOnly && (
                      <Button variant="destructive" size="icon" onClick={() => onDelete(note.id)}>
                        <Trash2 className="h-5 w-5" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    )}
                </div>
            </div>
             <div className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="container flex items-center h-12 space-x-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="sm">Heading</Button></DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem><Heading1 className="mr-2"/> Heading 1</DropdownMenuItem>
                      <DropdownMenuItem><Heading2 className="mr-2"/> Heading 2</DropdownMenuItem>
                      <DropdownMenuItem><Heading3 className="mr-2"/> Heading 3</DropdownMenuItem>
                      <DropdownMenuItem><Heading4 className="mr-2"/> Heading 4</DropdownMenuItem>
                      <DropdownMenuItem><Heading5 className="mr-2"/> Heading 5</DropdownMenuItem>
                      <DropdownMenuItem><Heading6 className="mr-2"/> Heading 6</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Separator orientation="vertical" className="h-6"/>
                  <Button variant="ghost" size="icon" title="Bold"><Bold/></Button>
                  <Button variant="ghost" size="icon" title="Italic"><Italic/></Button>
                  <Button variant="ghost" size="icon" title="Underline"><Underline/></Button>
                  <Button variant="ghost" size="icon" title="Strikethrough"><Strikethrough/></Button>
                  <Separator orientation="vertical" className="h-6"/>
                  <Button variant="ghost" size="icon" title="Text Color"><Palette/></Button>
                  <Button variant="ghost" size="icon" title="Highlight"><PaintBucket/></Button>
                   <Separator orientation="vertical" className="h-6"/>
                  <Button variant="ghost" size="icon" title="Insert Link" onClick={() => setIsUrlModalOpen(true)}><Link/></Button>
                  <Button variant="ghost" size="icon" title="Code Block"><Code2/></Button>
                  <Button variant="ghost" size="icon" title="Upload Image" onClick={() => setIsImageModalOpen(true)}><FileImage/></Button>
                </div>
              </ScrollArea>
             </div>
        </header>
      <main className="flex-1 overflow-y-auto py-8">
          <div className="container">
            <div className={cn("mx-auto max-w-4xl p-8 sm:p-12 rounded-lg shadow-lg", THEME_CLASSES[settings.theme])}>
              <Textarea
                value={note.content}
                onChange={(e) => onUpdate({ content: e.target.value })}
                placeholder="Start writing your masterpiece..."
                className="w-full resize-none border-0 shadow-none focus-visible:ring-0 p-0 text-base leading-relaxed bg-transparent min-h-[calc(100vh-280px)]"
                readOnly={readOnly}
                style={editorStyle}
              />
            </div>
          </div>
      </main>

        {/* Note Info Modal */}
        <AlertDialog open={isInfoModalOpen} onOpenChange={setIsInfoModalOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Note Information</AlertDialogTitle>
                </AlertDialogHeader>
                <div className="text-sm text-muted-foreground space-y-2">
                    <p><strong>Title:</strong> {note.title}</p>
                    <p><strong>Created:</strong> {format(new Date(note.createdAt), "PPP p")}</p>
                    <p><strong>Last Updated:</strong> {format(new Date(note.updatedAt), "PPP p")}</p>
                    <p><strong>Character Count:</strong> {note.content.length}</p>
                    <p><strong>Tags:</strong> {note.tags.join(', ') || 'None'}</p>
                </div>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => setIsInfoModalOpen(false)}>Close</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        {/* Insert URL Modal */}
        <AlertDialog open={isUrlModalOpen} onOpenChange={setIsUrlModalOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Insert Link</AlertDialogTitle>
                    <AlertDialogDescription>
                      This feature is coming soon! You'll be able to add links to your notes.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => setIsUrlModalOpen(false)}>Got It</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        
        {/* Upload Image Modal */}
        <AlertDialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Upload Image</AlertDialogTitle>
                    <AlertDialogDescription>
                      This feature is coming soon! You'll be able to upload and embed images.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => setIsImageModalOpen(false)}>Got It</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

    </div>
  );
}
