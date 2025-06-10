
'use client';

import { useSearchParams } from 'next/navigation';
import { ProductList } from '@/components/product/ProductList';
import { PageContainer } from '@/components/layout/PageContainer';
import { useState, useEffect } from 'react';
import type { Product } from '@/types';
import { getAllProducts } from '@/lib/firebase/productService'; // Import from service
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');
  
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const productsFromDb = await getAllProducts();
        setAllProducts(productsFromDb);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Could not load products. Please try again later.");
        setAllProducts([]); // Ensure it's an empty array on error
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (isLoading) return; // Don't filter until products are loaded

    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      setFilteredProducts(
        allProducts.filter(
          product =>
            product.name.toLowerCase().includes(lowercasedQuery) ||
            product.description.toLowerCase().includes(lowercasedQuery) ||
            product.category.toLowerCase().includes(lowercasedQuery)
        )
      );
    } else {
      setFilteredProducts(allProducts);
    }
  }, [searchQuery, allProducts, isLoading]);

  return (
    <PageContainer>
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight font-headline">
          {searchQuery ? `Search Results for "${searchQuery}"` : 'All Products'}
        </h1>
        {!isLoading && !error && (
          <p className="mt-2 text-lg text-muted-foreground">
            {searchQuery ? `Found ${filteredProducts.length} products.` : `Browse our collection of ${allProducts.length} drones, parts, and accessories.`}
          </p>
        )}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-[200px] w-full rounded-xl" />
              <Skeleton className="h-6 w-3/4 rounded-md" />
              <Skeleton className="h-4 w-1/2 rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && error && (
        <div className="text-center py-10">
          <p className="text-xl text-destructive">{error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <ProductList products={filteredProducts} />
      )}
    </PageContainer>
  );
}
