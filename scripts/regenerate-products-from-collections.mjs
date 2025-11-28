import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Collection images directory
const collectionsDir = path.join(__dirname, '..', 'public', 'collections');
const productsJsonPath = path.join(__dirname, '..', 'products-import-expanded.json');

// Product type keywords mapping from filename
const productTypeMap = {
  'shoe': { category: 'Footwear', type: 'shoe', desc: 'premium leather shoe' },
  'loafer': { category: 'Footwear', type: 'loafer', desc: 'comfortable leather loafer' },
  'boot': { category: 'Footwear', type: 'boot', desc: 'stylish leather boot' },
  'heel': { category: 'Footwear', type: 'heel', desc: 'elegant leather heel' },
  'oxford': { category: 'Footwear', type: 'oxford', desc: 'classic leather oxford' },
  'jacket': { category: 'Apparel & Outerwear', type: 'jacket', desc: 'premium leather jacket' },
  'coat': { category: 'Apparel & Outerwear', type: 'coat', desc: 'luxurious leather coat' },
  'shirt': { category: 'Apparel & Outerwear', type: 'shirt', desc: 'fine leather shirt' },
  'bag': { category: 'Bags & Travel', type: 'bag', desc: 'quality leather bag' },
  'sling': { category: 'Bags & Travel', type: 'sling', desc: 'stylish sling bag' },
  'backpack': { category: 'Bags & Travel', type: 'backpack', desc: 'durable leather backpack' },
  'luggage': { category: 'Bags & Travel', type: 'luggage', desc: 'premium leather luggage' },
  'travel': { category: 'Bags & Travel', type: 'travel', desc: 'travel leather accessory' },
  'belt': { category: 'Accessories', type: 'belt', desc: 'quality leather belt' },
  'watch': { category: 'Accessories', type: 'watch', desc: 'leather watch strap' },
  'strap': { category: 'Accessories', type: 'strap', desc: 'premium leather strap' },
  'glove': { category: 'Accessories', type: 'glove', desc: 'soft leather gloves' },
  'cap': { category: 'Accessories', type: 'cap', desc: 'leather cap' },
  'hat': { category: 'Accessories', type: 'hat', desc: 'leather hat' },
  'keychain': { category: 'Accessories', type: 'keychain', desc: 'leather keychain' },
  'wallet': { category: 'Accessories', type: 'wallet', desc: 'leather wallet' },
  'scarf': { category: 'Accessories', type: 'scarf', desc: 'leather scarf' },
  'holster': { category: 'Accessories', type: 'holster', desc: 'leather holster' },
  'sofa': { category: 'Leather Interiors', type: 'sofa', desc: 'premium leather sofa' },
  'furniture': { category: 'Leather Interiors', type: 'furniture', desc: 'leather furniture' },
  'interior': { category: 'Leather Interiors', type: 'interior', desc: 'leather interior' },
  'seat': { category: 'Automotive', type: 'seat', desc: 'premium leather car seat' },
  'mat': { category: 'Automotive', type: 'mat', desc: 'leather car floor mat' },
  'cover': { category: 'Automotive', type: 'cover', desc: 'premium leather car cover' },
  'automotive': { category: 'Automotive', type: 'automotive', desc: 'automotive leather' },
};

