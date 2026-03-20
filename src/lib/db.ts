// src/lib/db.ts
import { Transaction } from './types';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

// Collection references
export const salesCollection = collection(db, 'sales');
export const purchasesCollection = collection(db, 'purchases');
export const expensesCollection = collection(db, 'expenses');

/**
 * Fetches all transactions from Firestore by combining sales, purchases, and expenses.
 * Note: This may fail on the server if security rules require authentication.
 */
export async function getTransactionsFromFirestore(): Promise<Transaction[]> {
  try {
    const [salesSnap, purchasesSnap, expensesSnap] = await Promise.all([
      getDocs(query(salesCollection, orderBy('date', 'desc'))),
      getDocs(query(purchasesCollection, orderBy('date', 'desc'))),
      getDocs(query(expensesCollection, orderBy('date', 'desc')))
    ]);

    const transactions: Transaction[] = [];
    
    salesSnap.forEach(doc => transactions.push({ ...doc.data(), id: doc.id, type: 'Sale' } as Transaction));
    purchasesSnap.forEach(doc => transactions.push({ ...doc.data(), id: doc.id, type: 'Purchase' } as Transaction));
    expensesSnap.forEach(doc => transactions.push({ ...doc.data(), id: doc.id, type: 'Expense' } as Transaction));

    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error fetching transactions from Firestore:', error);
    throw new Error('Could not read from database.');
  }
}

/**
 * Adds a new transaction to Firestore in the appropriate collection
 */
export async function addTransactionToFirestore(transaction: Transaction): Promise<void> {
  try {
    const collectionName = transaction.type === 'Sale' ? 'sales' : transaction.type === 'Purchase' ? 'purchases' : 'expenses';
    const docRef = doc(db, collectionName, transaction.id);
    const cleanData = Object.fromEntries(Object.entries(transaction).filter(([_, v]) => v !== undefined));
    await setDoc(docRef, cleanData);
  } catch (error) {
    console.error('Error adding transaction to Firestore:', error);
    throw new Error('Could not add to database.');
  }
}

/**
 * Updates an existing transaction in Firestore
 */
export async function updateTransactionInFirestore(id: string, type: string, data: Partial<Transaction>): Promise<void> {
  try {
    const collectionName = type === 'Sale' ? 'sales' : type === 'Purchase' ? 'purchases' : 'expenses';
    const docRef = doc(db, collectionName, id);
    const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
    await updateDoc(docRef, cleanData);
  } catch (error) {
    console.error('Error updating transaction in Firestore:', error);
    throw new Error('Could not update database.');
  }
}

/**
 * Deletes a transaction from Firestore
 */
export async function deleteTransactionFromFirestore(id: string, type: string): Promise<void> {
  try {
    const collectionName = type === 'Sale' ? 'sales' : type === 'Purchase' ? 'purchases' : 'expenses';
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting transaction from Firestore:', error);
    throw new Error('Could not delete from database.');
  }
}
