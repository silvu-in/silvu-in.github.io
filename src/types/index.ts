
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
  type: 'credit_card' | 'paypal' | 'other';
  details: string; // e.g., last 4 digits for CC, or PayPal email
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
  fundedAt: string; // Formatted date string
  avatarUrl?: string;
  message?: string;
  dataAiHint?: string; // For avatar placeholder
}
