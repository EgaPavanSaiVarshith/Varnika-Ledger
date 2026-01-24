import { CYLINDER_TYPES, DELIVERY_BOYS, SALE_TYPES, EXPENSE_CATEGORIES, CHIT_HOLDERS, OTHER_PRODUCTS, ACCOUNTANTS, MINI_BANK_DESCRIPTIONS } from './constants';

export type CylinderType = (typeof CYLINDER_TYPES)[number];
export type OtherProduct = (typeof OTHER_PRODUCTS)[number];
export type DeliveryBoy = (typeof DELIVERY_BOYS)[number];
export type SaleType = (typeof SALE_TYPES)[number];
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type ChitHolder = (typeof CHIT_HOLDERS)[number];
export type Accountant = (typeof ACCOUNTANTS)[number];
export type MiniBankDescription = (typeof MINI_BANK_DESCRIPTIONS)[number];

export type TransactionType = 'Sale' | 'Purchase' | 'Expense';

interface BaseTransaction {
  id: string;
  date: string;
  type: TransactionType;
  amount: number;
  accountant: Accountant;
}

export interface SaleTransaction extends BaseTransaction {
  type: 'Sale';
  cylinderType?: CylinderType;
  quantity?: number;
  saleType: SaleType;
  deliveryBoy?: DeliveryBoy;
  otherProduct?: OtherProduct;
}

export interface PurchaseTransaction extends BaseTransaction {
  type: 'Purchase';
  cylinderType: CylinderType;
  quantity: number;
}

export interface ExpenseTransaction extends BaseTransaction {
  type: 'Expense';
  category: ExpenseCategory;
  description: string;
  chitHolder?: ChitHolder;
  miniBankDescription?: MiniBankDescription;
}

export type Transaction = SaleTransaction | PurchaseTransaction | ExpenseTransaction;

export type Stock = Record<CylinderType, number>;

export type CylinderCosts = Record<CylinderType, number>;
