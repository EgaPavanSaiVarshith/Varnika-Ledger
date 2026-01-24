// src/app/dashboard/analysis/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';
import { getTransactions, formatTransactionsForAI } from '@/lib/api';
import { analyzeTransactions } from '@/ai/flows/cost-savings-analysis';
import type { CostSavingsAnalysisOutput } from '@/ai/flows/cost-savings-analysis';

export default function AnalysisPage() {
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CostSavingsAnalysisOutput | null>(null);
  const { toast } = useToast();

  const handleAnalysis = async () => {
    setLoading(true);
    setAnalysisResult(null);
    try {
      const transactions = await getTransactions();
      if (transactions.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Analysis Failed',
          description: 'There are no transactions to analyze.',
        });
        return;
      }
      const formattedData = await formatTransactionsForAI(transactions);
      const result = await analyzeTransactions({ transactionHistory: formattedData });
      setAnalysisResult(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'An unexpected error occurred while analyzing transactions.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">
          AI Financial Analysis
        </h1>
        <Button onClick={handleAnalysis} disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Analyze Transactions
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analysis & Recommendations</CardTitle>
          <CardDescription>
            Click the button above to run an AI-powered analysis on your complete transaction history. The AI will identify potential cost savings and suggest actionable improvements.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading && (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
               <p className="ml-4 text-muted-foreground">The AI is analyzing your data... this may take a moment.</p>
            </div>
          )}

          {analysisResult && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Analysis Summary</h3>
                <Textarea
                  readOnly
                  value={analysisResult.summary}
                  className="w-full h-32 bg-secondary border-none"
                />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Actionable Recommendations</h3>
                <Textarea
                  readOnly
                  value={analysisResult.recommendations}
                  className="w-full h-48 bg-secondary border-none"
                />
              </div>
            </div>
          )}
           {!loading && !analysisResult && (
             <div className="text-center text-muted-foreground py-8">
                Your analysis results will appear here.
             </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
