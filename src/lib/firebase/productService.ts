
import { db } from './client';
import { collection, getDocs, doc, getDoc, setDoc, query, where, writeBatch, Timestamp, orderBy, limit } from 'firebase/firestore';
import type { Product } from '@/types';
import { initialProducts } from '@/data/products'; // For seeding

const PRODUCTS_COLLECTION = 'products';

// Helper to map Firestore document to Product type
// Ensures all fields are present and have correct types, especially for optional ones
function mapDocToProduct(document: any): Product {
  const data = document.data();
  return {
    id: document.id,
    name: data.name || 'Unnamed Product',
    description: data.description || '',
    price: data.price || 0,
    imageUrl: data.imageUrl || 'https://placehold.co/600x400.png',
    category: data.category || 'General',
    featured: data.featured || false,
    stock: data.stock || 0,
    dataAiHint: data.dataAiHint || 'product image',
    // Add any other fields from your Product type with defaults if necessary
  };
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    // You might want to add orderBy here, e.g., orderBy('name')
    const q = query(productsRef, orderBy('name'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(mapDocToProduct);
  } catch (error) {
    console.error("Error fetching all products:", error);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const productDocRef = doc(db, PRODUCTS_COLLECTION, id);
    const docSnap = await getDoc(productDocRef);
    if (docSnap.exists()) {
      return mapDocToProduct(docSnap);
    }
    return null;
  } catch (error) {
    console.error(`Error fetching product by ID ${id}:`, error);
    return null;
  }
}

export async function getFeaturedProducts(count: number = 4): Promise<Product[]> {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(productsRef, where('featured', '==', true), limit(count));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(mapDocToProduct);
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

export async function getAllProductIds(): Promise<{ id: string }[]> {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(productsRef); // No need to order if just getting IDs
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(document => ({ id: document.id }));
  } catch (error) {
    console.error("Error fetching all product IDs:", error);
    return [];
  }
}


// Seed initial products into Firestore
export async function seedInitialProducts(): Promise<string> {
  const batch = writeBatch(db);
  let seededCount = 0;
  let existingCount = 0;

  for (const product of initialProducts) {
    const productRef = doc(db, PRODUCTS_COLLECTION, product.id);
    const docSnap = await getDoc(productRef);

    if (!docSnap.exists()) {
      // Ensure all fields from Product type are included, even if undefined in initialProducts
      const productData: Omit<Product, 'id'> & { createdAt?: Timestamp } = {
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        dataAiHint: product.dataAiHint || 'product image',
        category: product.category,
        featured: product.featured || false,
        stock: product.stock,
        createdAt: Timestamp.now(), // Add a timestamp for creation
      };
      batch.set(productRef, productData);
      seededCount++;
    } else {
      existingCount++;
    }
  }

  if (seededCount > 0) {
    await batch.commit();
    return `${seededCount} products seeded successfully. ${existingCount} products already existed.`;
  } else {
    return `No new products to seed. ${existingCount} products already existed.`;
  }
}
