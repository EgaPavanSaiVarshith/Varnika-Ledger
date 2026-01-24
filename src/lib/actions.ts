'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getTransactionsFromFile, saveTransactionsToFile } from './db';
import { mockCylinderCosts } from './data';
import { Transaction, CylinderCosts } from './types';
import { CHIT_HOLDERS, OTHER_PRODUCTS, CYLINDER_TYPES, EXPENSE_CATEGORIES, SALE_TYPES, MINI_BANK_DESCRIPTIONS, DELIVERY_BOYS, ACCOUNTANTS } from './constants';


const saleSchema = z.object({
  type: z.literal('Sale'),
  date: z.string(),
  accountant: z.enum(ACCOUNTANTS),
  cylinderType: z.enum(CYLINDER_TYPES).optional(),
  quantity: z.coerce.number().optional(),
  saleType: z.enum(SALE_TYPES),
  deliveryBoy: z.enum(DELIVERY_BOYS).optional(),
  amount: z.coerce.number(),
  otherProduct: z.enum(OTHER_PRODUCTS).optional(),
});

const purchaseSchema = z.object({
  type: z.literal('Purchase'),
  date: z.string(),
  accountant: z.enum(ACCOUNTANTS),
  cylinderType: z.enum(CYLINDER_TYPES),
  quantity: z.coerce.number(),
  amount: z.coerce.number().default(0),
});

const expenseSchema = z.object({
  type: z.literal('Expense'),
  date: z.string(),
  accountant: z.enum(ACCOUNTANTS),
  category: z.enum(EXPENSE_CATEGORIES),
  description: z.string(),
  amount: z.coerce.number(),
  chitHolder: z.enum(CHIT_HOLDERS).optional(),
  miniBankDescription: z.enum(MINI_BANK_DESCRIPTIONS).optional(),
});

const transactionSchema = z.discriminatedUnion('type', [saleSchema, purchaseSchema, expenseSchema]);


export async function addTransaction(data: unknown) {
  const newTransactionData = transactionSchema.parse(data);

  const transactionWithId = {
    ...newTransactionData,
    id: `txn_${Date.now()}`,
  } as Transaction;

  console.log('New transaction added:', transactionWithId);

  const transactions = await getTransactionsFromFile();
  transactions.unshift(transactionWithId);
  await saveTransactionsToFile(transactions);

  revalidatePath('/', 'layout');
}

export async function updateTransaction(id: string, data: unknown) {
    const updatedTransactionData = transactionSchema.parse(data);
    const transactions = await getTransactionsFromFile();
    const index = transactions.findIndex(t => t.id === id);

    if (index === -1) {
        throw new Error('Transaction not found');
    }

    const existingTransaction = transactions[index];
    
    transactions[index] = {
        ...existingTransaction,
        ...updatedTransactionData,
    } as Transaction;

    await saveTransactionsToFile(transactions);
    console.log('Transaction updated:', transactions[index]);

    revalidatePath('/', 'layout');
}

export async function deleteTransaction(id: string) {
    let transactions = await getTransactionsFromFile();
    const index = transactions.findIndex(t => t.id === id);
    if (index > -1) {
        transactions.splice(index, 1);
        await saveTransactionsToFile(transactions);
        console.log('Transaction deleted:', id);
        revalidatePath('/', 'layout');
    } else {
        throw new Error('Transaction not found');
    }
}

export async function getCylinderCosts(): Promise<CylinderCosts> {
  // In a real app, this would fetch from a database or a config file
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockCylinderCosts);
    }, 50);
  });
}

export async function updateCylinderCosts(newCosts: CylinderCosts): Promise<void> {
  // In a real app, you would save this to a database
  console.log('Updating cylinder costs:', newCosts);
  Object.assign(mockCylinderCosts, newCosts);
  revalidatePath('/dashboard/settings');
  revalidatePath('/dashboard/transactions'); // Revalidate pages that use the costs
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, 50);
  });
}
