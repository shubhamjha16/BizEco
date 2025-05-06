
'use server';
/**
 * @fileOverview Evaluates user's decisions for a given business scenario.
 *
 * - evaluateScenarioDecisions - A function that evaluates user's decisions.
 * - EvaluateScenarioDecisionInput - The input type for the evaluateScenarioDecisions function.
 * - EvaluateScenarioDecisionOutput - The return type for the evaluateScenarioDecisions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EvaluateScenarioDecisionInputSchema = z.object({
  companyDescription: z
    .string()
    .describe(
      'A brief description of the company, including its name, industry, current focus, and challenges.'
    ),
  scenarioType: z
    .string()
    .describe(
      'The type of scenario (e.g., Most Probable, Most Dangerous, Best-Case, Wildcard).'
    ),
  scenarioDescription: z
    .string()
    .describe('The detailed description of the business scenario presented to the user.'),
  userDecisions: z
    .record(z.string(), z.string())
    .describe(
      'A record of the user decisions made in the scenario, where keys are MCQ IDs and values are the selected answers.'
    ),
});
export type EvaluateScenarioDecisionInput = z.infer<
  typeof EvaluateScenarioDecisionInputSchema
>;

const EvaluateScenarioDecisionOutputSchema = z.object({
  evaluation: z
    .string()
    .describe(
      "A detailed evaluation of the user's decisions for the given scenario, highlighting strengths, weaknesses, and areas for improvement. This evaluation should be at least two paragraphs long."
    ),
});
export type EvaluateScenarioDecisionOutput = z.infer<
  typeof EvaluateScenarioDecisionOutputSchema
>;

export async function evaluateScenarioDecisions(
  input: EvaluateScenarioDecisionInput
): Promise<EvaluateScenarioDecisionOutput> {
  return evaluateScenarioDecisionFlow(input);
}

const evaluationPrompt = ai.definePrompt({
  name: 'evaluateScenarioDecisionPrompt',
  input: {schema: EvaluateScenarioDecisionInputSchema},
  output: {schema: EvaluateScenarioDecisionOutputSchema},
  prompt: `You are an expert business consultant. Evaluate the user's decisions for the given business scenario based on their company profile.

Company Description:
{{{companyDescription}}}

Scenario Type: {{{scenarioType}}}
Scenario Presented to User:
{{{scenarioDescription}}}

User's Decisions (MCQ ID: Answer):
{{#each userDecisions}}
- {{{@key}}}: {{{this}}}
{{/each}}

Provide a detailed evaluation of these decisions. Consider:
- The alignment of the decisions with the company's focus and challenges.
- The potential effectiveness of the chosen strategies in the context of the scenario.
- Any potential risks or overlooked opportunities in their choices.
- Strengths and weaknesses in their decision-making process for this specific scenario.

Your evaluation should be constructive, insightful, and at least two paragraphs long.
Focus specifically on the decisions made for THIS scenario.
`,
});

const evaluateScenarioDecisionFlow = ai.defineFlow(
  {
    name: 'evaluateScenarioDecisionFlow',
    inputSchema: EvaluateScenarioDecisionInputSchema,
    outputSchema: EvaluateScenarioDecisionOutputSchema,
  },
  async input => {
    const {output} = await evaluationPrompt(input);
    if (!output) {
      throw new Error('The AI failed to provide an evaluation for the scenario decisions.');
    }
    return output;
  }
);
