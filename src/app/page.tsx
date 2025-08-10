'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  MoreVertical,
  Search,
  LayoutGrid,
  List,
  Filter,
  FilePlus2,
  Share2,
  Trash2,
  Info,
  Edit,
  User,
  Settings,
  HelpCircle,
  Newspaper,
  Download,
  History,
  LayoutDashboard,
  CreditCard,
  AppWindow,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { INITIAL_NOTES } from '@/lib/data';
import type { Note } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { cn } from '@/lib/utils';
import { NoteVersionHistory } from '@/components/note-version-history';
import { NoteCard } from '@/components/note-card';
import { Progress } from '@/components/ui/progress';

type DisplayMode = 'grid' | 'list';
type SortKey = 'updatedAt' | 'createdAt' | 'title' | 'contentLength';
type SortDirection = 'asc' | 'desc';

export default function Home() {
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('grid');
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<Note | null>(null);
  const [newName, setNewName] = useState('');
  const { toast } = useToast();

  const filteredAndSortedNotes = useMemo(() => {
    return notes
      .filter((note) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        let compareA: any;
        let compareB: any;

        switch (sortKey) {
            case 'contentLength':
                compareA = a.content.length;
                compareB = b.content.length;
                break;
            case 'updatedAt':
            case 'createdAt':
                compareA = new Date(a[sortKey]).getTime();
                compareB = new Date(b[sortKey]).getTime();
                break;
            default:
                compareA = a[sortKey];
                compareB = b[sortKey];
        }

        if (compareA < compareB) {
          return sortDirection === 'asc' ? -1 : 1;
        }
        if (compareA > compareB) {
          return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      });
  }, [notes, searchQuery, sortKey, sortDirection]);

  const handleNewNote = () => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: 'Untitled Note',
      content: '',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [],
    };
    setNotes((prev) => [newNote, ...prev]);
    toast({ title: "New Note Created", description: "You can find your new note at the top of the list (sorted by 'Newest')." });
  };
  
  const handleDeleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
    toast({ title: "Note Deleted", variant: "destructive" });
  };

  const openRenameModal = (note: Note) => {
    setNoteToEdit(note);
    setNewName(note.title);
    setIsRenameModalOpen(true);
  }

  const handleRenameNote = () => {
    if (noteToEdit && newName.trim()) {
        const oldNote = notes.find(n => n.id === noteToEdit.id);
        if (oldNote) {
            const newHistoryEntry = {
                content: oldNote.content,
                updatedAt: oldNote.updatedAt,
            };
            const updatedNote = {
                ...noteToEdit,
                title: newName.trim(),
                updatedAt: new Date().toISOString(),
                history: [newHistoryEntry, ...(oldNote.history || [])],
            };
            setNotes(notes.map(n => (n.id === noteToEdit.id ? updatedNote : n)));
        }

        setIsRenameModalOpen(false);
        setNoteToEdit(null);
        toast({ title: "Note Renamed" });
    }
  }

  const openShareModal = (note: Note) => {
    setNoteToEdit(note);
    setIsShareModalOpen(true);
  }
  
  const openInfoModal = (note: Note) => {
    setNoteToEdit(note);
    setIsInfoModalOpen(true);
  }

  const openHistoryPanel = (note: Note) => {
    setNoteToEdit(note);
    setIsHistoryPanelOpen(true);
  }

  const handleSortChange = (key: SortKey) => {
    if (key === sortKey) {
        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
        setSortKey(key);
        setSortDirection('desc');
    }
  }

  // PWA install prompt
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (installPrompt) {
        installPrompt.prompt();
        installPrompt.userChoice.then((choiceResult: { outcome: string }) => {
            if (choiceResult.outcome === 'accepted') {
                toast({ title: 'Installation successful!' });
            } else {
                toast({ title: 'Installation cancelled.', variant: 'destructive' });
            }
            setInstallPrompt(null);
            setIsPwaModalOpen(false);
        });
    }
  };

  const handleRevertToVersion = (noteId: string, version: { content: string; updatedAt: string }) => {
    setNotes(notes.map(n => {
        if (n.id === noteId) {
            const oldVersion = { content: n.content, updatedAt: n.updatedAt };
            return {
                ...n,
                content: version.content,
                updatedAt: new Date().toISOString(),
                history: [oldVersion, ...(n.history || [])],
            };
        }
        return n;
    }));
    toast({ title: "Note version restored!" });
    setIsHistoryPanelOpen(false);
  };


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
                <div className="flex gap-6 md:gap-10">
                    <a href="/" className="flex items-center space-x-2">
                        <span className="inline-block font-bold text-2xl font-headline">ClipBook</span>
                    </a>
                </div>
                <div className="flex flex-1 items-center justify-end space-x-2">
                    <ThemeToggle />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon">
                                <User className="h-5 w-5" />
                                <span className="sr-only">Profile</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                             <DropdownMenuLabel>My Account</DropdownMenuLabel>
                             <DropdownMenuSeparator/>
                             <DropdownMenuItem>
                                 <LayoutDashboard className="mr-2"/> Dashboard
                             </DropdownMenuItem>
                             <DropdownMenuSeparator/>
                             <div className="p-2">
                                <p className="text-xs text-muted-foreground mb-1">Storage</p>
                                <Progress value={33} className="h-2"/>
                                <p className="text-xs text-muted-foreground mt-1">3.3GB of 10GB used</p>
                             </div>
                             <DropdownMenuSeparator/>
                             <DropdownMenuItem>
                                <Trash2 className="mr-2"/> Trash
                             </DropdownMenuItem>
                             <DropdownMenuItem>
                                <CreditCard className="mr-2"/> Billing
                                <DropdownMenuShortcut>
                                    <Badge variant="secondary">Pro</Badge>
                                </DropdownMenuShortcut>
                             </DropdownMenuItem>
                             <DropdownMenuItem>
                                <Settings className="mr-2"/> Account Settings
                             </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="h-5 w-5" />
                                <span className="sr-only">App Menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem><Settings className="mr-2"/>App Settings</DropdownMenuItem>
                            <DropdownMenuItem><HelpCircle className="mr-2"/>About</DropdownMenuItem>
                            <DropdownMenuItem><Newspaper className="mr-2"/>News/Updates</DropdownMenuItem>
                             <DropdownMenuItem><AppWindow className="mr-2"/>Other Apps</DropdownMenuItem>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem onClick={() => setIsPwaModalOpen(true)}><Download className="mr-2"/>Download App</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>

        <main className="flex-1 container py-8">
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Search notes..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant={displayMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setDisplayMode('list')}>
                        <LayoutGrid className="h-5 w-5"/>
                        <span className="sr-only">Grid View</span>
                    </Button>
                    <Button variant={displayMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setDisplayMode('grid')}>
                        <List className="h-5 w-5"/>
                        <span className="sr-only">List View</span>
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Filter className="h-5 w-5"/>
                                <span className="sr-only">Filter</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                            <DropdownMenuRadioGroup value={`${sortKey}-${sortDirection}`} onValueChange={(value) => {
                                const [key, dir] = value.split('-') as [SortKey, SortDirection];
                                setSortKey(key);
                                setSortDirection(dir);
                            }}>
                                <DropdownMenuRadioItem value="updatedAt-desc">Newest</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="updatedAt-asc">Oldest (Updated)</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="title-asc">Title (A-Z)</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="title-desc">Title (Z-A)</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="contentLength-desc">Length (Longest)</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="contentLength-asc">Length (Shortest)</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                     <Button onClick={handleNewNote}>
                        <FilePlus2 className="mr-2 h-5 w-5"/>
                        New Note
                    </Button>
                </div>
            </div>

            {filteredAndSortedNotes.length > 0 ? (
                 <div className={cn(
                    displayMode === 'grid' 
                    ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6' 
                    : 'grid grid-cols-1 sm:grid-cols-2 gap-4'
                 )}>
                    {filteredAndSortedNotes.map(note => (
                       <NoteCard 
                            key={note.id}
                            note={note}
                            displayMode={displayMode}
                            onRename={openRenameModal}
                            onShare={openShareModal}
                            onInfo={openInfoModal}
                            onDelete={handleDeleteNote}
                            onShowHistory={openHistoryPanel}
                       />
                    ))}
                 </div>
            ) : (
                <div className="text-center py-20">
                    <h2 className="text-2xl font-semibold">No Notes Found</h2>
                    <p className="text-muted-foreground mt-2">
                        {searchQuery ? `No notes match your search for "${searchQuery}".` : "You haven't created any notes yet."}
                    </p>
                    <Button onClick={handleNewNote} className="mt-6">
                        <FilePlus2 className="mr-2" />
                        Create Your First Note
                    </Button>
                </div>
            )}
        </main>
        
        {noteToEdit && (
            <NoteVersionHistory
                isOpen={isHistoryPanelOpen}
                onOpenChange={setIsHistoryPanelOpen}
                note={noteToEdit}
                onRevert={handleRevertToVersion}
            />
        )}


        {/* PWA Installation Modal */}
        <AlertDialog open={isPwaModalOpen} onOpenChange={setIsPwaModalOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Download ClipBook App</AlertDialogTitle>
                    <AlertDialogDescription>
                        For the best experience, install the ClipBook app on your device. This allows for offline access and better performance.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    {installPrompt ? (
                        <AlertDialogAction onClick={handleInstallClick}>Install</AlertDialogAction>
                    ) : (
                        <p className="text-sm text-muted-foreground">App is already installed or your browser doesn't support installation.</p>
                    )}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        {/* Rename Note Modal */}
        <AlertDialog open={isRenameModalOpen} onOpenChange={setIsRenameModalOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Rename Note</AlertDialogTitle>
                    <AlertDialogDescription>
                        Enter a new name for the note "{noteToEdit?.title}".
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                    <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New note title" />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRenameNote}>Rename</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        {/* Share Note Modal */}
        <AlertDialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Share "{noteToEdit?.title}"</AlertDialogTitle>
                    <AlertDialogDescription>
                        Sharing options are coming soon! You'll be able to create public or private links with password protection.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => setIsShareModalOpen(false)}>Got it</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        {/* Note Info Modal */}
        <AlertDialog open={isInfoModalOpen} onOpenChange={setIsInfoModalOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Note Information</AlertDialogTitle>
                </AlertDialogHeader>
                {noteToEdit && (
                    <div className="text-sm text-muted-foreground space-y-2">
                        <p><strong>Title:</strong> {noteToEdit.title}</p>
                        <p><strong>Created:</strong> {format(new Date(noteToEdit.createdAt), "PPP p")}</p>
                        <p><strong>Last Updated:</strong> {format(new Date(noteToEdit.updatedAt), "PPP p")}</p>
                        <p><strong>Character Count:</strong> {noteToEdit.content.length}</p>
                        <p><strong>Tags:</strong> {noteToEdit.tags.join(', ') || 'None'}</p>
                    </div>
                )}
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => setIsInfoModalOpen(false)}>Close</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
