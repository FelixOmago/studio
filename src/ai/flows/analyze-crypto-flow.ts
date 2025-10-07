'use server';
/**
 * @fileOverview An AI flow to analyze cryptocurrency data.
 *
 * - analyzeCrypto - A function that handles the crypto analysis process.
 * - AnalyzeCryptoInput - The input type for the analyzeCrypto function.
 * - AnalyzeCryptoOutput - The return type for the analyzeCrypto function.
 */

import { ai } from '@/ai/genkit';
import type { CryptoDataPoint } from '@/lib/data';
import { z } from 'zod';

const AnalyzeCryptoInputSchema = z.object({
  cryptoName: z.string().describe('The name of the cryptocurrency to analyze.'),
  priceHistory: z.array(z.object({
      date: z.string(),
      price: z.number(),
  })).describe('The recent price history of the cryptocurrency.'),
});
export type AnalyzeCryptoInput = z.infer<typeof AnalyzeCryptoInputSchema>;

const AnalyzeCryptoOutputSchema = z.object({
  sentiment: z.string().describe("The current market sentiment (e.g., 'Bullish', 'Bearish', 'Neutral')."),
  trend_prediction: z.string().describe("A short-term trend prediction (e.g., 'Upward Trend', 'Downward Trend', 'Sideways Movement')."),
  summary: z.string().describe('A concise summary explaining the current situation and potential factors influencing the price.'),
});
export type AnalyzeCryptoOutput = z.infer<typeof AnalyzeCryptoOutputSchema>;


export async function analyzeCrypto(
  input: AnalyzeCryptoInput
): Promise<AnalyzeCryptoOutput> {
  return analyzeCryptoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeCryptoPrompt',
  input: { schema: AnalyzeCryptoInputSchema },
  output: { schema: AnalyzeCryptoOutputSchema },
  prompt: `You are an expert financial analyst specializing in cryptocurrency.
Your task is to analyze the provided data for {{cryptoName}} and generate a concise report.
Based on the recent price history, determine the market sentiment, predict the short-term trend, and provide a summary of your analysis.

Price History:
{{#each priceHistory}}
- Date: {{date}}, Price: {{price}}
{{/each}}

Provide your analysis in the structured format requested.`,
});

const analyzeCryptoFlow = ai.defineFlow(
  {
    name: 'analyzeCryptoFlow',
    inputSchema: AnalyzeCryptoInputSchema,
    outputSchema: AnalyzeCryptoOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
