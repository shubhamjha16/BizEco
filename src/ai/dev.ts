
import { config } from 'dotenv';
config();

import '@/ai/flows/scenario-generator.ts';
import '@/ai/flows/report-generation.ts';
import '@/ai/flows/evaluate-scenario-decision.ts';
import '@/ai/flows/generate-validation-questions.ts';
