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
  sentiment: z.string().describe("O sentimento atual do mercado (ex: 'Otimista', 'Pessimista', 'Neutro')."),
  trend_prediction: z.string().describe("Uma previsão de tendência de curto prazo (ex: 'Tendência de Alta', 'Tendência de Baixa', 'Movimento Lateral')."),
  summary: z.string().describe('Um resumo conciso explicando a situação atual e os possíveis fatores que influenciam o preço.'),
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
  prompt: `Você é um analista financeiro especialista em criptomoedas.
Sua tarefa é analisar os dados fornecidos para {{cryptoName}} e gerar um relatório conciso em português.
Com base no histórico de preços recente, determine o sentimento do mercado, preveja a tendência de curto prazo e forneça um resumo de sua análise.

Histórico de Preços:
{{#each priceHistory}}
- Data: {{date}}, Preço: {{price}}
{{/each}}

Forneça sua análise no formato estruturado solicitado, em português.`,
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
