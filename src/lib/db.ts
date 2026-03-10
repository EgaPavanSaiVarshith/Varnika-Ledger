// src/lib/db.ts
import fs from 'fs/promises';
import path from 'path';
import { Transaction } from './types';

// The path to the JSON file that will act as our database
const dbPath = path.join(process.cwd(), 'src', 'data', 'transactions.json');

// In-memory cache to avoid re-reading the file on every request
let cachedTransactions: Transaction[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5000; // 5 seconds

/**
 * Reads all transactions from the JSON file with in-memory caching.
 * @returns {Promise<Transaction[]>} A promise that resolves to an array of transactions.
 */
export async function getTransactionsFromFile(): Promise<Transaction[]> {
  const now = Date.now();
  if (cachedTransactions !== null && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedTransactions;
  }

  try {
    const fileContents = await fs.readFile(dbPath, 'utf8');
    // If the file is empty, return an empty array
    if (!fileContents) {
      cachedTransactions = [];
      cacheTimestamp = now;
      return [];
    }
    const parsed = JSON.parse(fileContents);
    cachedTransactions = parsed;
    cacheTimestamp = now;
    return parsed;
  } catch (error: any) {
    // If the file doesn't exist (e.g., on first run), return an empty array
    if (error.code === 'ENOENT') {
      await saveTransactionsToFile([]); // Create the file
      return [];
    }
    // For any other errors, log them and re-throw
    console.error('Error reading from the database:', error);
    throw new Error('Could not read from database.');
  }
}

/**
 * Writes an array of transactions to the JSON file.
 * This will overwrite the existing contents of the file.
 * @param {Transaction[]} transactions - The array of transactions to save.
 * @returns {Promise<void>} A promise that resolves when the file has been written.
 */
export async function saveTransactionsToFile(transactions: Transaction[]): Promise<void> {
  try {
    const data = JSON.stringify(transactions, null, 2); // Pretty-print the JSON
    await fs.writeFile(dbPath, data, 'utf8');
    // Invalidate cache so next read gets fresh data
    cachedTransactions = transactions;
    cacheTimestamp = Date.now();
  } catch (error) {
    console.error('Error writing to the database:', error);
    throw new Error('Could not write to database.');
  }
}
