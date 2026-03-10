// src/lib/db.ts
import 'server-only';
import { Transaction } from './types';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// Initialize Firebase for server-side usage
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// Collection reference
const transactionsCollection = collection(db, 'transactions');

/**
 * Fetches all transactions from Firestore
 */
export async function getTransactionsFromFirestore(): Promise<Transaction[]> {
  try {
    const snapshot = await getDocs(transactionsCollection);
    const transactions: Transaction[] = [];
    snapshot.forEach((doc) => {
      transactions.push(doc.data() as Transaction);
    });
    return transactions;
  } catch (error) {
    console.error('Error fetching transactions from Firestore:', error);
    throw new Error('Could not read from database.');
  }
}

/**
 * Adds a new transaction to Firestore
 */
export async function addTransactionToFirestore(transaction: Transaction): Promise<void> {
  try {
    const docRef = doc(db, 'transactions', transaction.id);
    await setDoc(docRef, transaction);
  } catch (error) {
    console.error('Error adding transaction to Firestore:', error);
    throw new Error('Could not add to database.');
  }
}

/**
 * Updates an existing transaction in Firestore
 */
export async function updateTransactionInFirestore(id: string, data: Partial<Transaction>): Promise<void> {
  try {
    const docRef = doc(db, 'transactions', id);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error('Error updating transaction in Firestore:', error);
    throw new Error('Could not update database.');
  }
}

/**
 * Deletes a transaction from Firestore
 */
export async function deleteTransactionFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'transactions', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting transaction from Firestore:', error);
    throw new Error('Could not delete from database.');
  }
}
