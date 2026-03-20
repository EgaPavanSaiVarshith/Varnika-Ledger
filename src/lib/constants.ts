export const CYLINDER_TYPES = ['14.2kg', '19kg (Commercial)', '10kg', '5kg'] as const;
export const OTHER_PRODUCTS = ['PR', 'PIPE', 'Lighter', 'Deactivation', 'Sales of gas book', 'Stoves', 'Unloading charges from driver'] as const;

export const OTHER_PRODUCT_PRICES: Record<string, number> = {
  'PR': 350,
  'PIPE': 200,
  'Deactivation': 200,
  'Sales of gas book': 100,
  'Unloading charges from driver': 0, // Assuming 0 as default if not specified
};
export const DELIVERY_BOYS = ['Upender', 'Veerababu', 'Srinivas'] as const;
export const SALE_TYPES = ['Counter Sale', 'Delivery Boy Sale', 'Other Sale'] as const;
export const EXPENSE_CATEGORIES = ['Daily Wages', 'Diesel', 'Electricity Bill', 'Chit', 'Internet Bill', 'Salaries', 'Fee for Auditor', 'Vehicle Maintenance', 'Mini Bank Deposits', 'Other'] as const;
export const CHIT_HOLDERS = ['Badri', 'Venkateshwarlu', 'Sridhar', 'Erukulla chits'] as const;
export const MINI_BANK_DESCRIPTIONS = ['SBI Pay', 'KNR Deposit'] as const;
export const ACCOUNTANTS = ['Ega Kanya Kumari', 'Ega Vjaya Kumari', 'Anil Kumar', 'Anand Kumar', 'Ashok Kumar', 'Chintu'] as const;
