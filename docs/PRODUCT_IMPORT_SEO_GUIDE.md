# HLX - Hide Luxe Legacy: Product Import & SEO Setup Guide

## Overview

This guide covers how to import the new leather product catalog into Firebase and optimize SEO for the HLX website.

---

## Part 1: Product Data Import

### Files Provided

Two product import files have been created:

1. **`products-import.json`** - JSON format for direct Firebase import
2. **`products-import.csv`** - CSV format for spreadsheet management

### Products Included

The import includes **16 premium leather products** across 6 categories:

#### Footwear (4 products)
- Premium Black Leather Oxford - ₦125,000
- Women's Brown Leather Heels - ₦95,000
- Men's Tan Leather Loafers - ₦110,000
- Women's Black Leather Boots - ₦135,000

#### Apparel & Outerwear (2 products)
- Premium Black Leather Jacket - ₦250,000
- Cognac Leather Blazer - ₦180,000

#### Bags & Travel (3 products)
- Premium Brown Leather Messenger Bag - ₦145,000
- Black Leather Tote Bag - ₦120,000
- Tan Leather Travel Backpack - ₦165,000

#### Accessories (3 products)
- Premium Brown Leather Belt - ₦35,000
- Black Leather Gloves - ₦28,000
- Cognac Leather Wallet - ₦22,000

#### Leather Interiors (2 products)
- Premium Brown Leather Sofa - ₦850,000
- Black Leather Armchair - ₦280,000

#### Automotive Leather (2 products)
- Premium Black Leather Car Seat Covers - ₦95,000
- Cognac Leather Steering Wheel Cover - ₦18,000
- Premium Leather Car Floor Mats - ₦55,000

### Method 1: Firebase Console (Manual)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to Firestore Database
4. Create a new collection called `products`
5. Click "Add Document" and manually enter product data OR
6. Use Firebase's bulk import feature (if available)

### Method 2: Firebase CLI (Recommended)

```bash
# 1. Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# 2. Login to Firebase
firebase login

# 3. Initialize Firebase in your project root
firebase init

# 4. Use the import script from your admin panel
# (See Method 3 below)
```

### Method 3: Import via React Admin Panel

1. **Add import functionality to Admin Dashboard:**

```typescript
// In src/admin/pages/AdminProducts.tsx or a new import page

import { importProductsToFirebase } from '@/scripts/importProducts';
import productsData from '@/products-import.json';

const handleImportProducts = async () => {
  try {
    const result = await importProductsToFirebase(productsData.products);
    if (result.success) {
      console.log(`✓ Imported ${result.count} products`);
      // Show success toast notification
    } else {
      console.error('Import failed:', result.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

2. **In your admin panel, add a button:**

```tsx
<button 
  onClick={handleImportProducts}
  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
>
  Import Products
</button>
```

### Method 4: Node.js Script

Create a `scripts/importToFirebase.js`:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const productsData = require('../products-import.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function importProducts() {
  try {
    const batch = db.batch();
    let count = 0;

    productsData.products.forEach((product) => {
      const ref = db.collection('products').doc(product.id);
      batch.set(ref, {
        ...product,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      count++;
    });

    await batch.commit();
    console.log(`✓ Successfully imported ${count} products`);
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error);
    process.exit(1);
  }
}

importProducts();
```

Run with: `node scripts/importToFirebase.js`

---

## Part 2: SEO Optimization

### 1. **Meta Tags & Page Titles**

All pages now include optimized meta tags with:
- Unique, keyword-rich titles (50-60 characters)
- Compelling descriptions (150-160 characters)
- Open Graph tags for social sharing
- Twitter Card tags

### 2. **Structured Data (JSON-LD)**

The `SEOHead` component adds:

- **Organization Schema**: Identifies your business
- **Product Schema**: Rich snippets for products
- **Breadcrumb Schema**: Navigation hierarchy
- **Price & Availability**: Shows prices in search results

Example in Google Search Results:
```
HLX - Premium Leather Luxury | Footwear, Apparel & Accessories
https://www.28hideluxe.com
Discover HLX's exquisite collection of premium leather footwear...
⭐ 4.8 • ₦125,000 • In Stock
```

### 3. **Image Optimization**

All products include:
- Primary image (high resolution)
- Thumbnail image (optimized for listings)
- Alt text for accessibility

**Best Practices:**
- Use descriptive alt text: "Premium Black Leather Oxford shoe for men"
- Compress images: Use tools like TinyPNG or ImageOptim
- Use WebP format when possible
- Lazy load images below the fold

### 4. **Content Optimization**

Each product page includes:

```
Title: Premium Black Leather Oxford | HLX Luxury Footwear
Meta: Handcrafted black leather oxford shoes from HLX...
H1: Premium Black Leather Oxford
H2: Product Details
- Material: 100% Genuine Italian Leather
- Description: Step into luxury...
- Price: ₦125,000
- Rating: 4.8/5 (24 reviews)
```

### 5. **SEO Configuration**

Update `/src/config/seoConfig.ts` with your specific information:

```typescript
export const SEO_CONFIG = {
  brand: 'HLX - Hide Luxe Legacy',
  website: 'https://www.28hideluxe.com',
  contact: {
    email: 'info@28hideluxe.com',
    phone: '+234 (your phone)',
    address: 'Nigeria',
  },
  social: {
    instagram: 'https://www.instagram.com/hideluxe',
    // ... other social links
  },
};
```

### 6. **Technical SEO Checklist**

- [ ] **XML Sitemap**: Generate and submit to Google Search Console
  ```xml
  <!-- public/sitemap.xml -->
  <?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>https://www.28hideluxe.com</loc>
      <priority>1.0</priority>
    </url>
    <url>
      <loc>https://www.28hideluxe.com/footwear</loc>
      <priority>0.8</priority>
    </url>
    <!-- Add more URLs -->
  </urlset>
  ```

