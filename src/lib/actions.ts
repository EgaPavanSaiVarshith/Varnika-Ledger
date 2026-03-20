'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { 
  getTransactionsFromFirestore, 
  addTransactionToFirestore, 
  updateTransactionInFirestore, 
  deleteTransactionFromFirestore,
  getCylinderCostsFromFirestore,
  updateCylinderCostsInFirestore
} from './db';
import { mockCylinderCosts } from './data';
import { Transaction, CylinderCosts } from './types';
import { CHIT_HOLDERS, OTHER_PRODUCTS, CYLINDER_TYPES, EXPENSE_CATEGORIES, SALE_TYPES, MINI_BANK_DESCRIPTIONS, DELIVERY_BOYS, ACCOUNTANTS } from './constants';


// Server action for client components to fetch transactions
export async function getTransactionsAction() {
  const transactions = await getTransactionsFromFirestore();
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function formatTransactionsForAIAction(transactions: Transaction[]) {
  // We can just import and call the regular server function from here
  const { formatTransactionsForAI } = await import('./api');
  return formatTransactionsForAI(transactions);
}

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

  console.log('Adding new transaction to Firestore:', transactionWithId.id);
  await addTransactionToFirestore(transactionWithId);

  revalidatePath('/', 'layout');
}

export async function updateTransaction(id: string, type: string, data: unknown) {
    const updatedTransactionData = transactionSchema.parse(data);
    
    console.log('Updating transaction in Firestore:', id);
    await updateTransactionInFirestore(id, type, updatedTransactionData);

    revalidatePath('/', 'layout');
}

export async function deleteTransaction(id: string, type: string) {
    console.log('Deleting transaction from Firestore:', id);
    await deleteTransactionFromFirestore(id, type);
    
    revalidatePath('/', 'layout');
}

export async function getCylinderCosts(): Promise<CylinderCosts> {
  const costs = await getCylinderCostsFromFirestore();
  return costs as CylinderCosts;
}

export async function updateCylinderCosts(newCosts: CylinderCosts): Promise<void> {
  console.log('Updating cylinder costs in Firestore:', newCosts);
  await updateCylinderCostsInFirestore(newCosts);
  revalidatePath('/dashboard/settings');
  revalidatePath('/dashboard/transactions'); // Revalidate pages that use the costs
}
