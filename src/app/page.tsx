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
  File,
  Notebook,
  Tag,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { INITIAL_NOTES } from '@/lib/data';
import type { Note } from '@/lib/types';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
  } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { cn } from '@/lib/utils';
import { NoteVersionHistory } from '@/components/note-version-history';
import { NoteCard } from '@/components/note-card';
import { Progress } from '@/components/ui/progress';
import { ToastAction } from '@/components/ui/toast';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

type DisplayMode = 'grid' | 'list';
type SortKey = 'updatedAt' | 'createdAt' | 'title' | 'contentLength';
type SortDirection = 'asc' | 'desc';

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
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
  const [lastDeletedNote, setLastDeletedNote] = useState<{note: Note, index: number} | null>(null);
  const [isWelcomeNoteHidden, setIsWelcomeNoteHidden] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const isMobile = useIsMobile();

  // PWA install prompt
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

  // Load notes from localStorage on initial render
  useEffect(() => {
    try {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes));
      } else {
        setNotes(INITIAL_NOTES);
        localStorage.setItem('notes', JSON.stringify(INITIAL_NOTES));
      }
      const welcomeHidden = localStorage.getItem('welcomeNoteHidden') === 'true';
      setIsWelcomeNoteHidden(welcomeHidden);
    } catch (error) {
        console.error("Failed to access localStorage", error);
        setNotes(INITIAL_NOTES);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const saveNotes = (updatedNotes: Note[]) => {
    setNotes(updatedNotes);
    try {
        localStorage.setItem('notes', JSON.stringify(updatedNotes));
    } catch (error) {
        console.error("Failed to save notes to localStorage", error);
    }
  }


  const filteredAndSortedNotes = useMemo(() => {
    return notes
      .filter((note) =>
        (note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (!isWelcomeNoteHidden || note.id !== 'note-1')
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
  }, [notes, searchQuery, sortKey, sortDirection, isWelcomeNoteHidden]);

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
    const newNotes = [newNote, ...notes];
    saveNotes(newNotes);
    toast({ title: "New Note Created", description: "You can find your new note at the top of the list (sorted by 'Newest')." });
  };
  
  const handleUndoDelete = () => {
    if (lastDeletedNote) {
        const newNotes = [...notes];
        newNotes.splice(lastDeletedNote.index, 0, lastDeletedNote.note);
        saveNotes(newNotes);
        setLastDeletedNote(null);
        toast({ title: "Note Restored" });
    }
  };

  const handleDeleteNote = (noteId: string) => {
    if (noteId === 'note-1') {
        setIsWelcomeNoteHidden(true);
        localStorage.setItem('welcomeNoteHidden', 'true');
        toast({ title: "Welcome note hidden", description: "You can re-enable it in App Settings." });
        return;
    }
    const noteIndex = notes.findIndex(note => note.id === noteId);
    if (noteIndex > -1) {
        const noteToDelete = notes[noteIndex];
        setLastDeletedNote({note: noteToDelete, index: noteIndex});
        const newNotes = notes.filter(note => note.id !== noteId);
        saveNotes(newNotes);
        toast({ 
            title: "Note Deleted",
            variant: "destructive",
            action: <ToastAction altText="Undo" onClick={handleUndoDelete}>Undo</ToastAction>
        });
    }
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
            const newNotes = notes.map(n => (n.id === noteToEdit.id ? updatedNote : n));
            saveNotes(newNotes);
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
    const newNotes = notes.map(n => {
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
    });
    saveNotes(newNotes);
    toast({ title: "Note version restored!" });
    setIsHistoryPanelOpen(false);
  };


  return (
    <SidebarProvider>
        <Sidebar>
            {!isMobile && (
                <>
                    <SidebarHeader>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input 
                                placeholder="Search notes..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton href="/" isActive>
                                    <File /> All Notes
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton href="/">
                                    <Notebook /> Notebooks
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton href="/">
                                    <Tag /> Tags
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                        <Separator className="my-4" />
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton href="/">
                                    <Settings /> Settings
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton href="/">
                                    <Trash2 /> Trash
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarContent>
                    <SidebarFooter>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="w-full justify-start gap-2">
                                    <User className="h-5 w-5" />
                                    <span className="truncate">My Account</span>
                                    <MoreVertical className="h-5 w-5 ml-auto"/>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64 ml-4 mb-2">
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
                    </SidebarFooter>
                </>
            )}
        </Sidebar>

        <div className="relative flex min-h-svh flex-1 flex-col bg-background">
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-16 items-center justify-between px-4 sm:px-8">
                    <div className="flex items-center gap-4">
                        {!isMobile && <SidebarTrigger />}
                        <a href="/" className="flex items-center space-x-2">
                            <span className="inline-block font-bold text-2xl font-headline">ClipBook</span>
                        </a>
                    </div>
                    <div className="flex items-center space-x-2">
                        {isMobile && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <User className="h-5 w-5" />
                                        <span className="sr-only">User Menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-64">
                                    <DropdownMenuItem><File className="mr-2 h-4 w-4" />All Notes</DropdownMenuItem>
                                    <DropdownMenuItem><Notebook className="mr-2 h-4 w-4" />Notebooks</DropdownMenuItem>
                                    <DropdownMenuItem><Tag className="mr-2 h-4 w-4" />Tags</DropdownMenuItem>
                                    <DropdownMenuSeparator/>
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator/>
                                    <DropdownMenuItem><LayoutDashboard className="mr-2"/> Dashboard</DropdownMenuItem>
                                    <DropdownMenuItem><Trash2 className="mr-2"/> Trash</DropdownMenuItem>
                                    <DropdownMenuItem><Settings className="mr-2"/> Settings</DropdownMenuItem>
                                    <DropdownMenuSeparator/>
                                    <DropdownMenuItem>
                                        <CreditCard className="mr-2"/> Billing
                                        <DropdownMenuShortcut>
                                            <Badge variant="secondary">Pro</Badge>
                                        </DropdownMenuShortcut>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Settings className="mr-2"/> Account Settings
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator/>
                                    <div className="p-2">
                                        <p className="text-xs text-muted-foreground mb-1">Storage</p>
                                        <Progress value={33} className="h-2"/>
                                        <p className="text-xs text-muted-foreground mt-1">3.3GB of 10GB used</p>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                        <ThemeToggle />
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
            <main className="flex-1 px-4 sm:px-8 py-8">
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <h1 className="text-3xl font-bold">All Notes</h1>
                    <div className="flex-grow" />
                    <div className="flex items-center gap-2">
                        <div className="relative sm:hidden">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input 
                                placeholder="Search"
                                className="pl-10 w-full"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant={displayMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setDisplayMode('grid')}>
                            <LayoutGrid className="h-5 w-5"/>
                            <span className="sr-only">Grid View</span>
                        </Button>
                        <Button variant={displayMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setDisplayMode('list')}>
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

                {isLoading ? (
                     <div className="text-center py-20">
                        <h2 className="text-2xl font-semibold">Loading Notes...</h2>
                     </div>
                ) : filteredAndSortedNotes.length > 0 ? (
                     <div className={cn(
                        displayMode === 'grid' 
                        ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6' 
                        : 'grid grid-cols-1 gap-4'
                     )}>
                        {filteredAndSortedNotes.map(note => (
                           <NoteCard 
                                key={note.id}
                                note={note}
                                displayMode={displayMode}
                                onRename={(note) => {
                                    // Prevent modal from closing due to event propagation
                                    event?.stopPropagation();
                                    openRenameModal(note);
                                }}
                                onShare={(note) => {
                                    event?.stopPropagation();
                                    openShareModal(note)
                                }}
                                onInfo={(note) => {
                                    event?.stopPropagation();
                                    openInfoModal(note)
                                }}
                                onDelete={(id) => {
                                    event?.stopPropagation();
                                    handleDeleteNote(id)
                                }}
                                onShowHistory={(note) => {
                                    event?.stopPropagation();
                                    openHistoryPanel(note)
                                }}
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
        </div>
        
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
    </SidebarProvider>
  );
}
