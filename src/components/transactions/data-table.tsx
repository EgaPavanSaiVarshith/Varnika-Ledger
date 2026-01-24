'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, MoreHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { Transaction } from '@/lib/types';
import { formatCurrency, exportToCsv } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import TransactionDialog from './transaction-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { deleteTransaction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';

export function DataTable({ data }: { data: Transaction[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([{ id: 'date', desc: true }]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction | null>(null);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (selectedTransaction) {
      try {
        await deleteTransaction(selectedTransaction.id);
        toast({ title: 'Success!', description: 'Transaction deleted successfully.' });
        setIsDeleteDialogOpen(false);
        setSelectedTransaction(null);
        // This will trigger a re-fetch in the parent component
        window.location.reload();
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete transaction.' });
      }
    }
  };

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => {
        const dateValue = row.getValue('date') as string;
        try {
            const date = parseISO(dateValue);
            return format(date, 'dd/MM/yyyy');
        } catch (e) {
            return 'Invalid Date';
        }
      },
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.getValue('type') as string;
        const variant = type === 'Sale' ? 'default' : type === 'Purchase' ? 'secondary' : 'outline';
        return <Badge variant={variant as any}>{type}</Badge>;
      },
    },
    {
      id: 'details',
      header: 'Details',
      cell: ({ row }) => {
        const t = row.original;
        switch (t.type) {
          case 'Sale': {
            const qty = t.quantity ?? '';
            const item = (t.saleType === 'Other Sale' ? t.otherProduct : t.cylinderType) || '';
            const saleSource = t.saleType === 'Delivery Boy Sale' && t.deliveryBoy ? t.deliveryBoy : 'Counter';
            
            if (t.saleType === 'Other Sale') {
                return `Sold ${qty}x ${item}`;
            }
            return `Sold ${qty}x ${item} (${saleSource})`;
          }
          case 'Purchase':
            return `Purchased ${t.quantity}x ${t.cylinderType}`;
          case 'Expense':
            if (t.category === 'Chit' && t.chitHolder) {
              return `${t.category}: ${t.chitHolder} - ${t.description}`;
            }
             if (t.category === 'Mini Bank Deposits' && t.miniBankDescription) {
              return `${t.category}: ${t.miniBankDescription} - ${t.description}`;
            }
            return `${t.category}: ${t.description}`;
          default:
            // Ensure exhaustive check
            return null;
        }
      },
    },
    {
      accessorKey: 'amount',
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('amount'));
        const type = row.original.type;

        if (type === 'Purchase') {
          return <div className="text-right font-medium text-muted-foreground">-</div>;
        }

        const colorClass = type === 'Sale' ? 'text-green-600' : 'text-red-600';
        const prefix = type === 'Sale' ? '+' : '-';

        return <div className={`text-right font-medium ${colorClass}`}>{prefix}{formatCurrency(amount)}</div>;
      },
    },
    {
      accessorKey: 'accountant',
      header: 'Accountant',
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const transaction = row.original;
  
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedTransaction(transaction);
                  setIsEditDialogOpen(true);
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  setSelectedTransaction(transaction);
                  setIsDeleteDialogOpen(true);
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnVisibility,
      globalFilter,
    },
    initialState: {
        pagination: {
            pageSize: 10,
        }
    }
  });

  return (
    <div>
      <div className="flex items-center py-4 gap-2">
        <Input
          placeholder="Filter by details..."
          value={globalFilter ?? ''}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <Button
            variant="outline"
            size="sm"
            className="ml-auto h-8 gap-1"
            onClick={() => exportToCsv(table.getFilteredRowModel().rows.map(r => r.original), 'varnika-ledger-report')}
          >
            <Download className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Export</span>
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>;
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>
      
      {selectedTransaction && (
        <TransactionDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          transaction={selectedTransaction}
          onSuccess={() => {
            setIsEditDialogOpen(false);
            setSelectedTransaction(null);
            // This is a simple way to refresh data on the client
            window.location.reload();
          }}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transaction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedTransaction(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
