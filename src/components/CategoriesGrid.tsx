/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Footprints, Shirt, Backpack, Sparkles, Sofa, Zap } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';
import { useCurrency } from '@/contexts/CurrencyContext';
import OptimizedImage from './OptimizedImage';

interface CategoryItem {
  id: string; // slug
  name: string;
  title: string;
  description: string;
  image?: string;
  featured?: boolean;
}

// Category gradient & icon mapping for unique visual identity
const categoryStyles: Record<string, { gradient: string; icon: React.ReactNode }> = {
  'footwear': {
    gradient: 'from-amber-600 to-yellow-500',
    icon: <Footprints className="w-24 h-24 text-yellow-200 opacity-30" />
  },
  'apparel-outerwear': {
    gradient: 'from-slate-700 to-slate-500',
    icon: <Shirt className="w-24 h-24 text-slate-200 opacity-30" />
  },
  'bags-travel': {
    gradient: 'from-orange-700 to-orange-500',
    icon: <Backpack className="w-24 h-24 text-orange-200 opacity-30" />
  },
  'accessories': {
    gradient: 'from-purple-600 to-pink-500',
    icon: <Sparkles className="w-24 h-24 text-pink-200 opacity-30" />
  },
  'leather-interiors': {
    gradient: 'from-green-700 to-green-500',
    icon: <Sofa className="w-24 h-24 text-green-200 opacity-30" />
  },
  'automotive': {
    gradient: 'from-red-700 to-red-500',
    icon: <Zap className="w-24 h-24 text-red-200 opacity-30" />
  },
  'specialty': {
    gradient: 'from-purple-600 to-pink-500',
    icon: <Sparkles className="w-24 h-24 text-pink-200 opacity-30" />
  },
};

// Map category slugs to public collection image filenames (served from /collections)
const collectionImageMap: Record<string, string> = {
  'footwear': 'brown-men-shoe.jpg',
  'apparel-outerwear': 'ladies.jpg',
  'bags-travel': 'leather-bag.jpg',
  'accessories': '4-in-1-leather-accessories.jpg',
  'leather-interiors': 'deep-brown-bag.jpg',
  'automotive': 'Back-bag-for-men.jpg',
  'specialty': 'cool-brown-bag.jpg',
};

