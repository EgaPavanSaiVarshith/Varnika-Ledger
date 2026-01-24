import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Transaction, SaleTransaction, PurchaseTransaction, ExpenseTransaction } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}

function escapeCsvCell(cell: any): string {
  const cellStr = String(cell ?? '');
  if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
    return `"${cellStr.replace(/"/g, '""')}"`;
  }
  return cellStr;
}

export function exportToCsv(data: Transaction[], filename: string) {
  if (data.length === 0) {
    alert('No data to export.');
    return;
  }

  // Calculate totals first
  const totalSales = data.filter(t => t.type === 'Sale').reduce((sum, t) => sum + t.amount, 0);
  const totalPurchasesValue = data.filter(t => t.type === 'Purchase').reduce((sum, t) => sum + t.amount, 0); // This is usually 0 based on current logic, but good to have
  const totalExpenses = data.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
  const closingBalance = totalSales - totalPurchasesValue - totalExpenses;

  let csvContent = 'Financial Summary\n';
  const summaryHeaders = ['Description', 'Amount'];
  csvContent += summaryHeaders.map(escapeCsvCell).join(',') + '\n';
  const summaryData = [
      ['Total Sales', totalSales],
      ['Total Expenses', totalExpenses],
      ['Closing Balance', closingBalance]
  ];
  summaryData.forEach(row => {
      csvContent += row.map(escapeCsvCell).join(',') + '\n';
  });
  csvContent += '\n\n';


  csvContent += 'All Transactions\n';
  const allTransactionsHeaders = [
    'Date',
    'Accountant',
    'Type', 
    'Category/Product', 
    'Details', 
    'Quantity', 
    'Sale Type', 
    'Delivery Boy', 
    'Credit (+)', 
    'Debit (-)'
  ];
  csvContent += allTransactionsHeaders.map(escapeCsvCell).join(',') + '\n';

  data.forEach(t => {
    let row: (string | number | undefined)[] = [
      new Date(t.date).toLocaleDateString('en-GB'),
      t.accountant,
      t.type,
    ];
    let credit = '';
    let debit = '';

    switch (t.type) {
      case 'Sale':
        credit = t.amount.toString();
        row = [
          ...row,
          t.otherProduct || t.cylinderType,
          `Sold ${t.quantity || ''}x ${t.otherProduct || t.cylinderType}`,
          t.quantity,
          t.saleType,
          t.deliveryBoy || 'Counter',
          credit,
          debit
        ];
        break;
      case 'Purchase':
        // Purchases do not affect the balance directly in this model, but are listed
        debit = ''; // Or t.amount if it were tracked
        row = [
          ...row,
          t.cylinderType,
          `Purchased ${t.quantity}x ${t.cylinderType}`,
          t.quantity,
          'N/A',
          'N/A',
          credit,
          debit
        ];
        break;
      case 'Expense':
        debit = t.amount.toString();
        row = [
          ...row,
          t.category,
          t.description,
          'N/A',
          'N/A',
          'N/A',
          credit,
          debit
        ];
        break;
    }
    csvContent += row.map(escapeCsvCell).join(',') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
