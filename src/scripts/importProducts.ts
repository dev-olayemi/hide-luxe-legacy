/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Firebase Product Import Helper
 * 
 * This script helps you import the products from the JSON file into Firebase Firestore.
 * 
 * Usage Instructions:
 * 1. Install Firebase CLI: npm install -g firebase-tools
 * 2. Authenticate: firebase login
 * 3. Copy this script to your Firebase functions or run locally with Node.js
 * 4. Update the products collection path as needed
 * 
 * To use programmatically:
 * 
 * import { importProductsToFirebase } from '@/scripts/importProducts';
 * import productsData from '@/products-import.json';
 * 
 * // In your admin panel:
 * await importProductsToFirebase(productsData.products);
 */

import { db } from '@/firebase/firebaseConfig';
import {
  collection,
  addDoc,
  setDoc,
  doc,
  writeBatch,
  query,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';

export interface Product {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  price: number;
  originalPrice: number;
  description: string;
  images: string[];
  thumbnail: string;
  colors: string[];
  sizes: string[];
  material: string;
  isNew: boolean;
  isFeatured: boolean;
  rating: number;
  reviews: number;
  inStock: boolean;
  tags: string[];
}

/**
 * Import products into Firestore in batches
 * @param products Array of product objects
 * @param collectionName Name of the collection to import to
 * @returns Promise with success status and count
 */
export const importProductsToFirebase = async (
  products: Product[],
  collectionName: string = 'products'
): Promise<{ success: boolean; count: number; error?: string }> => {
  try {
    const batch = writeBatch(db);
    let count = 0;

    products.forEach((product) => {
      const { id: _id, ...productData } = product as any;
      const docRef = doc(db, collectionName, (product as any).id);
      batch.set(docRef, {
        ...productData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      count++;
    });

    await batch.commit();
    console.log(`✓ Successfully imported ${count} products`);
    return { success: true, count };
  } catch (error) {
    console.error('✗ Error importing products:', error);
    return {
      success: false,
      count: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Clear all products from a collection
 * @param collectionName Name of the collection to clear
 */
export const clearProductsCollection = async (
  collectionName: string = 'products'
): Promise<{ success: boolean; deletedCount: number }> => {
  try {
    const q = query(collection(db, collectionName));
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);
    let count = 0;

    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
      count++;
    });

    await batch.commit();
    console.log(`✓ Successfully deleted ${count} products`);
    return { success: true, deletedCount: count };
  } catch (error) {
    console.error('✗ Error clearing products:', error);
    return { success: false, deletedCount: 0 };
  }
};

/**
 * Get all products from Firestore
 */
export const getAllProductsFromFirebase = async (
  collectionName: string = 'products'
): Promise<Product[]> => {
  try {
    const q = query(collection(db, collectionName));
    const querySnapshot = await getDocs(q);
    const products: Product[] = [];

    querySnapshot.forEach((doc) => {
      products.push({
        ...doc.data(),
        id: doc.id,
      } as Product);
    });

    return products;
  } catch (error) {
    console.error('✗ Error fetching products:', error);
    return [];
  }
};

/**
 * Export products to JSON (for backup)
 */
export const exportProductsToJSON = async (
  collectionName: string = 'products'
): Promise<string> => {
  const products = await getAllProductsFromFirebase(collectionName);
  return JSON.stringify({ products }, null, 2);
};

/**
 * Update a single product
 */
export const updateProduct = async (
  productId: string,
  updates: Partial<Product>,
  collectionName: string = 'products'
): Promise<{ success: boolean; error?: string }> => {
  try {
    const docRef = doc(db, collectionName, productId);
    await setDoc(
      docRef,
      {
        ...updates,
        updatedAt: new Date(),
      },
      { merge: true }
    );
    return { success: true };
  } catch (error) {
    console.error('✗ Error updating product:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Delete a single product
 */
export const deleteProduct = async (
  productId: string,
  collectionName: string = 'products'
): Promise<{ success: boolean; error?: string }> => {
  try {
    await deleteDoc(doc(db, collectionName, productId));
    return { success: true };
  } catch (error) {
    console.error('✗ Error deleting product:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
