
'use client';

import { useState, type FormEvent, useEffect, useTransition, ChangeEvent } from 'react';
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
import type { Address, PaymentMethod, OrderItem, OrderStatus } from '@/types';
import { createOrder } from '@/lib/firebase/orderService';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const UPI_BASE_PAY_STRING = "upi://pay?pa=6202336939@fam&pn=Krish Verma&cu=INR"; 

export default function CheckoutPage() {
  const { user, updateUserProfileData, loading: authLoading } = useAuth();
  const { cartItems, getCartTotal, clearCart, getItemCount } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const defaultAddress = user?.address || { street: '', city: '', state: '', zip: '', country: 'India' }; 
  const defaultPayment = user?.paymentMethod || { type: 'credit_card' as 'credit_card', details: '' };

  const [address, setAddress] = useState<Address>(defaultAddress);
  const [payment, setPayment] = useState<PaymentMethod>(defaultPayment);
  const [saveDetails, setSaveDetails] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');

  const [showUpiQrDialogCheckout, setShowUpiQrDialogCheckout] = useState(false);
  const [upiUriWithAmountCheckout, setUpiUriWithAmountCheckout] = useState(UPI_BASE_PAY_STRING);
  
  const [pendingOrderData, setPendingOrderData] = useState<{
    items: OrderItem[];
    total: number;
    shipping: Address;
    payment: PaymentMethod;
  } | null>(null);

  const roundedTotal = Math.round(getCartTotal());


  useEffect(() => {
    if (typeof window !== 'undefined' && getItemCount() === 0 && !authLoading && !isPending) {
      setShouldRedirect(true);
    }
  }, [getItemCount, authLoading, isPending]);

  useEffect(() => {
    if (shouldRedirect) {
      toast({
          title: 'Your cart is empty',
          description: 'Redirecting to products page...',
          variant: 'default',
      });
      router.push('/products');
    }
  }, [shouldRedirect, router, toast]);

  useEffect(() => {
    if (user) {
      setAddress(user.address || { street: '', city: '', state: '', zip: '', country: 'India' }); 
      setPayment(user.paymentMethod || { type: 'credit_card', details: '' });
      if (user.paymentMethod?.type === 'credit_card') {
        setCardNumber(user.paymentMethod.details);
      }
    }
  }, [user]);

  const handleCardNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value.replace(/\D/g, ''); 
    let formattedVal = '';
    for (let i = 0; i < inputVal.length; i += 4) {
      formattedVal += inputVal.substring(i, Math.min(i + 4, inputVal.length)) + ' ';
    }
    setCardNumber(formattedVal.trim().slice(0, 19)); 
  };

  const handleExpiryDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    let inputVal = e.target.value.replace(/\D/g, '');
    if (inputVal.length > 2 && !inputVal.includes('/')) {
      inputVal = inputVal.substring(0, 2) + '/' + inputVal.substring(2, 4);
    } else if (inputVal.length === 2 && expiryDate.length === 1 && !inputVal.includes('/')) {
        inputVal = inputVal + '/';
    }
    setExpiryDate(inputVal.slice(0, 5));
  };
  
  const triggerHapticFeedback = () => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50); // Vibrate for 50ms
    }
  };

  const processOrderPlacement = async (orderStatus: OrderStatus = 'pending') => {
    if (!user) {
      toast({ title: 'Please Log In', description: 'You need to be logged in to place an order.', variant: 'destructive' });
      router.push(`/login?redirect=/checkout`);
      return;
    }
     if (getItemCount() === 0) {
      toast({ title: 'Empty Cart', description: 'Your cart is empty.', variant: 'destructive' });
      return;
    }

    startTransition(async () => {
      try {
        const orderItems: OrderItem[] = cartItems.map(item => ({
          id: item.id, name: item.name, description: item.description, price: item.price,
          imageUrl: item.imageUrl, category: item.category, stock: item.stock,
          dataAiHint: item.dataAiHint, quantity: item.quantity,
        }));

        const currentPaymentMethod = payment.type === 'credit_card' 
          ? { ...payment, details: cardNumber.replace(/\s/g, '').slice(-4) } 
          : payment;

        const orderId = await createOrder(
          user.uid, user.email, user.displayName, orderItems, roundedTotal, // Use roundedTotal
          address, currentPaymentMethod, 7, orderStatus
        );

        if (orderStatus === 'payment_pending_verification') {
            toast({
                title: 'Payment Initiated with UPI',
                description: `Your Order ID: ${orderId.substring(0,8)}... is awaiting payment verification. Please allow a few hours.`,
                duration: 10000,
            });
        } else {
            toast({
              title: 'Order Placed Successfully!',
              description: `Thank you for your purchase. Your Order ID: ${orderId.substring(0,8)}...`,
            });
        }

        if (saveDetails && (payment.type !== 'upi' && payment.type !== 'cod')) { 
          await updateUserProfileData({ address, paymentMethod: currentPaymentMethod });
        } else if (saveDetails) {
           await updateUserProfileData({ address }); 
        }
        clearCart();
        router.push('/account');

      } catch (error: any) {
        console.error("Error placing order:", error);
        toast({
          title: 'Order Failed',
          description: error.message || 'Could not place your order. Please try again.',
          variant: 'destructive',
        });
      }
    });
  };


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    triggerHapticFeedback(); 
    if (!user) {
      toast({ title: 'Please Log In', description: 'You need to be logged in to place an order.', variant: 'destructive' });
      router.push(`/login?redirect=/checkout`);
      return;
    }
    if (payment.type === 'cod') {
        toast({ title: 'Coming Soon', description: 'Cash on Delivery is not yet available. Please select another payment method.', variant: 'default' });
        return;
    }

    if (payment.type === 'upi') {
      const orderItems: OrderItem[] = cartItems.map(item => ({
          id: item.id, name: item.name, description: item.description, price: item.price,
          imageUrl: item.imageUrl, category: item.category, stock: item.stock,
          dataAiHint: item.dataAiHint, quantity: item.quantity,
      }));
      setPendingOrderData({
          items: orderItems,
          total: roundedTotal, // Use roundedTotal
          shipping: address,
          payment: payment
      });

      const totalAmountForUpi = roundedTotal.toFixed(2); // Ensure it's formatted as string with 2 decimal places for UPI
      let upiString = UPI_BASE_PAY_STRING; 
      if (upiString.includes('&am=')) {
        upiString = upiString.replace(/&am=[\d.]+/, `&am=${totalAmountForUpi}`);
      } else if (upiString.includes('?am=')) {
        upiString = upiString.replace(/\?am=[\d.]+/, `?am=${totalAmountForUpi}`);
      } else {
        upiString = `${upiString}&am=${totalAmountForUpi}`;
      }
      setUpiUriWithAmountCheckout(upiString);
      setShowUpiQrDialogCheckout(true);
      return; 
    }

    await processOrderPlacement('pending');
  };
  
  const handleUpiPaymentConfirmed = async () => {
    setShowUpiQrDialogCheckout(false);
    triggerHapticFeedback();
    if (pendingOrderData) {
        await processOrderPlacement('payment_pending_verification');
    }
    setPendingOrderData(null);
  };


  if (authLoading) {
    return <PageContainer><p>Loading checkout...</p></PageContainer>;
  }
  
  if (shouldRedirect) {
    return <PageContainer><p>Your cart is empty. Redirecting...</p></PageContainer>;
  }

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
                <Input id="street" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} required disabled={isPending} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} required disabled={isPending} />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input id="state" value={address.state} onChange={e => setAddress({...address, state: e.target.value})} required disabled={isPending} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input id="zip" value={address.zip} onChange={e => setAddress({...address, zip: e.target.value})} required disabled={isPending} />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" value={address.country || 'India'} onChange={e => setAddress({...address, country: e.target.value})} required disabled={isPending} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>
                {payment.type === 'credit_card' && "This is a mock payment form. Do not enter real card details."}
                {payment.type === 'upi' && "Scan the QR code with your UPI app to pay."}
                {payment.type === 'cod' && "Cash on Delivery is currently unavailable."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="paymentType">Payment Type</Label>
                <select 
                    id="paymentType" 
                    value={payment.type} 
                    onChange={e => setPayment({...payment, type: e.target.value as PaymentMethod['type'], details: ''})} 
                    className="w-full mt-1 p-2 border rounded-md bg-background disabled:opacity-50 text-sm"
                    disabled={isPending}
                >
                    <option value="credit_card">Credit Card</option>
                    <option value="upi">UPI</option>
                    <option value="cod">Cash on Delivery (Coming Soon)</option>
                </select>
              </div>

              {payment.type === 'credit_card' && (
                <>
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input 
                        id="cardNumber" 
                        placeholder="0000 0000 0000 0000" 
                        value={cardNumber} 
                        onChange={handleCardNumberChange} 
                        maxLength={19}
                        required 
                        disabled={isPending} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input 
                        id="expiryDate" 
                        placeholder="MM/YY" 
                        value={expiryDate}
                        onChange={handleExpiryDateChange}
                        maxLength={5}
                        required 
                        disabled={isPending} />
                    </div>
                    <div>
                      <Label htmlFor="cvc">CVC</Label>
                      <Input 
                        id="cvc" 
                        placeholder="123" 
                        value={cvc}
                        onChange={e => setCvc(e.target.value.replace(/\D/g, '').slice(0,4))}
                        maxLength={4}
                        required 
                        disabled={isPending} />
                    </div>
                  </div>
                </>
              )}
              {payment.type === 'upi' && (
                 <div>
                    <Label htmlFor="upiId">UPI ID (For our reference)</Label>
                    <Input id="upiId" placeholder="yourname@upi (Optional)" value={payment.details} onChange={e => setPayment({ ...payment, details: e.target.value})} disabled={isPending} />
                    <p className="text-xs text-muted-foreground mt-1">You will be shown a QR code to scan after clicking "Place Order".</p>
                  </div>
              )}
              {payment.type === 'cod' && (
                <div className="flex items-center space-x-2 text-sm p-3 bg-muted rounded-md">
                    <AlertCircle className="h-5 w-5 text-primary"/>
                    <p>Cash on Delivery is currently unavailable. Please choose another payment method.</p>
                </div>
              )}
               <div className="flex items-center space-x-2 mt-4">
                <input type="checkbox" id="saveDetails" checked={saveDetails} onChange={(e) => setSaveDetails(e.target.checked)} className="rounded disabled:opacity-50" disabled={isPending}/>
                <Label htmlFor="saveDetails" className="text-sm font-normal">Save shipping details for next time (if logged in)</Label>
              </div>
            </CardContent>
          </Card>
          <Button 
            type="submit" 
            size="lg" 
            className="w-full" 
            disabled={isPending || getItemCount() === 0 || payment.type === 'cod'}
            onClick={triggerHapticFeedback} 
          >
            {isPending ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : 
             payment.type === 'upi' ? `Proceed to UPI Payment - ₹${roundedTotal}` : // Use roundedTotal
             `Place Order - ₹${roundedTotal}`} 
          </Button>
        </form>

        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>{getItemCount()} item(s)</CardDescription>
            </CardHeader>
            <CardContent>
              {getItemCount() > 0 ? (
                <ScrollArea className="h-[300px] pr-2">
                  {cartItems.map(item => (
                    <CartItemCard key={item.id} item={item} />
                  ))}
                </ScrollArea>
              ) : (
                <p className="text-muted-foreground text-center py-4">Your cart is empty.</p>
              )}
              <Separator className="my-4" />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>₹{roundedTotal}</span> 
              </div>
            </CardContent>
            <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => router.push('/products')} disabled={isPending}>Continue Shopping</Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <AlertDialog open={showUpiQrDialogCheckout} onOpenChange={setShowUpiQrDialogCheckout}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Scan to Pay with UPI</AlertDialogTitle>
            <AlertDialogDescription>
              Scan the QR code below with your preferred UPI app to pay <strong>₹{(pendingOrderData?.total || 0).toFixed(0)}</strong>. {/* Display rounded total */}
              After payment, click "I Have Paid". If you have already paid for this order, you can close this.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-center py-4 my-2 bg-white rounded-md">
            <QRCodeSVG value={upiUriWithAmountCheckout} size={220} includeMargin={true} level="H" />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            If payment is successful, your order status will be updated to "Payment Pending Verification". This may take a few hours.
            If you encounter issues, please contact support with your UPI transaction ID.
          </p>
          <AlertDialogFooter className="mt-2">
            <AlertDialogCancel onClick={() => {
                setShowUpiQrDialogCheckout(false);
                setPendingOrderData(null);
                toast({title: "UPI Payment Cancelled", description: "Your order was not placed."});
            }} disabled={isPending}>Cancel Payment</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpiPaymentConfirmed} disabled={isPending}>
              {isPending ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : "I Have Paid"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
