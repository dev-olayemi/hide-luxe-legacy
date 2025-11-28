import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const credentialsPath = path.join(__dirname, '..', 'hide-luxe-firebase-adminsdk-fbsvc-5619a30c86.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'))),
});

const db = admin.firestore();

async function clearCollections() {
  console.log('🗑️  Clearing Firestore collections...');

  const collectionsToDelete = ['products', 'categories'];

  for (const collectionName of collectionsToDelete) {
    console.log(`  Deleting all documents in "${collectionName}"...`);
    const snapshot = await db.collection(collectionName).get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log(`  ✓ Cleared "${collectionName}"`);
  }

  console.log('✓ Database cleared!\n');
}

async function importCategories() {
  console.log('📁 Importing categories...');

  const categories = [
    {
      id: 'footwear',
      name: 'Footwear',
      title: 'Luxury Footwear',
      description:
        'Step into luxury with our impeccably crafted leather footwear collection. From classic oxfords to elegant heels, every piece is a masterpiece.',
      featured: true,
    },
    {
      id: 'apparel-outerwear',
      name: 'Apparel & Outerwear',
      title: 'Premium Apparel',
      description:
        'Elevate your closet with sophisticated apparels and outerwear collections finished in premium leather details.',
      featured: true,
    },
    {
      id: 'bags-travel',
      name: 'Bags & Travel',
      title: 'Travel Luxury',
      description:
        'Go further with HLX leather bags for motion, work, and leisure. Refined in genuine hide, carry luxury with you.',
      featured: true,
    },
    {
      id: 'accessories',
      name: 'Accessories',
      title: 'Refined Accessories',
      description:
        'Elevate your style with our premium and meticulous accessories that complement any look.',
      featured: false,
    },
    {
      id: 'leather-interiors',
      name: 'Leather Interiors',
      title: 'Premium Furniture',
      description:
        'Transform your space with premium leather-crafted furniture and accents designed for comfort and elegance.',
      featured: true,
    },
    {
      id: 'automotive',
      name: 'Automotive Leather',
      title: 'Drive Luxury',
      description:
        'Experience unparalleled comfort and drive luxury with our premium automotive leather products.',
      featured: true,
    },
  ];

  let batch = db.batch();
  let batchCount = 0;

  for (const cat of categories) {
    const docRef = db.collection('categories').doc(cat.id);
    batch.set(docRef, { ...cat });
    batchCount++;

    if (batchCount === 500) {
      await batch.commit();
      batch = db.batch();
      batchCount = 0;
    }
  }

  if (batchCount > 0) await batch.commit();

  console.log(`✓ Imported ${categories.length} categories\n`);
}

async function importProducts() {
  console.log('📦 Importing products from products-import-expanded.json...');

  const productsPath = path.join(__dirname, '..', 'products-import-expanded.json');
  const rawData = fs.readFileSync(productsPath, 'utf-8');
  const parsed = JSON.parse(rawData);
  const products = Array.isArray(parsed) ? parsed : parsed.products || [];

  if (products.length === 0) {
    console.warn('⚠️  No products found in file');
    return;
  }

  let batch = db.batch();
  let batchCount = 0;
  let importedCount = 0;

  for (const product of products) {
    const docRef = db.collection('products').doc();
    const productData = { ...product };
    delete productData.id; // Remove embedded id field
    delete productData.sku; // Remove sku if present

    batch.set(docRef, productData);
    batchCount++;
    importedCount++;

    if (batchCount === 500) {
      await batch.commit();
      batch = db.batch();
      batchCount = 0;
      console.log(`  ${importedCount}/${products.length} products imported...`);
    }
  }

  if (batchCount > 0) await batch.commit();

  console.log(`✓ Imported ${importedCount} products\n`);
}

async function main() {
  try {
    console.log('🚀 Starting database clear and reimport...\n');
    await clearCollections();
    await importCategories();
    await importProducts();
    console.log('✅ All done! Database is now fresh with new data.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
