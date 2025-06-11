
import { getProductById, getAllProducts, getAllProductIds } from '@/lib/firebase/productService'; // Updated import
import { PageContainer } from '@/components/layout/PageContainer';
import { ProductImage } from '@/components/product/ProductImage';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
// import { ProductRecommendations } from '@/components/product/ProductRecommendations'; // Replaced with dynamic import
import { ClientProductRecommendations } from '@/components/product/ClientProductRecommendations'; // Import the new client component
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Product } from '@/types';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const revalidate = 60; // Revalidate data every 60 seconds

interface ProductDetailPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const product = await getProductById(params.id);
  if (!product) {
    return {
      title: 'Product Not Found - Silvu',
    }
  }
  return {
    title: `${product.name} - Silvu`,
    description: product.description,
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }
  
  const allDbProducts = await getAllProducts(); 
  const relatedProducts = allDbProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <PageContainer>
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
        <div className="sticky top-24">
          <ProductImage 
            src={product.imageUrl} 
            alt={product.name} 
            width={600} 
            height={450} 
            className="rounded-xl shadow-lg" 
            data-ai-hint={product.dataAiHint}
            priority={true} 
          />
        </div>
        <div>
          <Badge variant="outline" className="mb-2">{product.category}</Badge>
          <h1 className="text-3xl lg:text-4xl font-bold mb-3 font-headline">{product.name}</h1>
          <p className="text-2xl font-semibold text-primary mb-4">₹{Math.round(product.price)}</p> {/* Rounded price */}
          <Separator className="my-4" />
          <p className="text-muted-foreground leading-relaxed mb-6">{product.description}</p>
          
          <div className="mb-6">
            {product.stock > 0 ? (
                <p className="text-sm text-green-600">In Stock: {product.stock} units available</p>
            ) : (
                <p className="text-sm text-red-600">Out of Stock</p>
            )}
          </div>

          <AddToCartButton product={product} size="lg" className="w-full md:w-auto" />
        </div>
      </div>

      <Separator className="my-12" />

      <div>
        <h2 className="text-2xl font-bold mb-6">Product Recommendations</h2>
        {/* Use the new client component for recommendations */}
        <ClientProductRecommendations cartItems={[{ id: product.id, name: product.name }]} displayType="list" />
      </div>
      
      {relatedProducts.length > 0 && (
        <>
          <Separator className="my-12" />
          <div>
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          </div>
        </>
      )}
    </PageContainer>
  );
}

export async function generateStaticParams() {
  const productIds = await getAllProductIds(); 
  return productIds.map((item) => ({
    id: item.id,
  }));
}
