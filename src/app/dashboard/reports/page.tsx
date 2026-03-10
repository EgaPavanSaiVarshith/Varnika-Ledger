'use client';

import { useState, useEffect } from 'react';
import { getTransactionsFromFirestore } from '@/lib/db';
import { DataTable } from '@/components/transactions/data-table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import type { Transaction } from '@/lib/types';

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTransactionsFromFirestore().then(setTransactions).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
       <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Reports</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>
            A detailed log of all sales, purchases, and expenses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable data={transactions} />
        </CardContent>
      </Card>
    </div>
  );
}

