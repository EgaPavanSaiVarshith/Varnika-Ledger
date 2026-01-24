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
import { Loader2 } from 'lucide-react';
import type { CylinderCosts } from '@/lib/types';

export default function SettingsPage() {
  const [costs, setCosts] = useState<CylinderCosts | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchCosts() {
      try {
        const currentCosts = await getCylinderCosts();
        setCosts(currentCosts);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load cylinder costs.',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchCosts();
  }, [toast]);

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
      await updateCylinderCosts(costs);
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
          <CardTitle>Cylinder Prices</CardTitle>
          <CardDescription>
            Update the cost for each cylinder type. This will be used to pre-fill the amount in sale transactions.
          </CardDescription>
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
