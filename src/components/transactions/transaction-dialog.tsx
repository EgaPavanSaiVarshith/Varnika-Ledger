'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';
import { TransactionForm } from './transaction-form';
import type { Transaction } from '@/lib/types';

interface TransactionDialogProps {
  children?: React.ReactNode;
  transaction?: Transaction | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function TransactionDialog({
  children,
  transaction,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onSuccess,
}: TransactionDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined && setControlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen : setInternalOpen;

  const handleFormSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
    setOpen(false);
  };

  const isEditMode = !!transaction;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Transaction' : 'Add New Transaction'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Modify the transaction details.' : "Record a new sale, purchase, or expense. Click save when you're done."}
          </DialogDescription>
        </DialogHeader>
        {isEditMode && transaction ? (
          <TransactionForm
            type={transaction.type}
            onSuccess={handleFormSuccess}
            transaction={transaction}
          />
        ) : (
          <Tabs defaultValue="sale" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sale">Sale</TabsTrigger>
              <TabsTrigger value="purchase">Purchase</TabsTrigger>
              <TabsTrigger value="expense">Expense</TabsTrigger>
            </TabsList>
            <TabsContent value="sale">
              <TransactionForm type="Sale" onSuccess={handleFormSuccess} />
            </TabsContent>
            <TabsContent value="purchase">
              <TransactionForm type="Purchase" onSuccess={handleFormSuccess} />
            </TabsContent>
            <TabsContent value="expense">
              <TransactionForm type="Expense" onSuccess={handleFormSuccess} />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
