'use server';

import { summarizeNote as summarizeNoteFlow } from '@/ai/flows/summarize-note';
import { suggestTags as suggestTagsFlow } from '@/ai/flows/suggest-tags';
import type { SummarizeNoteInput, SummarizeNoteOutput } from '@/ai/flows/summarize-note';
import type { SuggestTagsInput, SuggestTagsOutput } from '@/ai/flows/suggest-tags';

export async function summarizeNoteAction(input: SummarizeNoteInput): Promise<SummarizeNoteOutput> {
  try {
    return await summarizeNoteFlow(input);
  } catch (error) {
    console.error('Error summarizing note:', error);
    throw new Error('Failed to summarize note.');
  }
}

export async function suggestTagsAction(input: SuggestTagsInput): Promise<SuggestTagsOutput> {
  try {
    return await suggestTagsFlow(input);
  } catch (error) {
    console.error('Error suggesting tags:', error);
    throw new Error('Failed to suggest tags.');
  }
}
