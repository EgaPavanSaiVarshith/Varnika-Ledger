'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ACCOUNTANTS } from '@/lib/constants';
import { useAccountantStore } from '@/stores/accountant-store';
import { Label } from '../ui/label';

export default function AccountantSelector() {
  const { accountant, setAccountant } = useAccountantStore();

  return (
    <div className="flex items-center gap-2">
       <Label htmlFor="accountant-selector" className='text-sm font-medium'>Accountant:</Label>
      <Select value={accountant} onValueChange={setAccountant}>
        <SelectTrigger className="w-[200px]" id="accountant-selector">
          <SelectValue placeholder="Select Accountant" />
        </SelectTrigger>
        <SelectContent>
          {ACCOUNTANTS.map(name => (
            <SelectItem key={name} value={name}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
