
'use client';

import { Button } from '@/components/ui/button';
import { handleSeedProducts } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useState, useTransition } from 'react';
import { RefreshCw, DatabaseZap } from 'lucide-react'; // Added DatabaseZap icon

export function SeedProductsButton() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const result = await handleSeedProducts();
      if (result.success) {
        toast({
          title: 'Product Seeding Action',
          description: result.success,
        });
      } else if (result.error) {
        toast({
          title: 'Error Seeding Products',
          description: result.error,
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Button onClick={handleClick} disabled={isPending} variant="outline" size="sm" className="whitespace-nowrap">
      {isPending ? (
        <>
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          Seeding Products...
        </>
      ) : (
        <>
          <DatabaseZap className="mr-2 h-4 w-4" />
          Seed Initial Products
        </>
      )}
    </Button>
  );
}
