import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Stock } from '@/lib/types';
import { CYLINDER_TYPES } from '@/lib/constants';

type StockStatusProps = {
  stock: Stock;
};

export default function StockStatus({ stock }: StockStatusProps) {
  return (
    <Card className="xl:col-span-1">
      <CardHeader>
        <CardTitle>Current Stock</CardTitle>
        <CardDescription>Live inventory of all cylinder types.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cylinder Type</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {CYLINDER_TYPES.map((type) => (
              <TableRow key={type}>
                <TableCell>
                  <div className="font-medium">{type}</div>
                </TableCell>
                <TableCell className="text-right">{stock[type] ?? 0}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
