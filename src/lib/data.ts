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
  {
    id: 'note-2',
    title: 'Project Ideas',
    content:
      'Brainstorming session for the new quarter.\n\n1. Develop a mobile app for budget tracking. Key features should include expense categorization, monthly reports, and savings goals.\n2. Create a web platform for local artists to showcase and sell their work. It should have a portfolio section, an e-commerce module, and an event calendar for exhibitions.\n3. Launch a podcast series about sustainable living. Topics could include zero-waste lifestyles, renewable energy, and ethical consumerism.',
    tags: ['brainstorming', 'projects', 'ideas'],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    history: [
      {
        content: 'Brainstorming session for the new quarter.\n\n1. Develop a mobile app for budget tracking.\n2. Create a web platform for local artists.',
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        content: 'Project ideas...',
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ]
  },
  {
    id: 'note-3',
    title: 'Meeting Notes: Q3 Planning',
    content:
      'Attendees: Alice, Bob, Charlie\nDate: Last Tuesday\n\nAgenda:\n- Review of Q2 performance\n- Q3 roadmap discussion\n- Resource allocation\n\nKey Takeaways:\n- Q2 sales exceeded targets by 15%.\n- The main focus for Q3 will be the launch of "Project Phoenix".\n- Marketing team needs two additional content creators.\n- Engineering will prioritize bug fixes in the first two weeks of the quarter.',
    tags: ['meeting', 'planning', 'work'],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    history: [],
  },
];
