import { db } from '@/firebase/firebaseConfig';
import { doc, setDoc, writeBatch } from 'firebase/firestore';

/**
 * Categories to import into Firestore
 * IDs will be slugs (lowercase, dashes)
 */
const CATEGORIES = [
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
    title: 'Apparels & Outerwear',
    description:
      'Elevate your closet with our sophisticated apparels and outerwear collections finished in premium leather details.',
    featured: true,
  },
  {
    id: 'bags-travel',
    name: 'Bags & Travel',
    title: 'Bags & Travel',
    description:
      'Go further with HLX leather bags for motion, work, and leisure — refined in genuine hide. Carry luxury with you.',
    featured: true,
  },
  {
    id: 'accessories',
    name: 'Accessories',
    title: 'Accessories',
    description: 'Elevate your style with our premium and meticulous accessories.',
    featured: false,
  },
  {
    id: 'leather-interiors',
    name: 'Leather Interiors',
    title: 'Leather Interiors',
    description:
      'Transform your space with premium leather-crafted furniture and accents designed for comfort and elegance.',
    featured: true,
  },
  {
    id: 'automotive',
    name: 'Automotive',
    title: 'Automotive Leather',
    description:
      'Experience unparalleled comfort and drive luxury with our automotive leather.',
    featured: true,
  },
];

export const importCategoriesToFirebase = async (collectionName = 'categories') => {
  try {
    const batch = writeBatch(db);
    for (const cat of CATEGORIES) {
      const docRef = doc(db, collectionName, cat.id);
      batch.set(docRef, {
        name: cat.name,
        title: cat.title,
        description: cat.description,
        featured: cat.featured,
        updatedAt: new Date(),
      });
    }
    await batch.commit();
    console.log(`Imported ${CATEGORIES.length} categories to '${collectionName}'`);
    return { success: true, count: CATEGORIES.length };
  } catch (err) {
    console.error('Error importing categories', err);
    return { success: false, error: err };
  }
};

// If run directly with node (via ts-node / compiled), allow quick import
if ((global as any).process && require.main === module) {
  (async () => {
    const res = await importCategoriesToFirebase();
    if (!res.success) process.exit(1);
    process.exit(0);
  })();
}
