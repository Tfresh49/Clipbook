'use client';

import type { Note } from '@/lib/types';
import {
    MoreVertical,
    Share2,
    Trash2,
    Info,
    Edit,
    History,
    EyeOff,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type DisplayMode = 'grid' | 'list';

export const NoteCard = ({ note, displayMode, onRename, onShare, onInfo, onDelete, onShowHistory }: {
    note: Note,
    displayMode: DisplayMode,
    onRename: (note: Note) => void,
    onShare: (note: Note) => void,
    onInfo: (note: Note) => void,
    onDelete: (noteId: string) => void,
    onShowHistory: (note: Note) => void;
}) => {
    const { toast } = useToast();
    const router = useRouter();
    const [updatedText, setUpdatedText] = useState('');

    useEffect(() => {
        setUpdatedText(formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true }));
    }, [note.updatedAt]);

    const isList = displayMode === 'list';
    const isWelcomeNote = note.id === 'note-1';

    const handleOpenNote = () => {
        toast({ title: `Opening "${note.title}"` })
        router.push(`/note/${note.id}`);
    }

    return (
        <Card 
            className={cn(
                "flex flex-col transition-all duration-200 hover:shadow-md cursor-pointer",
                isList && "flex-col sm:flex-row"
            )}
            onClick={handleOpenNote}
        >
            <CardHeader className={cn("w-full", isList && "sm:w-1/3")}>
                <CardTitle className="truncate text-lg">{note.title}</CardTitle>
                 <CardDescription>
                    Updated {updatedText}
                </CardDescription>
            </CardHeader>
            <CardContent className={cn("flex-grow w-full", isList && "sm:w-2/3")}>
                <p className={cn("text-sm text-muted-foreground",
                    isList ? "line-clamp-2" : "line-clamp-4"
                )}>
                    {note.content}
                </p>
            </CardContent>
            <CardFooter className={cn(
                "flex justify-between items-center w-full",
                isList && "sm:w-auto sm:flex-col sm:items-end sm:justify-center p-4"
            )}>
                <div className={cn("flex flex-wrap gap-1", isList && "sm:hidden")}>
                    {note.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                </div>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={handleOpenNote}>
                            <Edit className="mr-2 h-4 w-4"/> Open
                        </DropdownMenuItem>
                        {!isWelcomeNote && <DropdownMenuItem onClick={() => onRename(note)}>
                            <Edit className="mr-2 h-4 w-4"/> Rename
                        </DropdownMenuItem>}
                         <DropdownMenuItem onClick={() => onShowHistory(note)}>
                            <History className="mr-2 h-4 w-4"/> Version History
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onShare(note)}>
                            <Share2 className="mr-2 h-4 w-4"/> Share
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onInfo(note)}>
                            <Info className="mr-2 h-4 w-4"/> Info
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {isWelcomeNote ? (
                             <DropdownMenuItem onClick={() => onDelete(note.id)}>
                                <EyeOff className="mr-2 h-4 w-4"/> Hide
                            </DropdownMenuItem>
                        ) : (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4"/> Delete
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the note "{note.title}".
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => onDelete(note.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardFooter>
        </Card>
    )
}
