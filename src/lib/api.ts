'use server';

import { getTransactionsFromFile } from './db';
import { Transaction, Stock, CylinderType } from './types';
import { CYLINDER_TYPES } from './constants';

// Simulate fetching all transactions
export async function getTransactions(): Promise<Transaction[]> {
  const transactions = await getTransactionsFromFile();
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Simulate calculating account summary
export async function getAccountSummary(transactions: Transaction[]) {
  const totalSales = transactions
    .filter((t) => t.type === 'Sale')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPurchases = transactions
    .filter((t) => t.type === 'Purchase')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter((t) => t.type === 'Expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const closingBalance = totalSales - (totalPurchases + totalExpenses);

  return { totalSales, totalExpenses, closingBalance };
}


// Simulate calculating current stock status
export async function getStockStatus(transactions: Transaction[]): Promise<Stock> {
  const stock = CYLINDER_TYPES.reduce((acc, type) => {
    acc[type] = 0;
    return acc;
  }, {} as Stock);

  transactions.forEach((t) => {
    if (t.type === 'Purchase' && t.cylinderType) {
      stock[t.cylinderType] += t.quantity;
    } else if (t.type === 'Sale' && t.cylinderType) {
      stock[t.cylinderType] -= t.quantity || 0;
    }
  });

  return stock;
}

// Format transactions for AI analysis
export async function formatTransactionsForAI(transactions: Transaction[]): Promise<string> {
    return transactions.map(t => {
        const date = new Date(t.date).toLocaleDateString('en-CA');
        switch (t.type) {
            case 'Sale':
                 if (t.saleType === 'Other Sale') {
                   return `Date: ${date}, Type: Sale, Product: ${t.otherProduct}, Qty: ${t.quantity}, Amount: ${t.amount}`;
                 }
                return `Date: ${date}, Type: Sale, Cylinder: ${t.cylinderType}, Qty: ${t.quantity}, Sale By: ${t.saleType === 'Delivery Boy Sale' ? t.deliveryBoy : 'Counter'}, Amount: ${t.amount}`;
            case 'Purchase':
                return `Date: ${date}, Type: Purchase, Cylinder: ${t.cylinderType}, Qty: ${t.quantity}, Amount: ${t.amount}`;
            case 'Expense':
                return `Date: ${date}, Type: Expense, Category: ${t.category}, Amount: ${t.amount}, Desc: ${t.description}`;
        }
    }).join('\n');
}
