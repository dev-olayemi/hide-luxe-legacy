/**
 * Setup Collections Migration Script
 * Inserts the "Explore Our Collections" data into Firestore
 * 
 * Run: node scripts/setup-collections.mjs
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const credentialsPath = path.join(__dirname, '..', 'hide-luxe-firebase-adminsdk-fbsvc-5619a30c86.json');

// Initialize Firebase Admin SDK
if (!fs.existsSync(credentialsPath)) {
  console.error(`❌ Firebase credentials file not found at: ${credentialsPath}`);
  console.error('Make sure you have the service account key file in the project root.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'))),
});

const db = admin.firestore();

// Collections data from the app defaults
const collectionsData = [
  {
    name: 'footwear',
    title: 'Luxury Footwear',
    description: 'Step into luxury with our impeccably crafted leather footwear collection. From classic oxfords to elegant heels, every piece is a masterpiece.',
    image: 'https://thumbs.dreamstime.com/b/close-up-photo-pair-classic-brown-leather-men-s-dress-shoes-placed-surface-near-window-bathed-soft-natural-380830117.jpg',
    link: '/category/footwear',
    featured: true,
    order: 0,
  },
  {
    name: 'apparel-outerwear',  
    title: 'Premium Apparel',
    description: 'Elevate your closet with sophisticated apparels and outerwear collections finished in premium leather details.',
    image: 'https://www.shutterstock.com/image-photo/handsome-young-man-wearing-leather-260nw-2681161871.jpg',
    link: '/category/apparel-outerwear',
    featured: true,
    order: 1,
  },
  {
    name: 'bags-travel',
    title: 'Travel Luxury',
    description: 'Go further with HLX leather bags for motion, work, and leisure. Refined in genuine hide, carry luxury with you.',
    image: 'http://www.easthillscasuals.com/cdn/shop/files/BenjaminDufflewithmale.jpg?v=1722544550',
    link: '/category/bags-travel',
    featured: true,
    order: 2,
  },
  {
    name: 'accessories',
    title: 'Refined Accessories',
    description: 'Elevate your style with our premium and meticulous accessories that complement any look.',
    image: 'https://thumbs.dreamstime.com/b/suede-bag-leather-shoes-belt-8230474.jpg',
    link: '/category/accessories',
    featured: false,
    order: 3,
  },
  {
    name: 'leather-interiors',
    title: 'Premium Furniture',
    description: 'Transform your space with premium leather-crafted furniture and accents designed for comfort and elegance.',
    image: 'https://thumbs.dreamstime.com/b/leather-brown-sofa-urban-loft-interior-elegant-dark-living-room-53980258.jpg',
    link: '/category/leather-interiors',
    featured: true,
    order: 4,
  },
  {
    name: 'automotive',
    title: 'Drive Luxury',
    description: 'Experience unparalleled comfort and drive luxury with our premium automotive leather products.',
    image: 'https://www.shutterstock.com/image-photo/premium-genesis-gv80-car-interior-260nw-2693348773.jpg',
    link: '/category/automotive',
    featured: true,
    order: 5,
  },
];
async function setupCollections() {
  console.log('📝 Setting up collections...');
  
  try {
    // Check if collections already exist
    const snap = await db.collection('collections').limit(1).get();
    
    if (!snap.empty) {
      console.log('⚠️  Collections already exist in Firestore.');
      console.log('   If you want to reset, delete the "collections" collection manually.');
      return;
    }

    console.log(`✓ No existing collections found. Adding ${collectionsData.length} collections...`);
    
    // Insert each collection
    let count = 0;
    for (const col of collectionsData) {
      await db.collection('collections').doc(col.name).set({
        ...col,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      count++;
      console.log(`  ✓ Added: ${col.title}`);
    }

    console.log(`\n✅ Successfully added ${count} collections!`);
    console.log('   You can now manage them in the admin panel at /admin/collections');
    
  } catch (err) {
    console.error('❌ Error setting up collections:', err);
    process.exit(1);
  }
}

setupCollections().then(() => {
  console.log('\n🎉 Done!');
  process.exit(0);
});
