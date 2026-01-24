import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';

type RecentTransactionsProps = {
  transactions: Transaction[];
};

function getTransactionDescription(t: Transaction): string {
  switch (t.type) {
    case 'Sale': {
      const qty = t.quantity ?? '';
      const item = (t.saleType === 'Other Sale' ? t.otherProduct : t.cylinderType) || 'item';
      return `${qty} x ${item} sold`;
    }
    case 'Purchase':
      return `${t.quantity} x ${t.cylinderType} bought`;
    case 'Expense':
      return t.category;
    default:
      return 'Unknown Transaction';
  }
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card className="xl:col-span-2">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>An overview of the latest financial activities.</CardDescription>
        </div>
        <Button asChild size="sm" className="ml-auto gap-1">
          <Link href="/dashboard/reports">
            View All
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Details</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  <div className="font-medium">{getTransactionDescription(t)}</div>
                  <div className="text-sm text-muted-foreground">
                    {format(parseISO(t.date), "do MMMM, yyyy")}
                  </div>
                </TableCell>
                <TableCell className={`text-right font-medium ${t.type === 'Sale' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.type === 'Sale' ? '+' : '-'}
                  {formatCurrency(t.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
