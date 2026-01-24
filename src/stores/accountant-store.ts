import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ACCOUNTANTS } from '@/lib/constants';
import type { Accountant } from '@/lib/types';

interface AccountantState {
  accountant: Accountant;
  setAccountant: (accountant: Accountant) => void;
}

export const useAccountantStore = create<AccountantState>()(
  persist(
    (set) => ({
      accountant: ACCOUNTANTS[0],
      setAccountant: (accountant) => set({ accountant }),
    }),
    {
      name: 'accountant-storage', // name of the item in the storage (must be unique)
    }
  )
);
