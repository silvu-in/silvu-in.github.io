
import type { Timestamp } from 'firebase/firestore';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  featured?: boolean;
  stock: number;
  dataAiHint?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface PaymentMethod {
  type: 'credit_card' | 'paypal' | 'other' | 'upi' | 'cod'; // Added 'cod'
  details: string; // e.g., last 4 digits for CC, or PayPal email, or UPI ID for record
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified?: boolean;
  address?: Address;
  paymentMethod?: PaymentMethod;
  createdAt?: any; // Firestore Timestamp or Date
  providerData?: any[]; // Added from AuthContext
}

export interface BlogPost {
  id: string; // Firestore document ID
  slug: string;
  title: string;
  content: string; // HTML content
  excerpt?: string;
  author: string;
  publishedDate: string; // Formatted date string e.g., "June 1, 2024"
  imageUrl?: string; // Optional
  dataAiHint?: string; // Optional for image
}

export interface FundingCampaign {
  id: string;
  goalAmount: number;
  currentAmount: number;
  campaignTitle: string;
  campaignDescription: string;
  currency?: string; // e.g., "INR", "USD"
}

export interface Funder {
  id: string;
  name: string;
  amount: number;
  date: string; // Changed from fundedAt, expected to be a formatted date string
  // accountDetails?: string; // Field mentioned by user, but typically sensitive. Not adding to public display type.
  avatarUrl?: string;
  message?: string;
  dataAiHint?: string; // For avatar placeholder
}

// New Order Types
export interface OrderItem extends Product {
  quantity: number;
}

export type OrderStatus = 
  | 'pending' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'payment_pending_verification'; // Added new status

export interface Order {
  id: string; // Firestore document ID
  userId: string;
  userEmail: string | null;
  userName?: string | null;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  orderDate: Timestamp;
  estimatedDeliveryDate: Timestamp;
  status: OrderStatus; // Updated to use OrderStatus type
}
