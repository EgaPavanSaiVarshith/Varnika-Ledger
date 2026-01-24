'use server';

/**
 * @fileOverview AI-powered cost savings analysis for Varnika Ledger users.
 *
 * - analyzeTransactions - Analyzes transaction history to identify potential cost savings.
 * - CostSavingsAnalysisInput - The input type for the analyzeTransactions function.
 * - CostSavingsAnalysisOutput - The return type for the analyzeTransactions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CostSavingsAnalysisInputSchema = z.object({
  transactionHistory: z
    .string()
    .describe(
      'A detailed history of all transactions, including purchases, sales (counter and delivery boy), and expenses (wages, diesel, electricity, chit, etc.). The data should be formatted as a string, with each transaction on a new line. Include cylinder types and quantities for sales and purchases, and categories for expenses.'
    ),
});
export type CostSavingsAnalysisInput = z.infer<typeof CostSavingsAnalysisInputSchema>;

const CostSavingsAnalysisOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A detailed, insightful summary of the financial data. Highlight key trends, significant expense categories, and overall profitability. Provide a clear, concise overview of the business\'s financial health based on the data.'
    ),
  recommendations: z
    .string()
    .describe(
      'A bulleted list of 3-5 specific, actionable recommendations for optimizing spending and improving profitability. Each recommendation should be clear, practical, and directly linked to the transaction data. For example, suggest ways to reduce diesel costs, optimize inventory, or manage daily wages more effectively.'
    ),
});
export type CostSavingsAnalysisOutput = z.infer<typeof CostSavingsAnalysisOutputSchema>;

export async function analyzeTransactions(
  input: CostSavingsAnalysisInput
): Promise<CostSavingsAnalysisOutput> {
  return costSavingsAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'costSavingsAnalysisPrompt',
  input: {schema: CostSavingsAnalysisInputSchema},
  output: {schema: CostSavingsAnalysisOutputSchema},
  prompt: `You are an expert financial analyst specializing in optimizing operations for a small gas agency in India. Your name is "Ledger-Bot".

You will analyze the provided transaction history for "Varnika Indane Gramin Vitarak" to identify potential cost savings, operational inefficiencies, and opportunities for profit maximization.

Your analysis should be sharp, insightful, and tailored to the context of a local Indian gas distributor.

Analyze the following transaction data:
Transaction History:
{{{transactionHistory}}}

Based on your analysis, provide:
1.  **Summary:** A detailed, insightful summary of the financial data. Highlight key trends, significant expense categories, and overall profitability. Provide a clear, concise overview of the business's financial health.
2.  **Recommendations:** A bulleted list of 3-5 specific, actionable recommendations for optimizing spending and improving profitability. Each recommendation must be practical and directly linked to the provided data.

Adopt a professional, encouraging, and helpful tone. Start your response with "Hello, I'm Ledger-Bot, your AI financial analyst."
`,
});

const costSavingsAnalysisFlow = ai.defineFlow(
  {
    name: 'costSavingsAnalysisFlow',
    inputSchema: CostSavingsAnalysisInputSchema,
    outputSchema: CostSavingsAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
