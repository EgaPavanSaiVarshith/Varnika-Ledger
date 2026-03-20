'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getPrices, updatePrices } from '@/lib/actions';
import { CYLINDER_TYPES, OTHER_PRODUCTS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [prices, setPrices] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchAllPrices() {
      setLoading(true);
      try {
        const data = await getPrices(selectedMonth);
        setPrices(data);
      } catch (error) {
        console.error('Error loading prices:', error);
        // Fallback to defaults
        setPrices({
          cylinderCosts: { '14.2kg': 960, '19kg (Commercial)': 2500, '10kg': 850, '5kg': 450 },
          otherProductPrices: { 'PR': 350, 'PIPE': 200, 'Deactivation': 200, 'Sales of gas book': 100 }
        });
      } finally {
        setLoading(false);
      }
    }
    fetchAllPrices();
  }, [selectedMonth]);

  const handlePriceChange = (category: 'cylinderCosts' | 'otherProductPrices', item: string, value: string) => {
    if (!prices) return;
    const newPrices = { ...prices };
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      newPrices[category][item] = numericValue;
      setPrices(newPrices);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prices) return;

    setSaving(true);
    try {
      await updatePrices(selectedMonth, prices);
      toast({
        title: 'Success!',
        description: 'All prices have been updated for this month.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update prices.',
      });
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Settings</h1>
        <div className="flex items-center gap-2">
          <Label htmlFor="month-picker">Month:</Label>
          <Input
            id="month-picker"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-[180px]"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Cylinder Prices</CardTitle>
            <CardDescription>Set the monthly selling price for each cylinder type.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {CYLINDER_TYPES.map((type) => (
                <div key={type} className="space-y-2">
                  <Label htmlFor={`cyl-${type}`}>{type}</Label>
                  <Input
                    id={`cyl-${type}`}
                    type="number"
                    step="0.01"
                    value={prices?.cylinderCosts[type] ?? ''}
                    onChange={(e) => handlePriceChange('cylinderCosts', type, e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">{formatCurrency(prices?.cylinderCosts[type] ?? 0)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Other Product Prices</CardTitle>
            <CardDescription>Set the monthly selling price for accessories and other products.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {OTHER_PRODUCTS.map((prod) => (
                <div key={prod} className="space-y-2">
                  <Label htmlFor={`prod-${prod}`}>{prod}</Label>
                  <Input
                    id={`prod-${prod}`}
                    type="number"
                    step="0.01"
                    value={prices?.otherProductPrices[prod] ?? ''}
                    onChange={(e) => handlePriceChange('otherProductPrices', prod, e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">{formatCurrency(prices?.otherProductPrices[prod] ?? 0)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={saving} className="w-full sm:w-auto">
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save All Prices'}
          </Button>
        </div>
      </form>
    </div>
  );
}
