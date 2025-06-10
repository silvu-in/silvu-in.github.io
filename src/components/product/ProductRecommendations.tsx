'use client';

import { useEffect, useState, useTransition } from 'react';
import type { Product } from '@/types';
import { handleGetProductRecommendations } from '@/lib/actions';
import { ProductCard } from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '../ui/button';
import Image from 'next/image';

interface ProductRecommendationsProps {
  cartItems: { id: string; name: string }[]; // Simplified item structure
  displayType?: 'card' | 'list'; // Default to card
}

export function ProductRecommendations({ cartItems, displayType = 'card' }: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoading, startTransition] = useTransition();

  useEffect(() => {
    if (cartItems.length > 0) {
      startTransition(async () => {
        const recs = await handleGetProductRecommendations(cartItems);
        setRecommendations(recs);
      });
    } else {
      setRecommendations([]);
    }
  }, [cartItems]); // Re-fetch when cartItems change

  if (isLoading) {
    return (
      <div className={displayType === 'card' ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "space-y-3"}>
        {[...Array(displayType === 'card' ? 2 : 3)].map((_, i) => (
          displayType === 'card' ? (
            <div key={i} className="space-y-2">
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4 rounded-md" />
              <Skeleton className="h-4 w-1/2 rounded-md" />
            </div>
          ) : (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="h-12 w-12 rounded-md" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-3 w-20 rounded-md" />
              </div>
            </div>
          )
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return <p className="text-sm text-muted-foreground">No specific recommendations at this time.</p>;
  }

  return (
    <div className="space-y-4">
      {displayType === 'card' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {recommendations.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <ul className="space-y-3">
          {recommendations.map(product => (
            <li key={product.id} className="p-3 rounded-md border hover:bg-accent/50 transition-colors">
              <Link href={`/products/${product.id}`} className="flex items-center space-x-3 group">
                 <div className="relative h-16 w-16 overflow-hidden rounded-md bg-muted flex-shrink-0">
                    <Image 
                        src={product.imageUrl} 
                        alt={product.name} 
                        fill 
                        sizes="64px" 
                        className="object-cover group-hover:scale-105 transition-transform"
                        data-ai-hint={product.dataAiHint}
                    />
                 </div>
                 <div>
                    <h4 className="font-medium group-hover:text-primary transition-colors">{product.name}</h4>
                    <p className="text-sm text-muted-foreground">${product.price.toFixed(2)}</p>
                 </div>
                 <Button variant="outline" size="sm" className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">View</Button>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