- [ ] **Robots.txt**: Already configured in `public/robots.txt`

- [ ] **Mobile Responsiveness**: All pages are mobile-optimized

- [ ] **Page Speed**: Optimize using:
  - Code splitting
  - Image compression
  - Caching strategies
  - CDN for images

- [ ] **SSL/HTTPS**: Ensure site uses HTTPS

### 7. **Using the SEOHead Component**

```typescript
import { SEOHead } from '@/components/SEOHead';

export default function ProductPage({ product }) {
  return (
    <>
      <SEOHead
        title={`${product.name} | HLX Premium Leather`}
        description={product.description}
        image={product.image}
        type="product"
        productData={{
          name: product.name,
          price: product.price,
          image: product.image,
          description: product.description,
          currency: 'NGN',
        }}
      />
      {/* Page content */}
    </>
  );
}
```

### 8. **Categories Grid Display**

The new `CategoriesGrid` component displays:

- **Footwear Atelier**: Premium leather footwear collection
- **Apparels & Outerwear**: Sophisticated leather clothing
- **Bags & Travel**: Luxury leather bags and travel accessories
- **Accessories**: Premium leather accessories
- **Leather Interiors**: Handcrafted furniture
- **Automotive Leather**: Luxury car interiors

Each category includes:
- Category image with overlay
- Compelling description
- Call-to-action button
- Hover effects and animations

---

## Part 3: Google Search Console & Analytics

### 1. **Google Search Console Setup**

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property: `https://www.28hideluxe.com`
3. Verify ownership
4. Submit XML sitemap: `/sitemap.xml`
5. Monitor:
   - Indexed pages
   - Click-through rate (CTR)
   - Average position
   - Search queries

### 2. **Google Analytics Setup**

Add to your `index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

---

## Part 4: Hero Section Updates

The hero section now displays all 6 category messages:

```
"HLX FOOTWEAR ATELIER - Step into luxury with our impeccably crafted leather footwear collection."
"HLX APPARELS & OUTERWEAR COLLECTION - Elevate your closet with our sophisticated apparels..."
"HLX BAGS & TRAVEL COLLECTION - Go further with HLX leather bags..."
"HLX ACCESSORIES - Elevate your style with our premium and meticulous accessories"
"HLX LEATHER INTERIORS - Transform your space with premium leather-crafted furniture..."
"HLX AUTOMOTIVE LEATHER - Experience unparalleled comfort and drive luxury..."
```

---

## Part 5: Testing & Validation

### SEO Testing Tools

1. **Google Mobile-Friendly Test**
   - https://search.google.com/test/mobile-friendly

2. **Google PageSpeed Insights**
   - https://pagespeed.web.dev/

3. **Structured Data Testing**
   - https://schema.org/validator

4. **Meta Tag Testing**
   - https://www.seobilityapp.com/seo-tools/open-graph/

### Testing Steps

```bash
# 1. Run lighthouse audit
npm run build

# 2. Test mobile responsiveness
# Open in browser at different viewport sizes

# 3. Validate structured data
# Use https://schema.org/validator

# 4. Check meta tags
# Inspect page source for proper tags
```

---

## Part 6: Ongoing Optimization

### Monthly Tasks

- [ ] Review Google Search Console data
- [ ] Update product inventory and pricing
- [ ] Add new product images
- [ ] Create blog content targeting keywords
- [ ] Monitor site speed and performance
- [ ] Check for broken links
- [ ] Update social media links

### Quarterly Tasks

- [ ] Review analytics for top-performing pages
- [ ] Optimize images and page speed
- [ ] Add customer reviews and ratings
- [ ] Update product descriptions
- [ ] Refresh hero section content
- [ ] Build backlinks through partnerships

---

## Quick Reference

### File Locations

```
/products-import.json          # Product data (JSON)
/products-import.csv           # Product data (CSV)
/src/components/SEOHead.tsx    # SEO component
/src/components/CategoriesGrid.tsx # Categories display
/src/config/seoConfig.ts       # SEO configuration
/src/scripts/importProducts.ts # Import helper functions
/src/pages/Index.tsx           # Homepage with hero & categories
```

### Key Functions

```typescript
// Import products
import { importProductsToFirebase } from '@/scripts/importProducts';
const result = await importProductsToFirebase(products);

// Export products
import { exportProductsToJSON } from '@/scripts/importProducts';
const json = await exportProductsToJSON();

// Update product
import { updateProduct } from '@/scripts/importProducts';
await updateProduct('product-id', { price: 100000 });

// Get all products
import { getAllProductsFromFirebase } from '@/scripts/importProducts';
const products = await getAllProductsFromFirebase();
```

---

## Support & Troubleshooting

### Issue: Products not appearing after import

**Solution:**
1. Check Firebase Firestore console for collection
2. Verify product IDs are unique
3. Check console for import errors
4. Ensure Firebase credentials are correct

### Issue: Meta tags not showing in search results

**Solution:**
1. Verify SEOHead component is mounted
2. Check page source for meta tags
3. Submit sitemap to Google Search Console
4. Wait for Google to re-index (1-7 days)

### Issue: Images not loading

**Solution:**
1. Verify image URLs are accessible
2. Check CORS settings
3. Use HTTPS URLs
4. Compress images for faster loading

---

## Next Steps

1. ✅ Import products using one of the methods above
2. ✅ Verify products appear on website
3. ✅ Test all pages with SEO tools
4. ✅ Submit sitemap to Google Search Console
5. ✅ Monitor analytics and search console
6. ✅ Optimize based on performance data

---

**Last Updated**: November 28, 2025
**Status**: Ready for Production
