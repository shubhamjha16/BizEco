
'use server';
/**
 * @fileOverview Generates validation questions to refine a company profile.
 *
 * - generateValidationQuestions - A function that generates MCQs for profile validation.
 * - ValidationQuestionsInput - The input type for the function.
 * - ValidationQuestionsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidationQuestionsInputSchema = z.object({
  companyDescription: z
    .string()
    .describe('The initial description of the company provided by the user.'),
});
export type ValidationQuestionsInput = z.infer<typeof ValidationQuestionsInputSchema>;

const MCQSchema = z.object({
  id: z.string().describe("A unique identifier for the MCQ (e.g., 'validation_q1')."),
  question: z.string().describe('The MCQ question text, aimed at clarifying or expanding on the company profile.'),
  options: z.array(z.string()).min(2).max(4).describe('An array of 2 to 4 distinct answer options for the MCQ.'),
});

const ValidationQuestionsOutputSchema = z.object({
  validationMcqs: z.array(MCQSchema).min(3).max(5).describe('An array of 3 to 5 multiple-choice questions to refine the company profile based on the input description. These questions should aim to fill information gaps or clarify ambiguities.'),
});
export type ValidationQuestionsOutput = z.infer<typeof ValidationQuestionsOutputSchema>;

export async function generateValidationQuestions(input: ValidationQuestionsInput): Promise<ValidationQuestionsOutput> {
  return validationQuestionsFlow(input);
}

const validationPrompt = ai.definePrompt({
  name: 'validationQuestionsPrompt',
  input: {schema: ValidationQuestionsInputSchema},
  output: {schema: ValidationQuestionsOutputSchema},
  prompt: `You are a business analyst. Based on the initial company description provided, your task is to generate 3 to 5 multiple-choice questions (MCQs).
These MCQs should aim to:
1. Clarify any ambiguities in the description.
2. Fill potential information gaps crucial for understanding the business context.
3. Delve deeper into key aspects mentioned (e.g., if "challenges" are generic, ask for specifics; if "focus" is broad, ask for narrower targets).
The goal is to obtain a richer, more detailed company profile that can be used for a business simulation.

Consider aspects like:
- Specificity of challenges (e.g., if "competition" is mentioned, ask about the nature/source of competition).
- Target market/audience details.
- Unique selling propositions or key competitive advantages.
- Key resources, operational scale, or team size.
- Recent significant events, strategic shifts, or specific goals not mentioned.
- Company's current stage (e.g., startup, growth, mature).

For each MCQ:
- Create a unique ID (e.g., 'validation_q1', 'validation_q2').
- Formulate a clear, concise question directly related to refining the provided company description.
- Provide 2 to 4 distinct and plausible answer options. The options should help narrow down or specify information.

Initial Company Description:
{{{companyDescription}}}

Generate the MCQs to refine this profile.
`,
});

const validationQuestionsFlow = ai.defineFlow(
  {
    name: 'validationQuestionsFlow',
    inputSchema: ValidationQuestionsInputSchema,
    outputSchema: ValidationQuestionsOutputSchema,
  },
  async (input) => {
    const {output} = await validationPrompt(input);
    if (!output || !output.validationMcqs || output.validationMcqs.length === 0) {
      throw new Error('AI failed to generate validation questions.');
    }
    // Ensure unique IDs for MCQs
    output.validationMcqs = output.validationMcqs.map((mcq, index) => ({
      ...mcq,
      id: mcq.id || `validation_q${index + 1}`
    }));
    return output;
  }
);
