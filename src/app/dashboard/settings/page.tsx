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
import { getCylinderCosts, updateCylinderCosts } from '@/lib/actions';
import { CYLINDER_TYPES } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import type { CylinderCosts } from '@/lib/types';

export default function SettingsPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [costs, setCosts] = useState<CylinderCosts | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchCosts() {
      setLoading(true);
      try {
        const currentCosts = await getCylinderCosts(selectedMonth);
        setCosts(currentCosts);
      } catch (error) {
        console.error('Error loading costs:', error);
        // Fallback to defaults so form is ALWAYS visible
        setCosts({
          '14.2kg': 960,
          '19kg (Commercial)': 2500,
          '10kg': 850,
          '5kg': 450,
        });
      } finally {
        setLoading(false);
      }
    }
    fetchCosts();
  }, [selectedMonth]);

  const handleCostChange = (cylinderType: string, value: string) => {
    if (!costs) return;
    const newCosts = { ...costs };
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      newCosts[cylinderType as keyof CylinderCosts] = numericValue;
      setCosts(newCosts);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!costs) return;

    setSaving(true);
    try {
      await updateCylinderCosts(selectedMonth, costs);
      toast({
        title: 'Success!',
        description: 'Cylinder costs have been updated.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update costs.',
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Settings</h1>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Cylinder Prices</CardTitle>
              <CardDescription>
                Update the cost for each cylinder type for a specific month.
              </CardDescription>
            </div>
            <div className="w-full sm:w-auto">
              <Label htmlFor="month-picker" className="sr-only">Select Month</Label>
              <Input
                id="month-picker"
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {costs ? (
             <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {CYLINDER_TYPES.map((type) => (
                  <div key={type} className="space-y-2">
                    <Label htmlFor={type}>{type}</Label>
                    <Input
                      id={type}
                      type="number"
                      step="0.01"
                      value={costs[type] ?? ''}
                      onChange={(e) => handleCostChange(type, e.target.value)}
                      className="max-w-xs"
                    />
                     <p className="text-sm text-muted-foreground">Current Price: {formatCurrency(costs[type] ?? 0)}</p>
                  </div>
                ))}
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Prices'
                )}
              </Button>
            </form>
          ) : (
            <p>Could not load settings.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
