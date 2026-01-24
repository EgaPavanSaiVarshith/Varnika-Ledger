import { Transaction, CylinderCosts } from './types';
import { CYLINDER_TYPES } from './constants';

// Mock data for transactions
// This is now deprecated and will be removed. Data is stored in /src/data/transactions.json
export const mockTransactions: Transaction[] = [];

// Mock data for cylinder costs. In a real app, this would be in a database.
export const mockCylinderCosts: CylinderCosts = {
    '14.2kg': 900,
    '19kg (Commercial)': 1800,
    '10kg': 700,
    '5kg': 300,
};