// Generate product name from filename
function generateProductName(filename) {
  // Remove extension
  const withoutExt = filename.replace(/\.[^/.]+$/, '');
  // Replace hyphens with spaces and capitalize
  return withoutExt
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Detect product category and type from filename
function detectProductType(filename) {
  const lower = filename.toLowerCase();
  for (const [keyword, typeData] of Object.entries(productTypeMap)) {
    if (lower.includes(keyword)) {
      return typeData;
    }
  }
  return { category: 'Accessories', type: 'accessory', desc: 'premium leather accessory' };
}

// Detect colors from filename
function detectColors(filename) {
  const lower = filename.toLowerCase();
  const colorMap = {
    black: 'Black',
    brown: 'Brown',
    tan: 'Tan',
    cognac: 'Cognac',
    red: 'Red',
    blue: 'Blue',
    green: 'Green',
    white: 'White',
    grey: 'Grey',
    gray: 'Gray',
    burgundy: 'Burgundy',
    navy: 'Navy',
    chocolate: 'Chocolate',
    caramel: 'Caramel',
    cream: 'Cream',
    deep: 'Deep',
    cool: 'Cool',
    nice: 'Nice',
    premium: 'Premium',
  };

  const colors = [];
  for (const [key, color] of Object.entries(colorMap)) {
    if (lower.includes(key)) {
      colors.push(color);
    }
  }
  return colors.length > 0 ? colors : ['Black'];
}

// Generate product description
function generateDescription(productName, typeData) {
  const descriptions = {
    shoe: `Discover luxury footwear crafted with meticulous attention to detail. Our ${productName} features premium 100% genuine leather, hand-stitched construction, and ergonomic design for all-day comfort. Perfect for both professional and casual settings.`,
    loafer: `Experience comfort and style with our ${productName}. Handcrafted from the finest leather with flexible soles and breathable lining. Ideal for casual outings and relaxed professional environments.`,
    boot: `Step into sophistication with our ${productName}. Premium leather construction with reinforced support and durable soles. Perfect for any season and occasion.`,
    heel: `Elevate your wardrobe with our ${productName}. Hand-stitched from premium leather with elegant design and cushioned insole for all-day comfort. Ideal for evening events and special occasions.`,
    oxford: `Discover timeless elegance with our ${productName}. Classic leather construction with traditional lace-up design and refined hand-stitching. Perfect for formal events and professional settings.`,
    jacket: `Make a statement with our ${productName}. Premium leather crafted with modern design, quality hardware, and comfortable fit. A versatile piece for any wardrobe.`,
    bag: `Carry in style with our ${productName}. Quality leather construction with functional design and durable hardware. Perfect for work, travel, or everyday use.`,
    belt: `Complete your look with our ${productName}. Premium leather with quality buckle and refined craftsmanship. A timeless accessory for any wardrobe.`,
    watch: `Elevate your wrist with our ${productName}. Premium leather strap with quality construction and elegant design. Perfect for any occasion.`,
    glove: `Stay warm in style with our ${productName}. Soft leather with comfortable fit and quality stitching. Perfect for winter and formal occasions.`,
    sofa: `Transform your space with our ${productName}. Premium leather construction with comfortable seating and elegant design. A luxurious centerpiece for any room.`,
    seat: `Experience luxury driving with our ${productName}. Premium leather car seats with superior comfort and quality construction. Upgrade your vehicle's interior.`,
  };

  return descriptions[typeData.type] || `Experience premium quality with our ${productName}. Crafted from 100% genuine leather with meticulous attention to detail and superior craftsmanship. Perfect for discerning customers.`;
}

// Generate random rating between 4.5 and 5.0
function generateRating() {
  return parseFloat((4.5 + Math.random() * 0.5).toFixed(1));
}

// Generate random review count
function generateReviews() {
  return Math.floor(Math.random() * 50) + 10;
}

// Generate price based on product type
function generatePrice(productType) {
  const basePrices = {
    shoe: [120000, 180000],
    loafer: [100000, 150000],
    boot: [130000, 200000],
    heel: [90000, 150000],
    oxford: [120000, 160000],
    jacket: [200000, 400000],
    coat: [250000, 500000],
    bag: [80000, 200000],
    belt: [20000, 50000],
    watch: [30000, 80000],
    glove: [15000, 40000],
    sofa: [500000, 1500000],
    seat: [150000, 300000],
  };

  const range = basePrices[productType.type] || [50000, 200000];
  const price = Math.floor(Math.random() * (range[1] - range[0]) + range[0]);
  return Math.round(price / 5000) * 5000; // Round to nearest 5000
}

// Main function
async function regenerateProducts() {
  console.log('🔄 Regenerating products from collection images...\n');

  // Read collection images
  const files = fs.readdirSync(collectionsDir).filter(f => /\.(jpg|jpeg|png)$/i.test(f));

  if (files.length === 0) {
    console.error('❌ No images found in public/collections/');
    process.exit(1);
  }

  console.log(`📸 Found ${files.length} collection images\n`);

  const products = [];

  for (const filename of files) {
    const productName = generateProductName(filename);
    const typeData = detectProductType(filename);
    const colors = detectColors(filename);
    const price = generatePrice(typeData);
    const originalPrice = Math.round(price * 1.2);
    const rating = generateRating();
    const reviews = generateReviews();
    const description = generateDescription(productName, typeData);
    const imagePath = `/collections/${filename}`;

    const product = {
      name: productName,
      category: typeData.category,
      subcategory: typeData.type.charAt(0).toUpperCase() + typeData.type.slice(1),
      price,
      originalPrice,
      description,
      images: [imagePath],
      thumbnail: imagePath,
      colors,
      sizes: typeData.type.includes('shoe') || typeData.type.includes('loafer') || typeData.type.includes('boot') || typeData.type.includes('heel') || typeData.type.includes('oxford')
        ? ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46']
        : typeData.type.includes('jacket') || typeData.type.includes('coat') || typeData.type.includes('shirt')
        ? ['XS', 'S', 'M', 'L', 'XL', 'XXL']
        : [],
      material: '100% Genuine Premium Leather',
      isNew: Math.random() > 0.5,
      isFeatured: Math.random() > 0.3,
      rating,
      reviews,
      inStock: true,
      orderCount: Math.floor(Math.random() * 100),
      tags: [
        typeData.type,
        typeData.category.toLowerCase().replace(/ /g, '-'),
        'leather',
        'premium',
        'handcrafted',
        ...colors.map(c => c.toLowerCase()),
      ],
      image: imagePath,
    };

    products.push(product);
  }

  // Save to JSON file
  const outputData = { products };
  fs.writeFileSync(productsJsonPath, JSON.stringify(outputData, null, 2));

  console.log(`✅ Regenerated ${products.length} products`);
  console.log(`💾 Saved to products-import-expanded.json\n`);

  // Show sample
  console.log('📦 Sample product:');
  console.log(JSON.stringify(products[0], null, 2));
}

regenerateProducts().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
