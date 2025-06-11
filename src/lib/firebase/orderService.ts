
'use client';

import { db } from './client';
import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  WriteBatch,
  writeBatch,
  getDoc,
} from 'firebase/firestore';
import type { Order, OrderItem, Address, PaymentMethod, OrderStatus } from '@/types';

const ORDERS_COLLECTION = 'orders';
const USER_ORDERS_SUBCOLLECTION = 'userOrders';

/**
 * Creates an order in Firestore, one for admin view and one for user's history.
 * @param userId The ID of the user placing the order.
 * @param orderData The core order data.
 * @returns A promise that resolves with the ID of the created order.
 */
export async function createOrder(
  userId: string,
  userEmail: string | null,
  userName: string | null | undefined,
  items: OrderItem[],
  totalAmount: number,
  shippingAddress: Address,
  paymentMethod: PaymentMethod,
  estimatedDeliveryDays: number = 7,
  status: OrderStatus = 'pending'
): Promise<string> {
  if (!userId) throw new Error('User ID is required to create an order.');

  const orderDate = Timestamp.now();
  const estimatedDeliveryDate = Timestamp.fromDate(
    new Date(orderDate.toDate().setDate(orderDate.toDate().getDate() + estimatedDeliveryDays))
  );

  const newOrderData: Omit<Order, 'id'> = {
    userId,
    userEmail,
    userName: userName || 'N/A',
    items,
    totalAmount,
    shippingAddress,
    paymentMethod,
    orderDate,
    estimatedDeliveryDate,
    status,
  };

  const batch: WriteBatch = writeBatch(db);

  // Create a new document in the main 'orders' collection
  const adminOrderRef = doc(collection(db, ORDERS_COLLECTION));
  batch.set(adminOrderRef, newOrderData);

  // Also write to user's subcollection using the same ID for consistency
  const userOrderRef = doc(db, `users/${userId}/${USER_ORDERS_SUBCOLLECTION}`, adminOrderRef.id);
  batch.set(userOrderRef, newOrderData);
  
  try {
    await batch.commit();
    return adminOrderRef.id;
  } catch (error) {
    console.error('Error creating order in Firestore:', error);
    throw new Error('Could not create order.');
  }
}

/**
 * Fetches all orders for a specific user from their 'userOrders' subcollection.
 * @param userId The ID of the user whose orders to fetch.
 * @returns A promise that resolves with an array of the user's orders.
 */
export async function getUserOrders(userId: string): Promise<Order[]> {
  if (!userId) {
    console.warn('User ID is required to fetch orders.');
    return [];
  }
  try {
    // Fetch from the user's specific 'userOrders' subcollection
    const userOrdersRef = collection(db, `users/${userId}/${USER_ORDERS_SUBCOLLECTION}`);
    // Query orders by date
    const q = query(userOrdersRef, orderBy('orderDate', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
    } as Order));
  } catch (error) {
    console.error(`Error fetching orders for user ${userId} from their subcollection:`, error);
    return [];
  }
}

/**
 * Cancels an order if it's in a cancellable state.
 * Updates status in both main orders collection and user's subcollection.
 * @param userId The ID of the user owning the order.
 * @param orderId The ID of the order to cancel.
 * @returns A promise that resolves when the operation is complete.
 */
export async function cancelOrder(userId: string, orderId: string): Promise<void> {
  if (!userId) throw new Error('User ID is required to cancel an order.');
  if (!orderId) throw new Error('Order ID is required to cancel an order.');

  // Reference to the order in the main collection
  const adminOrderRef = doc(db, ORDERS_COLLECTION, orderId);
  // Reference to the order in the user's subcollection
  const userOrderRef = doc(db, `users/${userId}/${USER_ORDERS_SUBCOLLECTION}`, orderId);

  try {
    // Fetch the order from the main collection to check its status (or user's subcollection, either is fine for status check)
    const orderSnap = await getDoc(adminOrderRef); // Using admin copy as primary source for status check
    if (!orderSnap.exists()) {
      throw new Error('Order not found in main collection.');
    }
    
    const orderDataInMain = orderSnap.data();
    if (orderDataInMain?.userId !== userId) {
      throw new Error('Order does not belong to this user.');
    }


    const orderData = orderSnap.data() as Order; // Assuming it exists and userId matches
    const cancellableStatuses: OrderStatus[] = ['pending', 'payment_pending_verification', 'processing'];

    if (!cancellableStatuses.includes(orderData.status)) {
      throw new Error(`Order cannot be cancelled. Current status: ${orderData.status}`);
    }

    const batch = writeBatch(db);
    // Update the main order document
    batch.update(adminOrderRef, { status: 'cancelled' });
    
    // Check if the user's subcollection document exists and update it
    const userOrderSnap = await getDoc(userOrderRef);
    if (userOrderSnap.exists()) {
        batch.update(userOrderRef, { status: 'cancelled' });
    } else {
        console.warn(`Order ${orderId} not found in user's subcollection (users/${userId}/${USER_ORDERS_SUBCOLLECTION}) during cancellation, but updating main collection.`);
    }


    await batch.commit();
  } catch (error)
 {
    console.error(`Error cancelling order ${orderId} for user ${userId}:`, error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error('Could not cancel order.');
  }
}

