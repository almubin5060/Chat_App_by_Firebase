'use server';

/**
 * @fileOverview This file defines a Genkit flow for adaptive session timeout based on chat activity and content.
 *
 * The flow dynamically adjusts the session timeout based on the content of messages and user activity patterns
 * to enhance security and prevent unauthorized access.
 *
 * @exports adaptiveSessionTimeout - The main function to trigger the adaptive timeout flow.
 * @exports AdaptiveSessionTimeoutInput - The input type for the adaptiveSessionTimeout function.
 * @exports AdaptiveSessionTimeoutOutput - The output type for the adaptiveSessionTimeout function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdaptiveSessionTimeoutInputSchema = z.object({
  messageContent: z.string().describe('The content of the latest message in the chat session.'),
  userActivityLevel: z.number().describe('A numerical value representing the user activity level (e.g., number of messages sent in the last minute).'),
  currentTimeout: z.number().describe('The current session timeout in seconds.'),
});
export type AdaptiveSessionTimeoutInput = z.infer<typeof AdaptiveSessionTimeoutInputSchema>;

const AdaptiveSessionTimeoutOutputSchema = z.object({
  newTimeout: z.number().describe('The new session timeout in seconds, adjusted based on message content and user activity.'),
  reason: z.string().describe('The reason for the timeout adjustment.'),
});
export type AdaptiveSessionTimeoutOutput = z.infer<typeof AdaptiveSessionTimeoutOutputSchema>;

export async function adaptiveSessionTimeout(input: AdaptiveSessionTimeoutInput): Promise<AdaptiveSessionTimeoutOutput> {
  return adaptiveSessionTimeoutFlow(input);
}

const adaptiveSessionTimeoutPrompt = ai.definePrompt({
  name: 'adaptiveSessionTimeoutPrompt',
  input: {schema: AdaptiveSessionTimeoutInputSchema},
  output: {schema: AdaptiveSessionTimeoutOutputSchema},
  prompt: `You are an AI responsible for determining the session timeout for a secure chat application. 

  You will receive the latest message content, a numerical value representing the user activity level,
  and the current session timeout. Based on these inputs, you should adjust the timeout to ensure optimal security.

  Consider the following factors:
  - Suspicious Message Content: If the message content contains potentially sensitive information or suspicious keywords, reduce the timeout.
  - User Activity: If the user is highly active, maintain a longer timeout. If the user is inactive, reduce the timeout.

  Message Content: {{{messageContent}}}
  User Activity Level: {{{userActivityLevel}}}
  Current Timeout: {{{currentTimeout}}} seconds

  Provide a new timeout value in seconds and a brief explanation for the adjustment.
  The new timeout should not be less than 60 seconds.`,
});

const adaptiveSessionTimeoutFlow = ai.defineFlow(
  {
    name: 'adaptiveSessionTimeoutFlow',
    inputSchema: AdaptiveSessionTimeoutInputSchema,
    outputSchema: AdaptiveSessionTimeoutOutputSchema,
    retries: 3,
  },
  async input => {
    const {output} = await adaptiveSessionTimeoutPrompt(input);
    return output!;
  }
);
