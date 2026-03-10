'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OverviewCards from '@/components/dashboard/overview-cards';
import StockStatus from '@/components/dashboard/stock-status';
import RecentTransactions from '@/components/dashboard/recent-transactions';
import TransactionDialog from '@/components/transactions/transaction-dialog';
import { getAccountSummary, getStockStatus } from '@/lib/api';
import { getTransactionsFromFirestore } from '@/lib/db';
import { formatTransactionsForAIAction } from '@/lib/actions';
import { DataTable } from '@/components/transactions/data-table';
import AccountantSelector from '@/components/dashboard/accountant-selector';
import type { Transaction, Stock } from '@/lib/types';

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({ totalSales: 0, totalExpenses: 0, closingBalance: 0 });
  const [stock, setStock] = useState<Stock>({
    "14.2kg": 0,
    "19kg (Commercial)": 0,
    "10kg": 0,
    "5kg": 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const txs = await getTransactionsFromFirestore();
        const [sum, stk] = await Promise.all([
          getAccountSummary(txs),
          getStockStatus(txs),
        ]);
        setTransactions(txs);
        setSummary(sum);
        setStock(stk);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold md:text-2xl font-headline">Dashboard</h1>
          <AccountantSelector />
        </div>
        <TransactionDialog>
          <Button size="sm" className="h-8 gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Transaction</span>
          </Button>
        </TransactionDialog>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <OverviewCards summary={summary} />
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <RecentTransactions transactions={transactions.slice(0, 6)} />
        <StockStatus stock={stock} />
      </div>
    </>
  );
}

