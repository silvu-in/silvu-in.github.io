
'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CartItemCard } from './CartItemCard';
// import { ProductRecommendations } from '@/components/product/ProductRecommendations'; // Replaced with dynamic import
import { SheetFooter, SheetClose } from '@/components/ui/sheet';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const CartRecoSkeleton = () => (
 <div className="space-y-3">
    {[...Array(2)].map((_, i) => (
      <div key={i} className="flex items-center space-x-3 p-2 rounded-md border">
        <Skeleton className="h-12 w-12 rounded-md" />
        <div className="flex-grow">
          <Skeleton className="h-4 w-full mb-1 rounded-md" />
          <Skeleton className="h-3 w-2/3 rounded-md" />
        </div>
      </div>
    ))}
  </div>
);

const ProductRecommendations = dynamic(() =>
  import('@/components/product/ProductRecommendations').then(mod => mod.ProductRecommendations),
  {
    ssr: false, // Fetches client-side based on cart
    loading: () => <CartRecoSkeleton />
  }
);


export function CartSheetContent() {
  const { cartItems, getCartTotal, clearCart, getItemCount } = useCart();
  const total = getCartTotal();
  const itemCount = getItemCount();

  if (itemCount === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <p className="text-xl text-muted-foreground">Your cart is empty.</p>
        <SheetClose asChild>
          <Button asChild variant="link" className="mt-4">
            <Link href="/products">Start Shopping</Link>
          </Button>
        </SheetClose>
      </div>
    );
  }

  return (
    <>
      <ScrollArea className="flex-grow pr-6 -mr-6">
        {cartItems.map(item => (
          <CartItemCard key={item.id} item={item} />
        ))}
      </ScrollArea>
      
      <Separator className="my-4" />
      
      <div className="pr-6"> {/* Ensure ProductRecommendations is also within a pr-6 if its content needs padding */}
        <h3 className="text-lg font-semibold mb-2">You Might Also Like</h3>
        <ProductRecommendations cartItems={cartItems.map(item => ({ id: item.id, name: item.name }))} displayType="list" />
      </div>

      <SheetFooter className="mt-auto border-t pt-6 pr-6 -mx-6 px-6">
        <div className="w-full space-y-4">
          <div className="flex justify-between text-lg font-semibold">
            <span>Subtotal</span>
            <span>₹{Math.round(total)}</span> {/* Rounded total */}
          </div>
          <SheetClose asChild>
            <Button asChild className="w-full" size="lg">
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>
          </SheetClose>
          <SheetClose asChild>
            <Button variant="outline" className="w-full" onClick={clearCart}>
              Clear Cart
            </Button>
          </SheetClose>
        </div>
      </SheetFooter>
    </>
  );
}
