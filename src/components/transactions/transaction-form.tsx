'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { addTransactionToFirestore, updateTransactionInFirestore } from '@/lib/db';
import { getCylinderCosts } from '@/lib/actions';
import { CYLINDER_TYPES, DELIVERY_BOYS, SALE_TYPES, EXPENSE_CATEGORIES, CHIT_HOLDERS, OTHER_PRODUCTS, ACCOUNTANTS, MINI_BANK_DESCRIPTIONS } from '@/lib/constants';
import { TransactionType, CylinderType, Transaction, CylinderCosts, SaleTransaction, PurchaseTransaction, ExpenseTransaction } from '@/lib/types';
import { useAccountantStore } from '@/stores/accountant-store';

const baseSchema = z.object({
  date: z.date(),
  amount: z.coerce.number().positive({ message: 'Amount must be positive.' }),
  accountant: z.enum(ACCOUNTANTS),
});

const saleSchema = z.object({
  type: z.literal('Sale'),
  date: z.date(),
  accountant: z.enum(ACCOUNTANTS),
  cylinderType: z.enum(CYLINDER_TYPES).optional(),
  quantity: z.coerce.number().int().positive().optional(),
  saleType: z.enum(SALE_TYPES, { required_error: 'Sale type is required.' }),
  deliveryBoy: z.enum(DELIVERY_BOYS).optional(),
  otherProduct: z.enum(OTHER_PRODUCTS).optional(),
  amount: z.coerce.number().positive({ message: 'Amount must be positive.' }),
});

const purchaseSchema = z.object({
  type: z.literal('Purchase'),
  date: z.date(),
  accountant: z.enum(ACCOUNTANTS),
  cylinderType: z.enum(CYLINDER_TYPES, { required_error: 'Cylinder type is required.' }),
  quantity: z.coerce.number().int().positive(),
  amount: z.coerce.number().default(0), // Amount will be 0
});

const expenseSchema = baseSchema.extend({
  type: z.literal('Expense'),
  category: z.enum(EXPENSE_CATEGORIES),
  description: z.string().min(1, 'Description is required.'),
  chitHolder: z.enum(CHIT_HOLDERS).optional(),
  miniBankDescription: z.enum(MINI_BANK_DESCRIPTIONS).optional(),
});

const formSchema = z.discriminatedUnion('type', [saleSchema, purchaseSchema, expenseSchema]);

type FormValues = z.infer<typeof formSchema>;

interface TransactionFormProps {
  type: TransactionType;
  onSuccess: () => void;
  transaction?: Transaction | null;
}

