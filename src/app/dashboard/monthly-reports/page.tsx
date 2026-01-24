// src/app/dashboard/monthly-reports/page.tsx
'use client';
import { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getTransactions } from '@/lib/api';
import { DataTable } from '@/components/transactions/data-table';
import type { Transaction } from '@/lib/types';
import OverviewCards from '@/components/dashboard/overview-cards';
import { Loader2 } from 'lucide-react';

export default function MonthlyReportsPage() {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  const currentYear = new Date().getFullYear();
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => {
    const date = new Date(currentYear, i, 1);
    return {
      value: `${currentYear}-${String(i + 1).padStart(2, '0')}`,
      name: date.toLocaleString('default', { month: 'long' }),
      longName: date.toLocaleString('default', { month: 'long', year: 'numeric' }),
    };
  }), [currentYear]);

  const [selectedMonth, setSelectedMonth] = useState<string>(
    `${currentYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  );

  useEffect(() => {
    setLoading(true);
    getTransactions().then((data) => {
      setAllTransactions(data);
      setLoading(false);
    });
  }, []);

  const { filteredTransactions, summary } = useMemo(() => {
    const yearTransactions = allTransactions.filter(t => new Date(t.date).getFullYear() === currentYear);

    const filtered = yearTransactions.filter((t) => {
      const date = new Date(t.date);
      const monthYear = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, '0')}`;
      return monthYear === selectedMonth;
    });

    const currentSummary = {
      totalSales: filtered.filter(t => t.type === 'Sale').reduce((sum, t) => sum + t.amount, 0),
      totalExpenses: filtered.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0),
      closingBalance: filtered.filter(t => t.type === 'Sale').reduce((sum, t) => sum + t.amount, 0) - filtered.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0),
    };
    return { filteredTransactions: filtered, summary: currentSummary };
  }, [allTransactions, selectedMonth, currentYear]);
  
  const selectedMonthLongName = useMemo(() => {
      const monthData = months.find(m => m.value === selectedMonth);
      return monthData ? monthData.longName : '';
  }, [selectedMonth, months]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between flex-col sm:flex-row sm:items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline mb-4 sm:mb-0">
          Monthly Reports for {currentYear}
        </h1>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select a month" />
            </SelectTrigger>
            <SelectContent>
                {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                        {month.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <OverviewCards summary={summary} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions for {selectedMonthLongName}</CardTitle>
          <CardDescription>
            A detailed log of all activities for the selected month.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable data={filteredTransactions} />
        </CardContent>
      </Card>
    </div>
  );
}
