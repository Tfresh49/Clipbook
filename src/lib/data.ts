import type { Note } from './types';

export const INITIAL_NOTES: Note[] = [
  {
    id: 'note-1',
    title: 'Welcome to ClipBook',
    content:
      "This is your first note in ClipBook-Online! ClipBook is a clean and intuitive application designed for creating, editing, and organizing your thoughts. You can categorize your notes using tags, access them offline, and even install this app on your desktop or mobile device as a Progressive Web App (PWA).\n\nTry out our AI-powered features! For long notes, you can use the 'Summarize' feature to get key bullet points. The 'Suggest Tags' feature will intelligently recommend relevant tags based on what you write. You can also customize your experience by switching between light and dark modes.\n\nEnjoy a clutter-free and focused writing environment. Happy note-taking!",
    tags: ['welcome', 'getting-started'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'note-2',
    title: 'Project Ideas',
    content:
      'Brainstorming session for the new quarter.\n\n1. Develop a mobile app for budget tracking. Key features should include expense categorization, monthly reports, and savings goals.\n2. Create a web platform for local artists to showcase and sell their work. It should have a portfolio section, an e-commerce module, and an event calendar for exhibitions.\n3. Launch a podcast series about sustainable living. Topics could include zero-waste lifestyles, renewable energy, and ethical consumerism.',
    tags: ['brainstorming', 'projects', 'ideas'],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'note-3',
    title: 'Meeting Notes: Q3 Planning',
    content:
      'Attendees: Alice, Bob, Charlie\nDate: Last Tuesday\n\nAgenda:\n- Review of Q2 performance\n- Q3 roadmap discussion\n- Resource allocation\n\nKey Takeaways:\n- Q2 sales exceeded targets by 15%.\n- The main focus for Q3 will be the launch of "Project Phoenix".\n- Marketing team needs two additional content creators.\n- Engineering will prioritize bug fixes in the first two weeks of the quarter.',
    tags: ['meeting', 'planning', 'work'],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
