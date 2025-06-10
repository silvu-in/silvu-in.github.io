'use client';

import type { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { Button, type ButtonProps } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddToCartButtonProps extends ButtonProps {
  product: Product;
  quantity?: number;
  showIcon?: boolean;
}

export function AddToCartButton({ product, quantity = 1, className, variant = "default", size="default", showIcon = true, ...props }: AddToCartButtonProps) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  return (
    <Button
      onClick={handleAddToCart}
      className={cn(className)}
      variant={variant}
      size={size}
      disabled={product.stock === 0}
      {...props}
    >
      {showIcon && <ShoppingCart className="mr-2 h-4 w-4" />}
      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
    </Button>
  );
}
