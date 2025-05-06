'use server';

/**
 * @fileOverview Generates tailored business scenarios and related MCQs based on a company profile.
 *
 * - generateScenario - A function that generates a scenario with MCQs.
 * - ScenarioInput - The input type for the generateScenario function.
 * - ScenarioOutput - The return type for the generateScenario function, including scenario text and MCQs.
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

const MCQSchema = z.object({
  id: z.string().describe("A unique identifier for the MCQ (e.g., 'scenario_q1', 'decision_point_alpha')."),
  question: z.string().describe("The MCQ question text, directly related to the generated scenario."),
  options: z.array(z.string()).min(3).max(4).describe("An array of 3 to 4 distinct answer options for the MCQ."),
});

const ScenarioOutputSchema = z.object({
  scenario: z.string().describe("A detailed business scenario tailored to the company description and scenario type. This should be a narrative describing a situation the company faces."),
  mcqs: z.array(MCQSchema).min(5).max(10).describe("An array of 5 to 10 multiple-choice questions. Each question must be directly based on the 'scenario' text provided above. The questions should assess the user's understanding, decision-making, and strategic thinking in response to THIS specific scenario."),
});

export type ScenarioOutput = z.infer<typeof ScenarioOutputSchema>;

export async function generateScenario(input: ScenarioInput): Promise<ScenarioOutput> {
  return scenarioGeneratorFlow(input);
}

const scenarioPrompt = ai.definePrompt({
  name: 'scenarioPrompt',
  input: {schema: ScenarioInputSchema},
  output: {schema: ScenarioOutputSchema},
  prompt: `You are an expert in business strategy and risk management.
Your task is to:
1. Generate a detailed business scenario based on the provided company description and scenario type. The scenario should be engaging, realistic, and present specific challenges or opportunities for the described company.
2. Based ONLY on the scenario you just generated, create 5 to 10 multiple-choice questions (MCQs). These MCQs must:
    a. Directly test the user's comprehension of, and strategic response to, the specific details, challenges, and nuances presented in THIS scenario.
    b. Avoid generic business questions; they must be answerable only by carefully considering the scenario you wrote.
    c. Each have a unique ID (e.g., '{{scenarioType}}_q1', '{{scenarioType}}_q2').
    d. Each have 3 to 4 distinct, plausible answer options.

Company Description: {{{companyDescription}}}
Scenario Type: {{{scenarioType}}}

Generate the scenario and the MCQs.
`,
});

const scenarioGeneratorFlow = ai.defineFlow(
  {
    name: 'scenarioGeneratorFlow',
    inputSchema: ScenarioInputSchema,
    outputSchema: ScenarioOutputSchema,
  },
  async input => {
    const {output} = await scenarioPrompt(input);
    if (!output || !output.scenario || !output.mcqs || output.mcqs.length === 0) {
      throw new Error('AI failed to generate a complete scenario with MCQs.');
    }
    // Ensure unique IDs for MCQs, prefixing with scenario type for better context
    output.mcqs = output.mcqs.map((mcq, index) => ({
      ...mcq,
      id: `${input.scenarioType.toLowerCase().replace(/\s+/g, '_')}_q${index + 1}`
    }));
    return output;
  }
);
