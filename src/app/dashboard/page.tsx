export const dynamic = 'force-dynamic';

import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OverviewCards from '@/components/dashboard/overview-cards';
import StockStatus from '@/components/dashboard/stock-status';
import RecentTransactions from '@/components/dashboard/recent-transactions';
import TransactionDialog from '@/components/transactions/transaction-dialog';
import { getTransactions, getAccountSummary, getStockStatus } from '@/lib/api';
import AccountantSelector from '@/components/dashboard/accountant-selector';

export default async function Dashboard({}: {}) {
  const transactions = await getTransactions();
  const [summary, stock] = await Promise.all([
    getAccountSummary(transactions),
    getStockStatus(transactions),
  ]);

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
