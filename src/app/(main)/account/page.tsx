
'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Address, PaymentMethod } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Package, CreditCardIcon, MapPinIcon, Edit3, ShoppingBag, User as UserIcon, AlertCircle } from 'lucide-react';
import Link from 'next/link';


const defaultAddress: Address = { street: '', city: '', state: '', zip: '', country: 'USA' };
const defaultPaymentMethod: PaymentMethod = { type: 'credit_card', details: '' };

export default function AccountPage() {
  const { user, loading: authLoading, updateUserProfileData } = useAuth();
  const { toast } = useToast();

  const [address, setAddress] = useState<Address>(defaultAddress);
  const [payment, setPayment] = useState<PaymentMethod>(defaultPaymentMethod);
  const [displayName, setDisplayName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isEditingPayment, setIsEditingPayment] = useState(false);

  useEffect(() => {
    if (user) {
      setAddress(user.address || defaultAddress);
      setPayment(user.paymentMethod || defaultPaymentMethod);
      setDisplayName(user.displayName || '');
      setUserEmail(user.email || '');
    } else {
      // Reset to defaults if user logs out or is not present
      setAddress(defaultAddress);
      setPayment(defaultPaymentMethod);
      setDisplayName('');
      setUserEmail('');
      setIsEditingAddress(false);
      setIsEditingPayment(false);
    }
  }, [user]);

  const handleAddressSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: 'Not Logged In', description: 'You must be logged in to save an address.', variant: 'destructive' });
      return;
    }
    try {
      await updateUserProfileData({ address });
      toast({ title: 'Address Updated', description: 'Your shipping address has been saved.' });
      setIsEditingAddress(false);
    } catch (error) {
      toast({ title: 'Update Failed', description: 'Could not save address.', variant: 'destructive' });
    }
  };

  const handlePaymentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: 'Not Logged In', description: 'You must be logged in to save a payment method.', variant: 'destructive' });
      return;
    }
    try {
      await updateUserProfileData({ paymentMethod: payment });
      toast({ title: 'Payment Method Updated', description: 'Your payment method has been saved.' });
      setIsEditingPayment(false);
    } catch (error) {
      toast({ title: 'Update Failed', description: 'Could not save payment method.', variant: 'destructive' });
    }
  };
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'GU'; // Guest User
    const names = name.split(' ');
    if (names.length > 1 && names[0] && names[names.length -1]) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    if (name.length > 1) return name.substring(0, 2).toUpperCase();
    return name[0]?.toUpperCase() || 'U';
  };

  if (authLoading) {
    return (
      <PageContainer className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <p>Loading account details...</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-10 p-6 bg-muted/50 rounded-lg shadow">
        <Avatar className="h-24 w-24 border-2 border-primary">
          <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || (user?.email ? `Profile picture for ${user.email}` : 'User Avatar')} />
          <AvatarFallback className="text-3xl">{getInitials(user?.displayName || user?.email)}</AvatarFallback>
        </Avatar>
        <div>
            <h1 className="text-3xl font-bold font-headline text-center sm:text-left">{user ? (displayName || 'Your Account') : 'Guest User'}</h1>
            <p className="text-muted-foreground text-center sm:text-left">{user ? userEmail : 'Please log in to view your details.'}</p>
        </div>
      </div>

      {!user && (
        <Card className="mb-8 border-primary/50 bg-primary/5 text-primary-foreground shadow-md">
            <CardHeader>
                <div className="flex items-center space-x-3">
                    <AlertCircle className="h-6 w-6 text-primary" />
                    <CardTitle className="text-primary">You are viewing as a Guest</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <p>To manage your account details, shipping addresses, payment methods, and order history, please <Link href="/login" className="font-semibold underline hover:text-primary/80">log in</Link> or <Link href="/signup" className="font-semibold underline hover:text-primary/80">create an account</Link>.</p>
                <p className="mt-2 text-sm">You can access the login page using the user icon in the header.</p>
            </CardContent>
        </Card>
      )}
      
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-3">
                <MapPinIcon className="h-6 w-6 text-primary" />
                <div>
                    <CardTitle>Shipping Address</CardTitle>
                    <CardDescription>Manage your primary shipping address.</CardDescription>
                </div>
            </div>
            {user && (
              <Button variant="ghost" size="icon" onClick={() => setIsEditingAddress(!isEditingAddress)} aria-label={isEditingAddress ? "Cancel editing address" : "Edit address"}>
                  <Edit3 className="h-5 w-5" />
              </Button>
            )}
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            {user && isEditingAddress ? (
              <form onSubmit={handleAddressSubmit} className="space-y-4">
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
                <div className="flex space-x-2">
                    <Button type="submit">Save Address</Button>
                    <Button variant="outline" onClick={() => { setIsEditingAddress(false); setAddress(user?.address || defaultAddress);}}>Cancel</Button>
                </div>
              </form>
            ) : (
              <div className="text-sm text-muted-foreground space-y-1">
                {user && (address.street || address.city || address.state || address.zip || address.country !== 'USA') ? (
                    <>
                        <p>{address.street || 'No street address'}</p>
                        <p>
                          {address.city || 'No city'}
                          {(address.city && address.state) ? ', ' : ''}
                          {address.state || (address.city ? '' : 'No state')}
                          {' '}
                          {address.zip || (address.city || address.state ? '' : 'No ZIP')}
                        </p>
                        <p>{address.country || 'No country'}</p>
                    </>
                ) : user ? (
                     <p>No shipping address saved. Click the edit icon to add one.</p>
                ) : (
                    <p>Log in to manage your shipping address.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
             <div className="flex items-center space-x-3">
                <CreditCardIcon className="h-6 w-6 text-primary" />
                <div>
                    <CardTitle>Payment Method</CardTitle>
                    <CardDescription>Manage your preferred payment method.</CardDescription>
                </div>
            </div>
             {user && (
                <Button variant="ghost" size="icon" onClick={() => setIsEditingPayment(!isEditingPayment)} aria-label={isEditingPayment ? "Cancel editing payment" : "Edit payment"}>
                    <Edit3 className="h-5 w-5" />
                </Button>
             )}
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            {user && isEditingPayment ? (
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="paymentType">Payment Type</Label>
                  <Input id="paymentType" value="Credit Card" readOnly disabled />
                </div>
                <div>
                  <Label htmlFor="cardNumber">Card Number (Last 4 Digits)</Label>
                  <Input id="cardNumber" placeholder="1234" value={payment.details} onChange={e => setPayment({...payment, type: 'credit_card', details: e.target.value})} maxLength={4} pattern="\d{4}" title="Enter last 4 digits" required />
                </div>
                 <div className="flex space-x-2">
                    <Button type="submit">Save Payment</Button>
                    <Button variant="outline" onClick={() => { setIsEditingPayment(false); setPayment(user?.paymentMethod || defaultPaymentMethod);}}>Cancel</Button>
                </div>
              </form>
            ) : (
              <div className="text-sm text-muted-foreground">
                {user && payment.details ? (
                    <p>Credit Card ending in **** {payment.details}</p>
                ) : user ? (
                    <p>No payment method saved. Click the edit icon to add one.</p>
                ) : (
                    <p>Log in to manage your payment methods.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator className="my-10" />

      <Card className="shadow-md">
        <CardHeader>
            <div className="flex items-center space-x-3">
                <ShoppingBag className="h-6 w-6 text-primary" />
                <div>
                    <CardTitle>Order History</CardTitle>
                    <CardDescription>View your past orders and their status.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
            {user ? (
                <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">You have no orders yet.</p>
                    <p className="text-sm">Start shopping to see your orders here!</p>
                    <Button asChild variant="link" className="mt-2 text-primary hover:underline">
                        <Link href="/products">Browse Products</Link>
                    </Button>
                </div>
            ) : (
                <div className="text-center py-8 text-muted-foreground">
                    <UserIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Please log in to view your order history.</p>
                     <Button asChild variant="link" className="mt-2 text-primary hover:underline">
                        <Link href="/login">Login to View Orders</Link>
                    </Button>
                </div>
            )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
