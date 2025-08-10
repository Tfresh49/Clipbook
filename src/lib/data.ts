import type { Note } from './types';

export const INITIAL_NOTES: Note[] = [
  {
    id: 'note-1',
    title: 'Welcome to ClipBook-Online',
    content:
      "Welcome to ClipBook-Online! Here’s a quick guide to get you started:\n\n**Creating & Editing Notes**\n- **New Note**: Click the 'New Note' button on the main page to create a blank note.\n- **Editing**: Simply click on any note card to open the full-page editor. You can change the title and content directly.\n- **Saving**: Your notes are saved automatically as you type!\n\n**Organizing Your Notes**\n- **Tags**: Add tags to your notes in the editor to categorize them. You can add new tags by typing in the input box and pressing Enter.\n- **Searching**: Use the search bar at the top of the main page to find notes by title or content.\n- **Layouts**: Switch between a compact 'Grid' view and a detailed 'List' view using the toggle buttons.\n\n**AI-Powered Features**\n- **Summarize**: For long notes, click the 'Summarize' button in the editor to get a concise summary.\n- **Suggest Tags**: Let our AI suggest relevant tags for your note content by clicking 'Suggest Tags'.\n\n**Advanced Features**\n- **Version History**: Made a mistake? Access 'Version History' from the note card's menu (...) to view and revert to previous versions of your note.\n- **Offline Access & PWA**: Install ClipBook as a Progressive Web App (PWA) to use it offline. Look for the 'Download App' option in the app menu.\n\nHappy note-taking!",
    tags: ['welcome', 'tutorial', 'getting-started'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    history: [
      {
        content: "This is a note taking app.",
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ]
  },
];