const defaultCategories: CategoryItem[] = [
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

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const CategoriesGrid = () => {
  const [categories, setCategories] = React.useState<CategoryItem[]>(defaultCategories);
  const [products, setProducts] = React.useState<any[]>([]);
  const [sortBy, setSortBy] = React.useState<'name' | 'rating' | 'popularity' | 'orders'>('name');

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        // First try to fetch from 'collections' collection (admin-managed)
        const collectionsSnap = await getDocs(collection(db, 'collections'));
        if (!collectionsSnap.empty) {
          const items: CategoryItem[] = collectionsSnap.docs.map((d) => {
            const data = d.data() as any;
            return {
              id: data.name || d.id,
              name: data.name || data.title || d.id,
              title: data.title || data.name || d.id,
              description: data.description || '',
              image: data.image,
              featured: data.featured ?? true,
            };
          });
          // Sort by order if available
          items.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
          setCategories(items);
          return;
        }

        // Fallback to categories collection
        const q = collection(db, 'categories');
        const snap = await getDocs(q);
        if (!snap.empty) {
          const items: CategoryItem[] = snap.docs.map((d) => {
            const data = d.data() as any;
            return {
              id: d.id,
              name: data.name || data.title || d.id,
              title: data.title || data.name || d.id,
              description: data.description || '',
              image: data.image,
              featured: data.featured ?? true,
            };
          });
          setCategories(items);
        }
      } catch (err) {
        // keep fallback
        console.error('Failed to load categories from DB, using fallback', err);
      }
    };

    fetchCategories();
  }, []);

  // Load ALL products to display
  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = collection(db, 'products');
        const snap = await getDocs(q);
        if (!snap.empty) {
          const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
          
          // Sort based on sortBy
          const sorted = [...items];
          if (sortBy === 'name') {
            sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
          } else if (sortBy === 'rating') {
            sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          } else if (sortBy === 'popularity') {
            sorted.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
          } else if (sortBy === 'orders') {
            sorted.sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0));
          }
          
          setProducts(sorted);
        }
      } catch (err) {
        console.error('Failed to load products', err);
      }
    };

    fetchProducts();
  }, [sortBy]);

  // Helper to pick a fallback image from collections based on product name
  const getProductImage = (product: any) => {
    if (product.image) return product.image;
    const name = (product.name || product.title || '').toString().toLowerCase();
    if (name.includes('shoe') || name.includes('loafer') || name.includes('oxford')) return `/collections/${collectionImageMap['footwear']}`;
    if (name.includes('jacket') || name.includes('coat') || name.includes('shirt')) return `/collections/${collectionImageMap['apparel-outerwear']}`;
    if (name.includes('bag') || name.includes('sling') || name.includes('back')) return `/collections/${collectionImageMap['bags-travel']}`;
    if (name.includes('watch') || name.includes('belt') || name.includes('glove') || name.includes('cap')) return `/collections/${collectionImageMap['accessories']}`;
    if (name.includes('sofa') || name.includes('furniture') || name.includes('interior')) return `/collections/${collectionImageMap['leather-interiors']}`;
    if (name.includes('car') || name.includes('automotive') || name.includes('seat')) return `/collections/${collectionImageMap['automotive']}`;
    return `/collections/${collectionImageMap['specialty']}`;
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white via-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Explore Our Collections
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our handcrafted leather collections, each designed with meticulous attention to detail and premium materials.
          </p>
        </div>

        {/* Featured Categories - Larger Grid with Real Images */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {categories.filter((cat) => cat.featured).map((category, index) => {
            const slug = category.id || slugify(category.name);
            // Use image from database if available, otherwise fallback
            const imageUrl = category.image || `/collections/${collectionImageMap[slug] || collectionImageMap['specialty']}`;
            return (
              <Link
                key={slug}
                to={`/category/${slug}`}
                className="group relative overflow-hidden rounded-2xl h-80 md:h-96 transform transition-all duration-500 hover:scale-105 hover:shadow-2xl"
              >
                {/* Background Image */}
                <img
                  src={imageUrl}
                  alt={category.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Dark Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20 group-hover:from-black/85 transition-all duration-300" />

                {/* Corner Accent */}
                <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                  <h3 className="text-2xl md:text-3xl font-bold mb-2">
                    {category.title}
                  </h3>
                  <p className="text-sm md:text-base opacity-90 mb-4 line-clamp-2">
                    {category.description}
                  </p>
                  <div className="flex items-center gap-2 text-white group-hover:translate-x-1 transition-transform duration-300">
                    <span className="font-semibold">Explore</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>

                {/* Badge */}
                <div className="absolute top-4 right-4 px-3 py-1 bg-white text-gray-900 text-xs font-bold rounded-full">
                  {index + 1}/{categories.filter((c) => c.featured).length}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Secondary Categories with Real Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.filter((cat) => !cat.featured).map((category) => {
            const slug = category.id || slugify(category.name);
            // Use image from database if available, otherwise fallback
            const imageUrl = category.image || `/collections/${collectionImageMap[slug] || collectionImageMap['specialty']}`;
            return (
              <Link
                key={slug}
                to={`/category/${slug}`}
                className="group relative overflow-hidden rounded-2xl h-64 md:h-72 transform transition-all duration-500 hover:scale-105 hover:shadow-xl"
              >
                {/* Background Image */}
                <img
                  src={imageUrl}
                  alt={category.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/85 transition-all duration-300" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                  <h3 className="text-xl md:text-2xl font-bold mb-2">
                    {category.title}
                  </h3>
                  <div className="flex items-center gap-2 text-white group-hover:translate-x-1 transition-transform duration-300">
                    <span className="font-semibold text-sm">View More</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Products — ALL with sorting filters */}
        <div className="mt-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h3 className="text-3xl font-bold text-gray-900">All Products</h3>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSortBy('name')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  sortBy === 'name'
                    ? 'bg-black text-white'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                A-Z
              </button>
              <button
                onClick={() => setSortBy('rating')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  sortBy === 'rating'
                    ? 'bg-black text-white'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                ⭐ Rating
              </button>
              <button
                onClick={() => setSortBy('popularity')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  sortBy === 'popularity'
                    ? 'bg-black text-white'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                💬 Reviews
              </button>
              <button
                onClick={() => setSortBy('orders')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  sortBy === 'orders'
                    ? 'bg-black text-white'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                🛒 Orders
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((p) => (
              <Link
                key={p.id}
                to={`/product/${p.id}`}
                className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                {/* Product Image */}
                  <div className="w-full aspect-square bg-gray-100 overflow-hidden relative">
                  <OptimizedImage
                    src={p.image || p.thumbnail || (p.images && p.images[0])}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    width={600}
                    height={600}
                    style={{ objectFit: 'cover' }}
                  />
                  {p.isNew && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                      NEW
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-3">
                  <h4 className="text-xs md:text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
                    {p.name}
                  </h4>
                  <div className="text-xs text-gray-600 mb-2">{p.subcategory}</div>

                  {/* Rating & Reviews */}
                  <div className="flex items-center gap-1 text-xs mb-2">
                    <span>⭐ {p.rating || 0}</span>
                    <span className="text-gray-500">({p.reviews || 0})</span>
                  </div>

                  {/* Price (show discounted price as main, base price as strike-through when discount exists) */}
                  <div className="flex flex-col items-start gap-1 mb-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <CurrencyPrices
                        price={p.discount ? p.price - (p.price * p.discount) / 100 : p.price}
                        originalPrice={p.discount ? p.price : p.originalPrice}
                      />
                    </div>
                    {p.discount && (
                      <span className="inline-block bg-green-100 text-green-700 text-[10px] font-semibold px-2 py-0.5 rounded mt-1">Save {p.discount}%</span>
                    )}
                  </div>

                  {/* Stock Status (show Out of Stock if stock/quantity < 1) */}
                  <div className="text-xs font-medium">
                    {(typeof p.stock === 'number' ? p.stock : (typeof p.quantity === 'number' ? p.quantity : 1)) > 0 ? (
                      <span className="text-green-600">In Stock</span>
                    ) : (
                      <span className="text-red-600">Out of Stock</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No products found</p>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-6">Can't find what you're looking for?</p>
          <Link
            to="/bespoke"
            className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300 font-semibold group"
          >
            Create Your Bespoke Piece
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

const CurrencyPrices: React.FC<{ price?: number; originalPrice?: number }> = ({ price = 0, originalPrice = 0 }) => {
  const { formatPrice } = useCurrency();
  return (
    <>
      <div className="text-sm font-bold text-gray-900">{formatPrice(price)}</div>
      {originalPrice > price && (
        <div className="text-xs text-gray-500 line-through">{formatPrice(originalPrice)}</div>
      )}
    </>
  );
};
