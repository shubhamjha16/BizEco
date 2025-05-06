'use server';

/**
 * @fileOverview Generates a comprehensive final report based on the user's decisions in each scenario.
 *
 * - generateReport - A function that generates the final report.
 * - ReportGenerationInput - The input type for the generateReport function.
 * - ReportGenerationOutput - The return type for the generateReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReportGenerationInputSchema = z.object({
  companyDescription: z.string().describe('A brief description of the company, including its name, industry, current focus, and challenges.'),
  scenarioOutcomes: z.array(
    z.object({
      scenarioType: z.string().describe('The type of scenario (e.g., Most Probable, Most Dangerous, Best-Case, Wildcard).'),
      userDecisions: z.record(z.string(), z.string()).describe('A record of the user decisions made in the scenario.'),
      evaluation: z.string().describe('Evaluation of the user decisions in the scenario.'),
    })
  ).describe('An array of scenario outcomes, including the scenario type, user decisions, and evaluation.'),
});
export type ReportGenerationInput = z.infer<typeof ReportGenerationInputSchema>;

const ReportGenerationOutputSchema = z.object({
  report: z.string().describe('A comprehensive report summarizing the user decisions, evaluations, and insights.'),
});
export type ReportGenerationOutput = z.infer<typeof ReportGenerationOutputSchema>;

export async function generateReport(input: ReportGenerationInput): Promise<ReportGenerationOutput> {
  return reportGenerationFlow(input);
}

const reportGenerationPrompt = ai.definePrompt({
  name: 'reportGenerationPrompt',
  input: {schema: ReportGenerationInputSchema},
  output: {schema: ReportGenerationOutputSchema},
  prompt: `You are an expert business consultant tasked with generating a comprehensive final report based on the user's decisions in various business scenarios.

  Company Description: {{{companyDescription}}}

  Scenario Outcomes:
  {{#each scenarioOutcomes}}
  Scenario Type: {{{scenarioType}}}
  User Decisions: {{JSONstringify userDecisions}}
  Evaluation: {{{evaluation}}}
  {{/each}}

  Based on the company description and scenario outcomes, generate a report that includes:
  - An evaluation of the user's decision-making in each scenario.
  - A breakdown of correct vs. incorrect responses (if applicable).
  - Suggestions for improvement based on the user's answers.
  - Insights on leadership, strategic thinking, and crisis management.

  Ensure the report is detailed, actionable, and provides valuable insights for the user's future business endeavors.
  Please make the report at least 3 paragraphs long.
  `,
});

const reportGenerationFlow = ai.defineFlow(
  {
    name: 'reportGenerationFlow',
    inputSchema: ReportGenerationInputSchema,
    outputSchema: ReportGenerationOutputSchema,
  },
  async input => {
    const {output} = await reportGenerationPrompt(input);
    return output!;
  }
);
