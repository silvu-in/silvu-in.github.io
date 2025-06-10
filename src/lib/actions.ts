
'use server';

import { getProductRecommendations as getProductRecommendationsFlow } from '@/ai/flows/product-recommendations';
import type { Product } from '@/types';
import { seedTestBlogPost as seedTestBlogPostService } from '@/lib/firebase/blogService';
import { seedInitialProducts as seedInitialProductsService, getAllProducts as getAllFbProducts } from '@/lib/firebase/productService'; // Updated import

interface SimpleCartItem {
  id: string;
  name: string;
}

export async function handleGetProductRecommendations(cartItems: SimpleCartItem[]): Promise<Product[]> {
  if (!cartItems || cartItems.length === 0) {
    return [];
  }

  const cartItemNames = cartItems.map(item => item.name);

  try {
    const recommendationsOutput = await getProductRecommendationsFlow({ cartItems: cartItemNames });
    const recommendedProductNames = recommendationsOutput.recommendedProducts;

    const productsInCartIds = new Set(cartItems.map(item => item.id));
    
    // Fetch all products from Firestore to match names
    const allFirestoreProducts = await getAllFbProducts();
    
    const recommendedProductsDetails = recommendedProductNames
      .map(name => allFirestoreProducts.find(p => p.name === name && !productsInCartIds.has(p.id)))
      .filter((p): p is Product => Boolean(p))
      .slice(0, 4); 

    return recommendedProductsDetails;
  } catch (error) {
    console.error("Error getting product recommendations:", error);
    return [];
  }
}

export async function handleSeedBlogPost(): Promise<{ success?: string; error?: string }> {
  if (process.env.NODE_ENV !== 'development') {
    return { error: 'This action is only available in development mode.' };
  }
  try {
    const message = await seedTestBlogPostService();
    return { success: message };
  } catch (error: any) {
    return { error: error.message || 'Failed to seed blog post due to an unexpected error.' };
  }
}

export async function handleSeedProducts(): Promise<{ success?: string; error?: string }> {
  if (process.env.NODE_ENV !== 'development') {
    return { error: 'This action is only available in development mode.' };
  }
  try {
    const message = await seedInitialProductsService();
    return { success: message };
  } catch (error: any) {
    return { error: error.message || 'Failed to seed products due to an unexpected error.' };
  }
}
