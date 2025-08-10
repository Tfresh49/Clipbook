'use server';
/**
 * @fileOverview Provides tag suggestions for a given note's content.
 *
 * - suggestTags - A function that suggests tags for the note content.
 * - SuggestTagsInput - The input type for the suggestTags function.
 * - SuggestTagsOutput - The return type for the suggestTags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTagsInputSchema = z.object({
  noteContent: z.string().describe('The content of the note to suggest tags for.'),
});
export type SuggestTagsInput = z.infer<typeof SuggestTagsInputSchema>;

const SuggestedTagSchema = z.object({
  tag: z.string().describe('A suggested tag for the note content.'),
  relevanceScore: z
    .number()
    .min(0)
    .max(1)
    .describe('A score indicating the relevance of the tag to the note content.'),
});

const SuggestTagsOutputSchema = z.array(SuggestedTagSchema).describe('An array of suggested tags with relevance scores.');
export type SuggestTagsOutput = z.infer<typeof SuggestTagsOutputSchema>;

export async function suggestTags(input: SuggestTagsInput): Promise<SuggestTagsOutput> {
  return suggestTagsFlow(input);
}

const tagRelevanceTool = ai.defineTool({
  name: 'isTagRelevant',
  description: 'Determines whether a tag is relevant to the note content.',
  inputSchema: z.object({
    tag: z.string().describe('The tag to check for relevance.'),
    noteContent: z.string().describe('The content of the note.'),
  }),
  outputSchema: z.boolean().describe('Whether the tag is relevant to the note content.'),
},
async (input) => {
  // Implement the logic to determine tag relevance here.
  // This is a placeholder implementation.
  return input.noteContent.toLowerCase().includes(input.tag.toLowerCase());
});

const suggestTagsPrompt = ai.definePrompt({
  name: 'suggestTagsPrompt',
  input: {schema: SuggestTagsInputSchema},
  output: {schema: SuggestTagsOutputSchema},
  tools: [tagRelevanceTool],
  prompt: `You are a tag suggestion assistant. Given the content of a note, you will suggest relevant tags.

Note Content: {{{noteContent}}}

Suggest a list of tags that would be relevant to the note. Return each tag with a relevance score between 0 and 1.

You MUST use the isTagRelevant tool to determine if the tag is relevant to the note content. Only include tags that the tool deems relevant.

Format your response as a JSON array of objects with 'tag' and 'relevanceScore' fields.
`, // Ensure valid JSON is returned
});

const suggestTagsFlow = ai.defineFlow(
  {
    name: 'suggestTagsFlow',
    inputSchema: SuggestTagsInputSchema,
    outputSchema: SuggestTagsOutputSchema,
  },
  async input => {
    const {output} = await suggestTagsPrompt(input);
    return output!;
  }
);
