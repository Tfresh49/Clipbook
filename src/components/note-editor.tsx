'use client';

import type { Note, NoteSettings, EditorTheme, EditorFont, EditorDirection } from '@/lib/types';
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Info,
  Settings,
  Heading,
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
  CaseSensitive,
  HelpCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Label } from './ui/label';
import { Slider } from './ui/slider';

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

type ActiveTools = {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    heading?: string;
};

const COLOR_PALETTE = [
  '#000000', '#444444', '#666666', '#999999', '#CCCCCC', '#EEEEEE', '#F3F3F3', '#FFFFFF',
  '#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#9900FF', '#FF00FF',
  '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
  '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722',
];


export function NoteEditor({ note, onUpdate, onDelete, isSaving, readOnly = false, onBack }: NoteEditorProps) {
  const { toast } = useToast();
  const [settings, setSettings] = React.useState<NoteSettings>({
    theme: 'light',
    font: 'serif',
    fontSize: 16,
    direction: 'ltr',
  });
  const [activeTools, setActiveTools] = React.useState<ActiveTools>({});
  const [isInfoModalOpen, setIsInfoModalOpen] = React.useState(false);
  const [isUrlModalOpen, setIsUrlModalOpen] = React.useState(false);
  const [url, setUrl] = React.useState('');
  const [selection, setSelection] = React.useState<Selection | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = React.useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = React.useState(false);
  const editorRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const editor = editorRef.current;
    if (editor && editor.innerHTML !== note.content) {
      editor.innerHTML = note.content;
    }
  }, [note.content]);

  // You would typically load/save these settings per-note or globally
  const handleSettingsChange = (newSettings: Partial<NoteSettings>) => {
    setSettings(prev => ({...prev, ...newSettings}));
  }
  
  const applyFormat = (command: string, value?: string) => {
    if (readOnly) return;
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateActiveTools();
  };
  
  const updateActiveTools = () => {
    const newActiveTools: ActiveTools = {};
    if (document.queryCommandState('bold')) newActiveTools.bold = true;
    if (document.queryCommandState('italic')) newActiveTools.italic = true;
    if (document.queryCommandState('underline')) newActiveTools.underline = true;
    if (document.queryCommandState('strikethrough')) newActiveTools.strikethrough = true;
    
    let headingValue = document.queryCommandValue('formatBlock');
    // Normalize heading value
    if (headingValue.match(/h[1-6]/i)) {
      newActiveTools.heading = headingValue.toLowerCase();
    }

    setActiveTools(newActiveTools);
  };
  
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (readOnly) return;
    const content = e.currentTarget.innerHTML;
    onUpdate({ content });
  };
  
  const handleSelectionChange = () => {
    if (document.activeElement === editorRef.current) {
      updateActiveTools();
    }
  };

  React.useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  const handleHeadingClick = (e: React.MouseEvent, heading: string) => {
    e.preventDefault();
    applyFormat('formatBlock', heading);
  };

  const handleLink = () => {
    if(selection) {
      const range = selection.getRangeAt(0);
      editorRef.current?.focus();
      selection.removeAllRanges();
      selection.addRange(range);
    }
    if (url) {
      applyFormat('createLink', url);
    }
    setIsUrlModalOpen(false);
    setUrl('');
  };

  const openLinkModal = () => {
    setSelection(window.getSelection()?.getRangeAt(0).cloneRange() ? window.getSelection() : null);
    setIsUrlModalOpen(true);
  }


  const editorStyle: React.CSSProperties = {
    fontSize: `${settings.fontSize}px`,
    direction: settings.direction,
  };

  const ColorPalette = ({ command }: { command: 'foreColor' | 'backColor' }) => (
    <DropdownMenuContent>
      <div className="grid grid-cols-8 gap-2 p-2">
        {COLOR_PALETTE.map((color) => (
          <DropdownMenuItem
            key={color}
            className="w-6 h-6 p-0 rounded-full cursor-pointer focus:ring-2 focus:ring-ring focus:ring-offset-2"
            style={{ backgroundColor: color }}
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat(command, color);
            }}
          />
        ))}
      </div>
    </DropdownMenuContent>
  );
  
  return (
    <div className={cn("flex flex-col h-screen", FONT_CLASSES[settings.font])}>
       <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center space-x-2 sm:space-x-4 px-4 sm:px-8">
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
                        <DropdownMenuContent align="end" className="w-64">
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
                                <div className="p-2 space-y-2">
                                    <Label htmlFor="font-size-slider" className="text-xs font-normal">Font Size ({settings.fontSize}px)</Label>
                                    <div className='flex items-center gap-2'>
                                        <CaseSensitive className="h-5 w-5"/>
                                        <Slider
                                            id="font-size-slider"
                                            min={12}
                                            max={24}
                                            step={1}
                                            value={[settings.fontSize]}
                                            onValueChange={(value) => handleSettingsChange({ fontSize: value[0] })}
                                        />
                                    </div>
                                </div>
                              <DropdownMenuSeparator/>
                              <DropdownMenuLabel className="text-xs font-normal">Direction</DropdownMenuLabel>
                             <DropdownMenuRadioGroup value={settings.direction} onValueChange={(v) => handleSettingsChange({direction: v as EditorDirection})}>
                                <DropdownMenuRadioItem value="ltr">Left-to-Right</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="rtl">Right-to-Right</DropdownMenuRadioItem>
                             </DropdownMenuRadioGroup>
                             <DropdownMenuSeparator/>
                            <DropdownMenuItem onSelect={() => setIsHelpModalOpen(true)}>
                                <HelpCircle className="mr-2 h-4 w-4" />
                                How to Use
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {!readOnly && (
                      <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="icon">
                                <Trash2 className="h-5 w-5" />
                                <span className="sr-only">Delete</span>
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the note "{note.title}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDelete(note.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                    )}
                </div>
            </div>
            {!readOnly && (
             <div className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex items-center h-12 px-4 sm:px-8">
                 <ScrollArea className="w-full whitespace-nowrap">
                    <div className="flex items-center h-12 space-x-1">
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant={activeTools.heading ? 'secondary' : 'ghost'} size="sm" className="w-28 justify-start">
                                <Heading className="mr-2"/>
                                {activeTools.heading ? activeTools.heading.toUpperCase() : 'Heading'}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onMouseDown={(e) => handleHeadingClick(e, '<h1>')}><Heading1 className="mr-2"/> Heading 1</DropdownMenuItem>
                          <DropdownMenuItem onMouseDown={(e) => handleHeadingClick(e, '<h2>')}><Heading2 className="mr-2"/> Heading 2</DropdownMenuItem>
                          <DropdownMenuItem onMouseDown={(e) => handleHeadingClick(e, '<h3>')}><Heading3 className="mr-2"/> Heading 3</DropdownMenuItem>
                          <DropdownMenuItem onMouseDown={(e) => handleHeadingClick(e, '<h4>')}><Heading4 className="mr-2"/> Heading 4</DropdownMenuItem>
                          <DropdownMenuItem onMouseDown={(e) => handleHeadingClick(e, '<h5>')}><Heading5 className="mr-2"/> Heading 5</DropdownMenuItem>
                          <DropdownMenuItem onMouseDown={(e) => handleHeadingClick(e, '<h6>')}><Heading6 className="mr-2"/> Heading 6</DropdownMenuItem>
                          <DropdownMenuItem onMouseDown={(e) => handleHeadingClick(e, '<p>')}>Paragraph</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Separator orientation="vertical" className="h-6"/>
                      <Button variant={activeTools.bold ? 'secondary' : 'ghost'} size="icon" title="Bold" onMouseDown={(e) => { e.preventDefault(); applyFormat('bold'); }}><Bold/></Button>
                      <Button variant={activeTools.italic ? 'secondary' : 'ghost'} size="icon" title="Italic" onMouseDown={(e) => { e.preventDefault(); applyFormat('italic'); }}><Italic/></Button>
                      <Button variant={activeTools.underline ? 'secondary' : 'ghost'} size="icon" title="Underline" onMouseDown={(e) => { e.preventDefault(); applyFormat('underline'); }}><Underline/></Button>
                      <Button variant={activeTools.strikethrough ? 'secondary' : 'ghost'} size="icon" title="Strikethrough" onMouseDown={(e) => { e.preventDefault(); applyFormat('strikeThrough'); }}><Strikethrough/></Button>
                      <Separator orientation="vertical" className="h-6"/>
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" title="Text Color"><Palette/></Button>
                        </DropdownMenuTrigger>
                        <ColorPalette command="foreColor" />
                      </DropdownMenu>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" title="Highlight"><PaintBucket/></Button>
                        </DropdownMenuTrigger>
                        <ColorPalette command="backColor" />
                      </DropdownMenu>
                       <Separator orientation="vertical" className="h-6"/>
                      <Button variant="ghost" size="icon" title="Insert Link" onMouseDown={(e) => e.preventDefault()} onClick={openLinkModal}><Link/></Button>
                      <Button variant="ghost" size="icon" title="Code Block"><Code2/></Button>
                      <Button variant="ghost" size="icon" title="Upload Image" onClick={() => setIsImageModalOpen(true)}><FileImage/></Button>
                    </div>
                    <ScrollBar orientation="horizontal" className="h-2.5" />
                 </ScrollArea>
              </div>
             </div>
            )}
        </header>
      <main className="flex-1 overflow-y-auto">
        <div className="h-full">
            <div
                ref={editorRef}
                contentEditable={!readOnly}
                onInput={handleInput}
                onBlur={() => {
                  const content = editorRef.current?.innerHTML || '';
                  onUpdate({ content });
                }}
                onMouseUp={updateActiveTools}
                onKeyUp={updateActiveTools}
                suppressContentEditableWarning
                placeholder="Start writing your masterpiece..."
                className={cn(
                    "w-full h-full resize-none border-0 shadow-none focus-visible:ring-0 p-8 text-base leading-relaxed min-h-[calc(100vh-11rem)] outline-none [&_h1]:text-4xl [&_h1]:font-bold [&_h2]:text-3xl [&_h2]:font-bold [&_h3]:text-2xl [&_h3]:font-bold [&_h4]:text-xl [&_h4]:font-bold [&_h5]:text-lg [&_h5]:font-bold [&_h6]:text-base [&_h6]:font-bold",
                    THEME_CLASSES[settings.theme]
                )}
                style={editorStyle}
            />
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
                      Enter the URL you want to link to.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                  <Input 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLink}>Insert Link</AlertDialogAction>
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

        {/* How to Use Modal */}
        <AlertDialog open={isHelpModalOpen} onOpenChange={setIsHelpModalOpen}>
            <AlertDialogContent className="max-w-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>How to Use the Editor</AlertDialogTitle>
                </AlertDialogHeader>
                <ScrollArea className="max-h-[60vh] pr-4">
                  <div className="text-sm text-muted-foreground space-y-4">
                      <p>Welcome to the ClipBook editor! Here’s a quick rundown of the features at your disposal.</p>
                      
                      <h3 className="font-bold text-foreground">Formatting Tools</h3>
                      <ul className="list-disc list-inside space-y-2">
                          <li><strong>Headings (H1-H6)</strong>: Structure your document with different levels of headings.</li>
                          <li><strong>Bold, Italic, Underline, Strikethrough</strong>: Emphasize your text with standard formatting options.</li>
                          <li><strong>Text Color & Highlight</strong>: Change the color of your text or add a background highlight to make it stand out.</li>
                          <li><strong>Links</strong>: Select text and click the link icon to turn it into a hyperlink.</li>
                          <li><strong>Code & Image</strong>: (Coming Soon) You'll be able to add code blocks and images directly into your notes.</li>
                      </ul>

                      <h3 className="font-bold text-foreground">Editor Settings</h3>
                      <p>Click the <Settings className="inline-block h-4 w-4" /> icon to customize your writing environment:</p>
                      <ul className="list-disc list-inside space-y-2">
                          <li><strong>Theme</strong>: Choose between Light, Dark, and Sepia modes.</li>
                          <li><strong>Font</strong>: Select from Serif, Sans-serif, or Monospace fonts.</li>
                          <li><strong>Font Size</strong>: Adjust the text size for readability.</li>
                          <li><strong>Direction</strong>: Switch between Left-to-Right (LTR) and Right-to-Left (RTL) text direction.</li>
                      </ul>
                      
                      <h3 className="font-bold text-foreground">Markdown-Style Shortcuts (Coming Soon!)</h3>
                      <p>We're working on adding fast, intuitive Markdown shortcuts like `**bold**`, `*italic*`, and `# Heading` to speed up your writing workflow.</p>
                      
                      <h3 className="font-bold text-foreground">Saving and Syncing</h3>
                      <p>Your notes are saved automatically as you type. All changes are synced to your local storage, and will be backed up online whenever you have a network connection.</p>
                  </div>
                </ScrollArea>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => setIsHelpModalOpen(false)}>Got it!</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

    </div>
  );
}