export function TransactionForm({ type, onSuccess, transaction }: TransactionFormProps) {
  const { toast } = useToast();
  const isEditMode = !!transaction;
  const [cylinderCosts, setCylinderCosts] = useState<CylinderCosts | null>(null);
  const { accountant } = useAccountantStore();

  useEffect(() => {
    async function fetchCosts() {
      const costs = await getCylinderCosts();
      setCylinderCosts(costs);
    }
    fetchCosts();
  }, []);

  const getDefaultValues = (): FormValues => {
    if (isEditMode && transaction) {
      const base = {
        ...transaction,
        date: new Date(transaction.date),
      };
      switch(transaction.type) {
        case 'Sale':
          return base as SaleTransaction & { date: Date };
        case 'Purchase':
          return base as PurchaseTransaction & { date: Date };
        case 'Expense':
          return base as ExpenseTransaction & { date: Date };
        default:
          throw new Error("Invalid transaction type in edit mode");
      }
    }
    // Create mode
    switch (type) {
      case 'Sale':
        return {
          type: 'Sale',
          date: new Date(),
          accountant: accountant,
          amount: 0,
          quantity: 1,
          saleType: 'Counter Sale',
        };
      case 'Purchase':
        return {
          type: 'Purchase',
          date: new Date(),
          accountant: accountant,
          quantity: 1,
          amount: 0,
          cylinderType: '14.2kg',
        };
      case 'Expense':
        return {
          type: 'Expense',
          date: new Date(),
          accountant: accountant,
          amount: 0,
          category: 'Other',
          description: '',
        };
      default:
        throw new Error("Invalid transaction type in create mode");
    }
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(),
  });
  
  const watchedType = form.watch('type');
  const saleType = watchedType === 'Sale' ? form.watch('saleType') : undefined;
  const cylinderType = (watchedType === 'Sale' || watchedType === 'Purchase') ? form.watch('cylinderType') : undefined;
  const quantity = (watchedType === 'Sale' || watchedType === 'Purchase') ? form.watch('quantity') : undefined;
  const expenseCategory = watchedType === 'Expense' ? form.watch('category') : undefined;


  const isAmountReadOnly = watchedType === 'Sale' && saleType !== 'Other Sale' && !isEditMode;

  useEffect(() => {
    if (!isEditMode && type === 'Sale' && saleType !== 'Other Sale' && cylinderType && quantity && quantity > 0 && cylinderCosts) {
      const cost = cylinderCosts[cylinderType as CylinderType];
      if (cost !== undefined) {
        form.setValue('amount', cost * quantity);
      }
    }
  }, [cylinderType, quantity, type, form, isEditMode, saleType, cylinderCosts]);
  
  useEffect(() => {
    if (isEditMode && transaction) {
      form.reset(getDefaultValues());
    }
  }, [transaction, isEditMode, form]);

  useEffect(() => {
    // When the form type changes (only in create mode), reset the form with new defaults.
    if (!isEditMode) {
      form.reset(getDefaultValues());
    }
  }, [type, isEditMode, form, accountant]);

  const onSubmit = async (data: FormValues) => {
    const payload = { 
      ...data,
      accountant: accountant, // Always use the latest accountant from the store
      date: data.date.toISOString(),
     };
    if (payload.type === 'Purchase') {
      payload.amount = 0;
    }

    try {
      if (isEditMode && transaction) {
        await updateTransactionInFirestore(transaction.id, transaction.type, payload);
        toast({
          title: 'Success!',
          description: `Your ${type.toLowerCase()} has been updated.`,
        });
      } else {
        const transactionWithId = {
          ...payload,
          id: `txn_${Date.now()}`,
        } as any;
        await addTransactionToFirestore(transactionWithId);
        toast({
          title: 'Success!',
          description: `Your ${type.toLowerCase()} has been recorded.`,
        });
      }
      onSuccess();
      form.reset(getDefaultValues());
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Error submitting transaction',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date('1900-01-01')
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        {watchedType === 'Sale' && (
          <>
            <FormField
              control={form.control}
              name="saleType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Sale Type</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                      {SALE_TYPES.map(st => (
                        <FormItem key={st} className="flex items-center space-x-2 space-y-0">
                          <FormControl><RadioGroupItem value={st} /></FormControl>
                          <FormLabel className="font-normal">{st}</FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {saleType === 'Other Sale' ? (
               <>
                <FormField
                  control={form.control}
                  name="otherProduct"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {OTHER_PRODUCTS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
               </>
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="cylinderType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cylinder Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select cylinder" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CYLINDER_TYPES.map(ct => <SelectItem key={ct} value={ct}>{ct}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {saleType === 'Delivery Boy Sale' && (
                  <FormField
                    control={form.control}
                    name="deliveryBoy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Boy</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select delivery boy" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {DELIVERY_BOYS.map(db => <SelectItem key={db} value={db}>{db}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}
             <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (INR)</FormLabel>
                  <FormControl><Input type="number" step="0.01" {...field} readOnly={isAmountReadOnly} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {watchedType === 'Purchase' && (
          <>
            <FormField
              control={form.control}
              name="cylinderType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cylinder Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select cylinder" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {CYLINDER_TYPES.map(ct => <SelectItem key={ct} value={ct}>{ct}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {watchedType === 'Expense' && (
          <>
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             {expenseCategory === 'Chit' && (
              <FormField
                control={form.control}
                name="chitHolder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chit Holder</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select chit holder" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {CHIT_HOLDERS.map(holder => <SelectItem key={holder} value={holder}>{holder}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {expenseCategory === 'Mini Bank Deposits' && (
              <FormField
                control={form.control}
                name="miniBankDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select Bank" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {MINI_BANK_DESCRIPTIONS.map(desc => <SelectItem key={desc} value={desc}>{desc}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (INR)</FormLabel>
                  <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        
        <Button type="submit" className="w-full">{isEditMode ? 'Save Changes' : `Save ${type}`}</Button>
      </form>
    </Form>
  );
}
