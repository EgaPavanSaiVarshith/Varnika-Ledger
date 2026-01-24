import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingDown, IndianRupee, HandCoins } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

type OverviewCardsProps = {
  summary: {
    totalSales: number;
    totalExpenses: number;
    closingBalance: number;
  };
};

export default function OverviewCards({ summary }: OverviewCardsProps) {
  const { totalSales, totalExpenses, closingBalance } = summary;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          <HandCoins className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
          <p className="text-xs text-muted-foreground">Total revenue from sales</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
          <p className="text-xs text-muted-foreground">Total operational costs</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Closing Balance</CardTitle>
          <IndianRupee className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${closingBalance >= 0 ? 'text-green-600' : 'text-destructive'}`}>
            {formatCurrency(closingBalance)}
          </div>
          <p className="text-xs text-muted-foreground">Net profit/loss</p>
        </CardContent>
      </Card>
    </>
  );
}
