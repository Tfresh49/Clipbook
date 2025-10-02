import type { Note } from './types';

export const INITIAL_NOTES: Note[] = [
  {
    id: 'note-1',
    title: 'Welcome to ClipBook-Online',
    content:
      "<h3><u>Welcome to ClipBook-Online! Here's a quick guide to get you started:</u></h3><p><br></p><p><b>Creating & Editing Notes</b> - <b>New Note:</b> Click the <font color=\"#ffffff\" style=\"background-color: rgb(52, 124, 88);\">&nbsp;New Note&nbsp;</font> button on the main page to create a blank note.</p><p><br></p><p><b>Editing:</b> Simply click on any note card to open the full-page editor. You can change the title and content directly.</p><p><br></p><p><b>Saving:</b> Your notes are saved automatically as you type!</p><p><br></p><p><b>Organizing Your Notes</b> - <b>Tags:</b> Add tags to your notes in the editor to categorize them. You can add new tags by typing in the input box and pressing Enter.</p><p><br></p><p><b>Searching:</b> Use the search bar at the top of the main page to find notes by title or content.</p><p><br></p><p><b>Layouts:</b> Switch between a compact <u>Grid view</u> and a detailed <u>List view</u> using the toggle buttons.</p><p><br></p><p><b>AI-Powered Features</b> - <b>Summarize:</b> For long notes, click the <u>Summarize</u> button in the editor to get a concise summary.</p><p><br></p><p><b>Suggest Tags:</b> Let our AI suggest relevant tags for your note content by clicking <u>Suggest Tags</u>.</p><p><br></p><p><b>Advanced Features</b> - <b>Version History:</b> Made a mistake? Access 'Version History' from the note card's menu (...) to view and revert to previous versions of your note.</p><p><br></p><p><b>Offline Access & PWA:</b> Install ClipBook as a Progressive Web App (PWA) to use it offline. Look for the 'Download App' option in the app menu. Happy note-taking! 🙂</p>",
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
