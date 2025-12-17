/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Footprints, Shirt, Backpack, Sparkles, Sofa, Zap, SortAsc, SortDesc, Star, MessageSquare, ShoppingBag, Tag } from 'lucide-react';
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

// Reusable ProductCard component (now with proper keys & mobile-friendly design)
const ProductCard: React.FC<any> = ({
  id,
  name = 'Unnamed Product',
  price = 0,
  discount,
  image,
  category,
  isNew = false,
  isAvailable = true,
  availabilityReason,
  sizes = [],
  colors = [],
  availableCount,
}) => {
  const { formatPrice } = useCurrency();
  const finalPrice = discount ? price * (1 - discount / 100) : price;
  const hasDiscount = discount && discount > 0;

  return (
    <Link
      to={`/product/${id}`}
      className="group block w-full h-full transform transition-all duration-300 hover:-translate-y-2"
    >
      <div className="relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          {image ? (
            <OptimizedImage
              src={image}
              alt={name}
              className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <ShoppingBag className="w-16 h-16 text-gray-300" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isNew && (
              <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-md">
                NEW
              </span>
            )}
            {hasDiscount && (
              <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full shadow-md">
                -{discount}%
              </span>
            )}
            {availableCount !== undefined && availableCount < 5 && availableCount > 0 && (
              <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full shadow-md flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Low Stock
              </span>
            )}
          </div>

          {/* Out of Stock Overlay */}
          {!isAvailable && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Category */}
          {category && (
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{category}</p>
          )}

          {/* Name */}
          <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight mb-3 group-hover:text-gray-700 transition-colors">
            {name}
          </h3>

          {/* Price */}
          <div className="mt-auto">
            <div className="flex items-end gap-2">
              <span className="text-lg font-bold text-gray-900">{formatPrice(finalPrice)}</span>
              {hasDiscount && (
                <span className="text-sm text-gray-500 line-through">{formatPrice(price)}</span>
              )}
            </div>
          </div>

          {/* Sizes / Colors Preview (with unique keys) */}
          {(sizes.length > 0 || colors.length > 0) && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {sizes.slice(0, 4).map((size: string, idx: number) => (
                <span
                  key={`${id}-size-${size}-${idx}`}
                  className="text-xs px-2 py-1 bg-gray-100 rounded-md text-gray-700"
                >
                  {size}
                </span>
              ))}
              {colors.slice(0, 5).map((color: { name: string; hex: string }, idx: number) => (
                <div
                  key={`${id}-color-${color.hex}-${idx}`}
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-300"
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
              {(sizes.length > 4 || colors.length > 5) && (
                <span className="text-xs text-gray-500 self-center">+ more</span>
              )}
            </div>
          )}

          {/* Availability Reason */}
          {!isAvailable && availabilityReason && (
            <p className="text-xs text-red-600 mt-2">{availabilityReason}</p>
          )}
        </div>
      </div>
    </Link>
  );
};

export const CategoriesGrid = () => {
  const [categories, setCategories] = React.useState<CategoryItem[]>(defaultCategories);
  const [products, setProducts] = React.useState<any[]>([]);
  const [sortBy, setSortBy] = React.useState<'name' | 'price-low' | 'price-high' | 'rating' | 'popularity' | 'orders' | 'category'>('name');

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const collectionsSnap = await getDocs(collection(db, 'collections'));
        if (!collectionsSnap.empty) {
          const items: CategoryItem[] = collectionsSnap.docs.map((d) => {
            const data = d.data() as any;
            return {
              id: data.slug || slugify(data.name || d.id),
              name: data.name || data.title || d.id,
              title: data.title || data.name || d.id,
              description: data.description || '',
              image: data.image,
              featured: data.featured ?? true,
            };
          });
          items.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
          setCategories(items);
          return;
        }

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
        console.error('Failed to load categories from DB, using fallback', err);
      }
    };

    fetchCategories();
  }, []);

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = collection(db, 'products');
        const snap = await getDocs(q);
        if (!snap.empty) {
          const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));

          const sorted = [...items];
          if (sortBy === 'name') {
            sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
          } else if (sortBy === 'price-low') {
            sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
          } else if (sortBy === 'price-high') {
            sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
          } else if (sortBy === 'rating') {
            sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          } else if (sortBy === 'popularity') {
            sorted.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
          } else if (sortBy === 'orders') {
            sorted.sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0));
          } else if (sortBy === 'category') {
            sorted.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
          }

          setProducts(sorted);
        }
      } catch (err) {
        console.error('Failed to load products', err);
      }
    };

    fetchProducts();
  }, [sortBy]);

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

        {/* Featured Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12">
          {categories.filter((cat) => cat.featured).map((category, index) => {
            const slug = category.id || slugify(category.name);
            const imageUrl = category.image || `/collections/${collectionImageMap[slug] || collectionImageMap['specialty']}`;
            return (
              <Link
                key={slug}
                to={`/category/${slug}`}
                className="group relative overflow-hidden rounded-2xl h-64 sm:h-72 md:h-80 lg:h-96 transform transition-all duration-500 hover:scale-105 hover:shadow-2xl"
              >
                <img
                  src={imageUrl}
                  alt={category.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20 group-hover:from-black/85 transition-all duration-300" />
                <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                  <h3 className="text-2xl md:text-3xl font-bold mb-2">{category.title}</h3>
                  <p className="text-sm md:text-base opacity-90 mb-4 line-clamp-2">{category.description}</p>
                  <div className="flex items-center gap-2 text-white group-hover:translate-x-1 transition-transform duration-300">
                    <span className="font-semibold">Explore</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
                <div className="absolute top-4 right-4 px-3 py-1 bg-white text-gray-900 text-xs font-bold rounded-full">
                  {index + 1}/{categories.filter((c) => c.featured).length}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Secondary Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-16">
          {categories.filter((cat) => !cat.featured).map((category) => {
            const slug = category.id || slugify(category.name);
            const imageUrl = category.image || `/collections/${collectionImageMap[slug] || collectionImageMap['specialty']}`;
            return (
              <Link
                key={slug}
                to={`/category/${slug}`}
                className="group relative overflow-hidden rounded-2xl h-48 sm:h-56 md:h-64 lg:h-72 transform transition-all duration-500 hover:scale-105 hover:shadow-xl"
              >
                <img
                  src={imageUrl}
                  alt={category.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/85 transition-all duration-300" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                  <h3 className="text-xl md:text-2xl font-bold mb-2">{category.title}</h3>
                  <div className="flex items-center gap-2 text-white group-hover:translate-x-1 transition-transform duration-300">
                    <span className="font-semibold text-sm">View More</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* All Products Section */}
        <div className="mt-16">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900">All Products</h3>
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              {[
                { value: 'name', label: 'A-Z', icon: <SortAsc className="w-4 h-4" /> },
                { value: 'price-low', label: 'Price: Low', icon: <SortAsc className="w-4 h-4" /> },
                { value: 'price-high', label: 'Price: High', icon: <SortDesc className="w-4 h-4" /> },
                { value: 'category', label: 'Category', icon: <Tag className="w-4 h-4" /> },
                { value: 'rating', label: 'Rating', icon: <Star className="w-4 h-4" /> },
                { value: 'popularity', label: 'Reviews', icon: <MessageSquare className="w-4 h-4" /> },
                { value: 'orders', label: 'Orders', icon: <ShoppingBag className="w-4 h-4" /> },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value as any)}
                  className={`px-3 py-2 text-sm rounded-lg font-medium transition-all flex items-center gap-2 ${
                    sortBy === option.value
                      ? 'bg-black text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  {option.icon}
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid - Highly Mobile Responsive */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name || 'Unnamed Product'}
                price={p.price || 0}
                discount={p.discount}
                image={p.image || p.thumbnail || (p.images && p.images[0])}
                category={p.category || p.subcategory}
                isNew={p.isNew || p.new}
                isAvailable={p.isAvailable !== false}
                availabilityReason={p.availabilityReason}
                sizes={p.sizes || p.availableSizes || []}
                colors={p.colors || p.availableColors || []}
                availableCount={
                  typeof p.stock === 'number'
                    ? p.stock
                    : typeof p.quantity === 'number'
                    ? p.quantity
                    : undefined
                }
              />
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg">No products found</p>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-20 text-center">
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