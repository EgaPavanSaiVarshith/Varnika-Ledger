import { Transaction, CylinderCosts } from './types';
import { CYLINDER_TYPES } from './constants';

// Mock data for transactions
// This is now deprecated and will be removed. Data is stored in /src/data/transactions.json
export const mockTransactions: Transaction[] = [];

// Mock data for cylinder costs. In a real app, this would be in a database.
export const mockCylinderCosts: CylinderCosts = {
    '14.2kg': 960,
    '19kg (Commercial)': 2500,
    '10kg': 850,
    '5kg': 450,
};
