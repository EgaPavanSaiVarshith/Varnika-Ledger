export const dynamic = 'force-dynamic';

import { getTransactions } from '@/lib/api';
import { DataTable } from '@/components/transactions/data-table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function ReportsPage({}: {}) {
  const transactions = await getTransactions();

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
