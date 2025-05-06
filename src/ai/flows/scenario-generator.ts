'use server';

/**
 * @fileOverview Generates tailored business scenarios based on a company profile.
 *
 * - generateScenario - A function that generates a scenario.
 * - ScenarioInput - The input type for the generateScenario function.
 * - ScenarioOutput - The return type for the generateScenario function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ScenarioInputSchema = z.object({
  companyDescription: z
    .string()
    .describe("A brief description of the company, including its name, industry, current focus, and challenges."),
  scenarioType: z.enum(["Most Probable", "Most Dangerous", "Best-Case", "Wildcard"]).describe("The type of scenario to generate."),
});

export type ScenarioInput = z.infer<typeof ScenarioInputSchema>;

const ScenarioOutputSchema = z.object({
  scenario: z.string().describe("A detailed business scenario tailored to the company description and scenario type."),
});

export type ScenarioOutput = z.infer<typeof ScenarioOutputSchema>;

export async function generateScenario(input: ScenarioInput): Promise<ScenarioOutput> {
  return scenarioGeneratorFlow(input);
}

const scenarioPrompt = ai.definePrompt({
  name: 'scenarioPrompt',
  input: {schema: ScenarioInputSchema},
  output: {schema: ScenarioOutputSchema},
  prompt: `You are an expert in business strategy and risk management. Given the following company description and scenario type, generate a detailed business scenario.

Company Description: {{{companyDescription}}}
Scenario Type: {{{scenarioType}}}

Scenario:`,  
});

const scenarioGeneratorFlow = ai.defineFlow(
  {
    name: 'scenarioGeneratorFlow',
    inputSchema: ScenarioInputSchema,
    outputSchema: ScenarioOutputSchema,
  },
  async input => {
    const {output} = await scenarioPrompt(input);
    return output!;
  }
);
