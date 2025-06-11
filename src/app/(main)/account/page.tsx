
'use client';

import { useState, type FormEvent, useEffect, useRef, ChangeEvent, useTransition } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Address, PaymentMethod, Order, OrderStatus } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Package, CreditCardIcon, MapPinIcon, Edit3, ShoppingBag, User as UserIcon, AlertCircle, Camera, Upload, HelpCircle, Mail, XCircle, RefreshCw, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUserOrders, cancelOrder as cancelOrderService } from '@/lib/firebase/orderService';
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const defaultAddress: Address = { street: '', city: '', state: '', zip: '', country: 'India' };
const defaultPaymentMethod: PaymentMethod = { type: 'credit_card', details: '' };

const formatOrderStatus = (status: OrderStatus): string => {
  switch (status) {
    case 'pending': return 'Pending Confirmation';
    case 'processing': return 'Processing';
    case 'shipped': return 'Shipped';
    case 'delivered': return 'Delivered';
    case 'cancelled': return 'Cancelled';
    case 'payment_pending_verification': return 'Payment Pending Verification';
    default: return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
};

const getOrderStatusClass = (status: OrderStatus): string => {
  switch (status) {
    case 'pending':
    case 'payment_pending_verification':
      return 'text-red-600 dark:text-red-500 font-semibold';
    case 'shipped':
    case 'delivered':
      return 'text-green-600 dark:text-green-500 font-semibold';
    case 'processing':
      return 'text-blue-600 dark:text-blue-500 font-semibold';
    case 'cancelled':
      return 'text-gray-500 dark:text-gray-400 font-semibold line-through';
    default:
      return 'text-muted-foreground font-semibold';
  }
};

export default function AccountPage() {
  const { user, loading: authLoading, updateUserProfileData, signOut } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isCancellingOrder, startOrderCancelTransition] = useTransition();
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const [address, setAddress] = useState<Address>(defaultAddress);
  const [payment, setPayment] = useState<PaymentMethod>(defaultPaymentMethod);
  const [displayName, setDisplayName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const fetchUserOrders = async (userId: string) => {
    setLoadingOrders(true);
    try {
      const userOrders = await getUserOrders(userId);
      setOrders(userOrders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast({ title: "Error", description: "Could not load your order history.", variant: "destructive" });
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (user) {
      setAddress(user.address || defaultAddress);
      setPayment(user.paymentMethod || defaultPaymentMethod);
      setDisplayName(user.displayName || '');
      setUserEmail(user.email || '');
      setPhotoPreviewUrl(user.photoURL);
      fetchUserOrders(user.uid);
    } else if (!authLoading) { 
      setAddress(defaultAddress);
      setPayment(defaultPaymentMethod);
      setDisplayName('');
      setUserEmail('');
      setPhotoPreviewUrl(null);
      setSelectedPhotoFile(null);
      setIsEditingAddress(false);
      setIsEditingPayment(false);
      setIsEditingProfile(false);
      setOrders([]);
      setLoadingOrders(false);
    }
  }, [user, authLoading, toast]);

  const handlePhotoFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedPhotoFile(file);
      setPhotoPreviewUrl(URL.createObjectURL(file));
      setIsEditingProfile(true); 
    }
  };

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: 'Not Logged In', description: 'You must be logged in.', variant: 'destructive' });
      return;
    }
    try {
      await updateUserProfileData({
        displayName: displayName !== user.displayName ? displayName : undefined,
        photoFile: selectedPhotoFile || undefined
      });
      
      setSelectedPhotoFile(null); 
      setIsEditingProfile(false);
    } catch (error) {
      // Toast for error is handled in updateUserProfileData
    }
  };

  const handleAddressSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: 'Not Logged In', description: 'You must be logged in to save an address.', variant: 'destructive' });
      return;
    }
    try {
      await updateUserProfileData({ address: {...address, country: address.country || 'India'} });
      toast({ title: 'Address Updated', description: 'Your shipping address has been saved.' });
      setIsEditingAddress(false);
    } catch (error) {
      // Toast handled in context
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
      // Toast handled in context
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!user) {
      toast({ title: "Not Authenticated", description: "Please log in.", variant: "destructive" });
      return;
    }
    setCancellingOrderId(orderId);
    startOrderCancelTransition(async () => {
      try {
        await cancelOrderService(user.uid, orderId);
        toast({ title: "Order Cancelled", description: `Order ${orderId.substring(0,8)}... has been cancelled.` });
        setOrders(prevOrders =>
          prevOrders.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o)
        );
      } catch (error: any) {
        toast({ title: "Cancellation Failed", description: error.message || "Could not cancel the order.", variant: "destructive" });
      } finally {
        setCancellingOrderId(null);
      }
    });
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      toast({ title: "Signed out", description: "You have been successfully signed out." });
      router.push('/');
    } catch (error) {
      toast({ title: "Sign out error", description: "Failed to sign out. Please try again.", variant: "destructive" });
    } finally {
      setIsSigningOut(false);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'GU';
    const names = name.split(' ');
    if (names.length > 1 && names[0] && names[names.length -1]) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    if (name && name.length > 1) return name.substring(0, 2).toUpperCase();
    if (name && name.length === 1) return name[0].toUpperCase();
    return 'U';
  };

  const getDeliveryEstimateText = (order: Order): string => {
    switch (order.status) {
      case 'processing':
        return `Expected in 2-3 business days.`;
      case 'shipped':
        return `Expected by ${format(order.estimatedDeliveryDate.toDate(), 'MMMM d, yyyy')}.`;
      case 'pending':
      case 'payment_pending_verification':
        return `Around ${format(order.estimatedDeliveryDate.toDate(), 'MMMM d, yyyy')}.`;
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'N/A (Order Cancelled)';
      default:
        return format(order.estimatedDeliveryDate.toDate(), 'MMMM d, yyyy');
    }
  };

  if (authLoading) {
    return (
      <PageContainer className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <p>Loading account details...</p>
      </PageContainer>
    );
  }

  return (
    <TooltipProvider>
      <PageContainer>
        <Card className="mb-10 shadow relative">
          <CardHeader className="pb-2">
              <CardTitle className="text-2xl">Account Overview</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-2 border-primary">
                <AvatarImage src={photoPreviewUrl || user?.photoURL || ''} alt={displayName || 'User Avatar'} />
                <AvatarFallback className="text-3xl">{getInitials(displayName || userEmail)}</AvatarFallback>
              </Avatar>
              {user && (
                  <Button
                      variant="outline"
                      size="icon"
                      className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-background group-hover:opacity-100 opacity-70 transition-opacity"
                      onClick={() => fileInputRef.current?.click()}
                      aria-label="Change profile photo"
                  >
                      <Camera className="h-4 w-4" />
                  </Button>
              )}
              <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoFileChange}
                  accept="image/*"
                  className="hidden"
              />
            </div>
            <div className="flex-grow text-center sm:text-left">
              {isEditingProfile && user ? (
                <form onSubmit={handleProfileSubmit} className="space-y-3">
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className="text-3xl font-bold font-headline"
                    placeholder="Your Name"
                  />
                   <p className="text-muted-foreground">{userEmail}</p>
                  <div className="flex space-x-2 justify-center sm:justify-start">
                    <Button type="submit" size="sm">
                      <Upload className="mr-2 h-4 w-4" /> Save Profile
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      setIsEditingProfile(false);
                      setSelectedPhotoFile(null);
                      if (user) { 
                          setPhotoPreviewUrl(user.photoURL);
                          setDisplayName(user.displayName || '');
                      }
                    }}>Cancel</Button>
                  </div>
                </form>
              ) : (
                <>
                  <h1 className="text-3xl font-bold font-headline">{user ? (displayName || 'Your Account') : 'Guest User'}</h1>
                  <p className="text-muted-foreground">{user ? userEmail : 'Please log in to view your details.'}</p>
                  {user && (
                      <Button variant="ghost" size="sm" className="mt-1 text-primary px-1" onClick={() => setIsEditingProfile(true)}>
                          <Edit3 className="mr-1 h-3 w-3" /> Edit Name/Photo
                      </Button>
                  )}
                </>
              )}
            </div>
          </CardContent>
          {user && (
              <CardFooter className="flex justify-center sm:justify-end pt-4 border-t mt-4">
                  <Button variant="outline" onClick={handleSignOut} disabled={isSigningOut}>
                    {isSigningOut ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="mr-2 h-4 w-4" />
                    )}
                    Sign Out
                  </Button>
              </CardFooter>
          )}
        </Card>

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
                  {user && (address.street || address.city || address.state || address.zip || address.country !== 'India') ? (
                      <>
                          <p>{address.street || 'No street address'}</p>
                          <p>
                            {address.city || 'No city'}
                            {(address.city && address.state) ? ', ' : ''}
                            {address.state || (address.city ? '' : 'No state')}
                            {' '}
                            {address.zip || (address.city || address.state ? '' : 'No ZIP')}
                          </p>
                          <p>{address.country || 'India'}</p>
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
                    <Label htmlFor="paymentTypeEdit">Payment Type</Label>
                     <select
                      id="paymentTypeEdit"
                      value={payment.type}
                      onChange={e => setPayment({...payment, type: e.target.value as PaymentMethod['type'], details: ''})}
                      className="w-full mt-1 p-2 border rounded-md bg-background disabled:opacity-50 text-sm"
                     >
                      <option value="credit_card">Credit Card</option>
                      <option value="upi">UPI</option>
                      <option value="cod">Cash on Delivery (Coming Soon)</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="paymentDetails">
                      {payment.type === 'credit_card' ? 'Card (Last 4 Digits)' :
                       payment.type === 'upi' ? 'UPI ID' : 'Details'}
                    </Label>
                    <Input
                      id="paymentDetails"
                      placeholder={payment.type === 'credit_card' ? '1234' :
                                   payment.type === 'upi' ? 'name@upi' : 'Enter details'}
                      value={payment.details}
                      onChange={e => setPayment({...payment, details: e.target.value})}
                      required={payment.type !== 'cod'}
                      maxLength={payment.type === 'credit_card' ? 4 : 50}
                      disabled={payment.type === 'cod'}
                    />
                  </div>
                   <div className="flex space-x-2">
                      <Button type="submit" disabled={payment.type === 'cod'}>Save Payment</Button>
                      <Button variant="outline" onClick={() => { setIsEditingPayment(false); setPayment(user?.paymentMethod || defaultPaymentMethod);}}>Cancel</Button>
                  </div>
                </form>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {user && payment.details ? (
                      <p>
                          {payment.type === 'credit_card' ? `Card ending in ${payment.details}` :
                           payment.type === 'upi' ? `UPI: ${payment.details}` :
                           payment.type === 'cod' ? 'Cash on Delivery (Preferred)' :
                           `Method: ${payment.type}, Details: ${payment.details}`
                          }
                      </p>
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
              {authLoading || loadingOrders ? (
                   <p>Loading order history...</p>
              ) : !user ? (
                  <div className="text-center py-8 text-muted-foreground">
                      <UserIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Please log in to view your order history.</p>
                       <Button asChild variant="link" className="mt-2 text-primary hover:underline">
                          <Link href="/login">Login to View Orders</Link>
                      </Button>
                  </div>
              ) : orders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">You have no orders yet.</p>
                      <p className="text-sm">Start shopping to see your orders here!</p>
                      <Button asChild variant="link" className="mt-2 text-primary hover:underline">
                          <Link href="/products">Browse Products</Link>
                      </Button>
                  </div>
              ) : (
                <ul className="space-y-6">
                  {orders.map(order => {
                    const isCancellable = ['pending', 'payment_pending_verification', 'processing'].includes(order.status);
                    return (
                    <li key={order.id} className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3">
                          <div>
                              <p className="text-sm text-muted-foreground">Order ID: <span className="font-medium text-foreground">{order.id.substring(0,8)}...</span></p>
                              <p className="text-sm text-muted-foreground">Placed on: <span className="font-medium text-foreground">{format(order.orderDate.toDate(), 'MMMM d, yyyy, h:mm a')}</span></p>
                          </div>
                          <p className="text-lg font-semibold text-primary mt-2 sm:mt-0">₹{order.totalAmount.toFixed(0)}</p>
                      </div>
                      <div className="mb-3">
                          <h4 className="font-medium mb-1 text-sm">Items:</h4>
                          <ul className="list-disc list-inside text-sm text-muted-foreground pl-2 space-y-1">
                              {order.items.map(item => (
                                  <li key={item.id}>{item.name} (x{item.quantity}) - ₹{(Math.round(item.price) * item.quantity)}</li>
                              ))}
                          </ul>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 text-sm">
                          <div>
                              <p className="font-medium flex items-center">
                                  Status:
                                  {order.status === 'payment_pending_verification' && (
                                      <Tooltip>
                                          <TooltipTrigger asChild>
                                              <HelpCircle className="h-4 w-4 ml-1.5 text-muted-foreground cursor-help" />
                                          </TooltipTrigger>
                                          <TooltipContent className="max-w-xs">
                                              <p>We are verifying your UPI payment. This may take a few hours. If payment was successful, your order will be processed soon. Contact support if this status persists for too long.</p>
                                          </TooltipContent>
                                      </Tooltip>
                                  )}
                              </p>
                              <p className={getOrderStatusClass(order.status)}>{formatOrderStatus(order.status)}</p>
                          </div>
                          {order.status !== 'cancelled' && (
                          <div>
                              <p className="font-medium">Est. Delivery:</p>
                              <p className="text-muted-foreground">{getDeliveryEstimateText(order)}</p>
                          </div>
                          )}
                          <div>
                              <p className="font-medium">Shipping To:</p>
                              <p className="text-muted-foreground">{order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                          </div>
                           <div>
                              <p className="font-medium">Payment:</p>
                              <p className="text-muted-foreground">
                                  {order.paymentMethod.type === 'credit_card' ? `Card ending in ${order.paymentMethod.details}` :
                                   order.paymentMethod.type === 'upi' ? `UPI: ${order.paymentMethod.details || 'Paid via UPI'}` :
                                   order.paymentMethod.type === 'cod' ? 'Cash on Delivery' :
                                   `Paid via ${order.paymentMethod.type}`}
                              </p>
                          </div>
                      </div>
                      {isCancellable && (
                        <div className="mt-4 pt-3 border-t border-dashed">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={isCancellingOrder && cancellingOrderId === order.id}
                            className="text-destructive hover:bg-destructive/10 border-destructive/50 hover:border-destructive"
                          >
                            {isCancellingOrder && cancellingOrderId === order.id ? (
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <XCircle className="mr-2 h-4 w-4" />
                            )}
                            Cancel Order
                          </Button>
                        </div>
                      )}
                    </li>
                  )})}
                </ul>
              )}
          </CardContent>
        </Card>
      </PageContainer>
    </TooltipProvider>
  );
}
