
import { getFeaturedProducts } from '@/lib/firebase/productService';
import { ProductList } from './ProductList';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Product } from '@/types';

export async function FeaturedProducts() {
  const featured: Product[] = await getFeaturedProducts(4); // Show up to 4 featured products

  if (featured.length === 0) {
    return (
      <section className="py-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-4">Featured Products</h2>
        <p className="text-muted-foreground mb-4">No featured products available at the moment. Check back soon!</p>
        <Button asChild variant="outline">
          <Link href="/products">View All Products</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Featured Products</h2>
        <Button asChild variant="outline">
          <Link href="/products">View All Products</Link>
        </Button>
      </div>
      <ProductList products={featured} />
    </section>
  );
}
