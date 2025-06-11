"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton'; // Assuming Skeleton component is available

const ProductRecommendations = dynamic(
  () =>
    import('@/components/product/ProductRecommendations').then(
      (mod) => mod.ProductRecommendations
    ),
  {
    ssr: false, // Since it fetches client-side recommendations
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/4 mb-2 rounded" />{' '}
        {/* Placeholder for "Product Recommendations" title */}
        <ul className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <RecommendationListItemSkeleton key={i} />
          ))}
        </ul>
      </div>
    ),
  }
);

interface RecommendationListItemSkeletonProps {}

const RecommendationListItemSkeleton: React.FC<RecommendationListItemSkeletonProps> = () => {
  return (
    <li className="flex items-center space-x-4">
      <Skeleton className="w-16 h-16 rounded" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4 rounded" />
        <Skeleton className="h-4 w-1/2 rounded" />
      </div>
    </li>
  );
};

interface ClientProductRecommendationsProps {
  productId: string;
}

const ClientProductRecommendations: React.FC<ClientProductRecommendationsProps> = ({ productId }) => {
  return <ProductRecommendations productId={productId} />;
};

export { ClientProductRecommendations };