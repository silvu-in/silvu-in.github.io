
'use client';

import { Button } from '@/components/ui/button';
import { handleSeedBlogPost } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useState, useTransition } from 'react';
import { RefreshCw } from 'lucide-react';

export function SeedPostButton() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const result = await handleSeedBlogPost();
      if (result.success) {
        toast({
          title: 'Blog Post Action',
          description: result.success,
        });
      } else if (result.error) {
        toast({
          title: 'Error Seeding Post',
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
          Seeding...
        </>
      ) : (
        'Seed Test Blog Post'
      )}
    </Button>
  );
}
