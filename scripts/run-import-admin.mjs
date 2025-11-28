import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Reads products-import.json from repository root and writes categories + products
// using Firebase Admin SDK. Requires GOOGLE_APPLICATION_CREDENTIALS env var to point
// at a service account JSON file with Firestore access.

// Try expanded file first, fall back to original
let PRODUCTS_FILE = path.resolve(process.cwd(), 'products-import-expanded.json');
if (!fs.existsSync(PRODUCTS_FILE)) {
  PRODUCTS_FILE = path.resolve(process.cwd(), 'products-import.json');
}

const CATEGORIES = [
  { id: 'footwear', name: 'Footwear', title: 'Luxury Footwear', description: 'Step into luxury with our impeccably crafted leather footwear collection.', featured: true },
  { id: 'apparel-outerwear', name: 'Apparel & Outerwear', title: 'Apparels & Outerwear', description: 'Elevate your closet with our sophisticated apparels and outerwear collections finished in premium leather details.', featured: true },
  { id: 'bags-travel', name: 'Bags & Travel', title: 'Bags & Travel', description: 'Go further with HLX leather bags for motion, work, and leisure — refined in genuine hide.', featured: true },
  { id: 'accessories', name: 'Accessories', title: 'Accessories', description: 'Elevate your style with our premium and meticulous accessories.', featured: false },
  { id: 'leather-interiors', name: 'Leather Interiors', title: 'Leather Interiors', description: 'Transform your space with premium leather-crafted furniture and accents designed for comfort and elegance.', featured: true },
  { id: 'automotive', name: 'Automotive', title: 'Automotive Leather', description: 'Experience unparalleled comfort and drive luxury with our automotive leather.', featured: true },
];

function initAdmin() {
  if (admin.apps.length === 0) {
    try {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
      console.log('Initialized Firebase Admin using application default credentials.');
    } catch (err) {
      console.error('Failed to initialize Firebase Admin SDK:', err);
      process.exit(1);
    }
  }
}

async function importCategories() {
  const db = admin.firestore();
  const batch = db.batch();

  for (const cat of CATEGORIES) {
    const ref = db.collection('categories').doc(cat.id);
    batch.set(ref, {
      name: cat.name,
      title: cat.title,
      description: cat.description,
      featured: cat.featured,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();
  console.log(`Imported ${CATEGORIES.length} categories`);
}

async function importProducts() {
  const db = admin.firestore();
  if (!fs.existsSync(PRODUCTS_FILE)) {
    console.error(`Products file not found: ${PRODUCTS_FILE}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(PRODUCTS_FILE, 'utf8');
  const parsed = JSON.parse(raw);
  const products = parsed.products || parsed;

  // Firestore limits batches to 500 writes each
  const BATCH_SIZE = 450;
  let batch = db.batch();
  let counter = 0;
  let batchCount = 0;

  for (const product of products) {
    // Strip any id/sku, let Firestore auto-generate unique doc ID
    const { id: _id, sku: _sku, ...productData } = product;
    const ref = db.collection('products').doc(); // Auto-generates unique ID

    batch.set(ref, {
      ...productData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    counter++;

    if (counter >= BATCH_SIZE) {
      await batch.commit();
      batchCount++;
      console.log(`Committed batch ${batchCount} (${counter} writes)`);
      counter = 0;
      batch = db.batch();
    }
  }

  if (counter > 0) {
    await batch.commit();
    batchCount++;
    console.log(`Committed final batch ${batchCount} (${counter} writes)`);
  }

  console.log(`Imported ${products.length} products into 'products' collection`);
}

(async () => {
  // Ensure GOOGLE_APPLICATION_CREDENTIALS is set
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error('Please set the GOOGLE_APPLICATION_CREDENTIALS environment variable to your service account JSON path.');
    console.error('PowerShell example: $env:GOOGLE_APPLICATION_CREDENTIALS = "C:\\\\path\\\\to\\\\serviceAccount.json"');
    process.exit(1);
  }

  initAdmin();
  try {
    console.log('Starting import: categories -> products');
    await importCategories();
    await importProducts();
    console.log('Import complete.');
    process.exit(0);
  } catch (err) {
    console.error('Import failed:', err);
    process.exit(1);
  }
})();
