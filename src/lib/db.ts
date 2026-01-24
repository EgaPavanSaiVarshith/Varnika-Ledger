// src/lib/db.ts
import fs from 'fs/promises';
import path from 'path';
import { Transaction } from './types';

// The path to the JSON file that will act as our database
const dbPath = path.join(process.cwd(), 'src', 'data', 'transactions.json');

/**
 * Reads all transactions from the JSON file.
 * @returns {Promise<Transaction[]>} A promise that resolves to an array of transactions.
 */
export async function getTransactionsFromFile(): Promise<Transaction[]> {
  try {
    const fileContents = await fs.readFile(dbPath, 'utf8');
    // If the file is empty, return an empty array
    if (!fileContents) {
      return [];
    }
    return JSON.parse(fileContents);
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
  } catch (error) {
    console.error('Error writing to the database:', error);
    throw new Error('Could not write to database.');
  }
}
