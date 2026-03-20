// src/lib/db.ts
import { Transaction } from './types';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, updateDoc, query, orderBy, getDoc } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

// Collection references
export const salesCollection = collection(db, 'sales');
export const purchasesCollection = collection(db, 'purchases');
export const expensesCollection = collection(db, 'expenses');
export const settingsCollection = collection(db, 'settings');

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

/**
 * Gets the prices (Cylinder and Other Products) from Firestore
 */
export async function getPricesFromFirestore(monthStr: string) {
  try {
    const docRef = doc(db, 'settings', monthStr);
    const docSnap = await getDoc(docRef);
    
    const defaultCylinderCosts = {
      '14.2kg': 960,
      '19kg (Commercial)': 2500,
      '10kg': 850,
      '5kg': 450,
    };
    
    const defaultOtherPrices = {
      'PR': 350,
      'PIPE': 200,
      'Deactivation': 200,
      'Sales of gas book': 100,
      'Lighter': 0,
      'Stoves': 0,
      'Unloading charges from driver': 0
    };

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        cylinderCosts: data.cylinderCosts || defaultCylinderCosts,
        otherProductPrices: data.otherProductPrices || defaultOtherPrices
      };
    }
    
    return {
      cylinderCosts: defaultCylinderCosts,
      otherProductPrices: defaultOtherPrices
    };
  } catch (error) {
    console.error('Error in getPricesFromFirestore:', error);
    return {
      cylinderCosts: { '14.2kg': 960, '19kg (Commercial)': 2500, '10kg': 850, '5kg': 450 },
      otherProductPrices: { 'PR': 350, 'PIPE': 200, 'Deactivation': 200, 'Sales of gas book': 100 }
    };
  }
}

/**
 * Updates prices in Firestore
 */
export async function updatePricesInFirestore(monthStr: string, prices: any): Promise<void> {
  try {
    const docRef = doc(db, 'settings', monthStr);
    await setDoc(docRef, prices, { merge: true });
  } catch (error) {
    console.error('Error updating prices:', error);
    throw new Error('Could not update settings in database.');
  }
}
