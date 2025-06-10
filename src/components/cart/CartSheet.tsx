'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CartItemCard } from './CartItemCard';
import { ProductRecommendations } from '@/components/product/ProductRecommendations';
import { SheetFooter, SheetClose } from '@/components/ui/sheet';


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
      
      <div className="pr-6">
        <ProductRecommendations cartItems={cartItems.map(item => ({ id: item.id, name: item.name }))} />
      </div>

      <SheetFooter className="mt-auto border-t pt-6 pr-6 -mx-6 px-6">
        <div className="w-full space-y-4">
          <div className="flex justify-between text-lg font-semibold">
            <span>Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <Button asChild className="w-full" size="lg">
            <Link href="/checkout">Proceed to Checkout</Link>
          </Button>
          <Button variant="outline" className="w-full" onClick={clearCart}>
            Clear Cart
          </Button>
        </div>
      </SheetFooter>
    </>
  );
}
