'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { CartItemCard } from '@/components/cart/CartItemCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { Address, PaymentMethod } from '@/types';

export default function CheckoutPage() {
  const { user, updateUserProfileData } = useAuth();
  const { cartItems, getCartTotal, clearCart, getItemCount } = useCart();
  const router = useRouter();
  const { toast } = useToast();

  const [address, setAddress] = useState<Address>(user?.address || {
    street: '', city: '', state: '', zip: '', country: 'USA',
  });
  const [payment, setPayment] = useState<PaymentMethod>(user?.paymentMethod || {
    type: 'credit_card', details: '',
  });
  const [saveDetails, setSaveDetails] = useState(true);

  useEffect(() => {
    if (user?.address) setAddress(user.address);
    if (user?.paymentMethod) setPayment(user.paymentMethod);
  }, [user]);
  
  if (getItemCount() === 0 && typeof window !== 'undefined') {
     router.push('/products');
     return null;
  }


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Mock order placement
    toast({
      title: 'Order Placed!',
      description: 'Thank you for your purchase. Your order is being processed.',
    });

    if (saveDetails && user) {
      updateUserProfileData({ address, paymentMethod: payment });
    }
    clearCart();
    router.push('/');
  };

  return (
    <PageContainer>
      <h1 className="text-3xl font-bold mb-8 text-center font-headline">Checkout</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="md:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="street">Street Address</Label>
                <Input id="street" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} required />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input id="state" value={address.state} onChange={e => setAddress({...address, state: e.target.value})} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input id="zip" value={address.zip} onChange={e => setAddress({...address, zip: e.target.value})} required />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" value={address.country} onChange={e => setAddress({...address, country: e.target.value})} required />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>This is a mock payment form. Do not enter real card details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input id="cardNumber" placeholder="**** **** **** 1234" value={payment.type === 'credit_card' ? payment.details : ''} onChange={e => setPayment({ type: 'credit_card', details: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input id="expiryDate" placeholder="MM/YY" required />
                </div>
                <div>
                  <Label htmlFor="cvc">CVC</Label>
                  <Input id="cvc" placeholder="123" required />
                </div>
              </div>
               <div className="flex items-center space-x-2 mt-4">
                <input type="checkbox" id="saveDetails" checked={saveDetails} onChange={(e) => setSaveDetails(e.target.checked)} className="rounded"/>
                <Label htmlFor="saveDetails" className="text-sm font-normal">Save these details for next time</Label>
              </div>
            </CardContent>
          </Card>
          <Button type="submit" size="lg" className="w-full">
            Place Order - ${getCartTotal().toFixed(2)}
          </Button>
        </form>

        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>{getItemCount()} item(s)</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-2">
                {cartItems.map(item => (
                  <CartItemCard key={item.id} item={item} />
                ))}
              </ScrollArea>
              <Separator className="my-4" />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => router.push('/products')}>Continue Shopping</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
