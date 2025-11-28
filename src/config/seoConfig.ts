/**
 * SEO Optimization Configuration for HLX - Hide Luxe Legacy
 * 
 * This file contains all SEO-related configurations and helpers
 * for optimizing the website for search engines.
 */

export const SEO_CONFIG = {
  // Brand Information
  brand: 'HLX - Hide Luxe Legacy',
  brandShort: 'HLX',
  website: 'https://www.28hideluxe.com',
  description:
    'Discover HLX\'s exquisite collection of premium leather footwear, apparel, bags, accessories, furniture and automotive leather goods. Handcrafted luxury refined in genuine hide.',
  
  // Social Media
  social: {
    instagram: 'https://www.instagram.com/hideluxe',
    twitter: 'https://www.twitter.com/hideluxe',
    facebook: 'https://www.facebook.com/hideluxe',
    pinterest: 'https://www.pinterest.com/hideluxe',
    tiktok: 'https://www.tiktok.com/@hideluxe',
  },

  // Contact Information
  contact: {
    email: 'info@28hideluxe.com',
    phone: '+234 (your phone)',
    address: 'Nigeria',
  },

  // Keywords by Category
  keywords: {
    general: [
      'premium leather goods',
      'luxury leather products',
      'genuine hide',
      'leather footwear',
      'leather apparel',
      'leather accessories',
      'handcrafted leather',
      'artisan leather',
      'leather furniture',
      'automotive leather',
    ],
    footwear: [
      'leather shoes',
      'leather boots',
      'leather heels',
      'leather loafers',
      'leather oxfords',
      'handcrafted footwear',
      'premium leather shoes',
      'luxury footwear',
    ],
    apparel: [
      'leather jacket',
      'leather blazer',
      'leather coat',
      'genuine leather outerwear',
      'premium leather apparel',
      'leather fashion',
    ],
    bags: [
      'leather bag',
      'leather messenger bag',
      'leather tote',
      'leather backpack',
      'travel leather bags',
      'luxury bags',
      'handcrafted bags',
    ],
    accessories: [
      'leather belt',
      'leather wallet',
      'leather gloves',
      'leather accessories',
      'premium accessories',
    ],
    furniture: [
      'leather sofa',
      'leather furniture',
      'leather chairs',
      'luxury furniture',
      'genuine leather furniture',
    ],
    automotive: [
      'leather car seat covers',
      'automotive leather',
      'car leather interior',
      'steering wheel cover',
      'car floor mats',
    ],
  },

  // Page Titles and Meta Descriptions
  pages: {
    home: {
      title: 'HLX - Premium Leather Luxury | Footwear, Apparel & Accessories',
      description:
        'Discover HLX\'s exquisite collection of premium leather footwear, apparel, bags, accessories, furniture and automotive leather goods. Handcrafted luxury refined in genuine hide.',
    },
    footwear: {
      title: 'Luxury Leather Footwear | HLX Premium Shoes & Boots',
      description:
        'Step into luxury with our HLX footwear collection. Handcrafted leather shoes, boots, and heels made from premium Italian leather. Free shipping on orders over 50,000 NGN.',
    },
    apparel: {
      title: 'Premium Leather Apparel & Outerwear | HLX Jackets & Blazers',
      description:
        'Elevate your style with HLX leather apparel and outerwear. Handcrafted leather jackets, blazers, and coats finished in premium details.',
    },
    bags: {
      title: 'Luxury Leather Bags & Travel | HLX Premium Collection',
      description:
        'Go further with HLX leather bags for work, motion, and leisure. Premium messenger bags, totes, and backpacks refined in genuine hide.',
    },
    accessories: {
      title: 'Premium Leather Accessories | HLX Belts, Wallets & Gloves',
      description:
        'Elevate your style with HLX premium leather accessories. Handcrafted belts, wallets, gloves, and more refined leather goods.',
    },
    furniture: {
      title: 'Premium Leather Furniture | HLX Luxury Home Interiors',
      description:
        'Transform your space with HLX premium leather furniture. Luxury sofas, armchairs, and interior accents designed for comfort and elegance.',
    },
    automotive: {
      title: 'Luxury Automotive Leather | HLX Premium Car Interiors',
      description:
        'Experience unparalleled comfort with HLX automotive leather. Premium seat covers, steering wheel covers, and car floor mats.',
    },
    about: {
      title: 'About HLX - Premium Leather Artisans | Hide Luxe Legacy',
      description:
        'Learn about HLX\'s heritage of crafting premium leather goods with genuine hide and artisan techniques since inception.',
    },
    contact: {
      title: 'Contact HLX - Premium Leather Goods | Get in Touch',
      description:
        'Contact HLX for inquiries, custom orders, and bespoke leather creations. We\'re here to help.',
    },
  },

  // Structured Data Schema
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'HLX - Hide Luxe Legacy',
    url: 'https://www.28hideluxe.com',
    logo: 'https://www.28hideluxe.com/logo.png',
    description:
      'Premium leather goods crafted with genuine hide - footwear, apparel, accessories, furniture, and automotive leather.',
    sameAs: [
      'https://www.instagram.com/hideluxe',
      'https://www.twitter.com/hideluxe',
      'https://www.facebook.com/hideluxe',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'info@28hideluxe.com',
    },
  },
};

/**
 * Generate product schema markup
 */
export const generateProductSchema = (product: {
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  rating?: number;
  reviews?: number;
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'NGN',
      availability: 'https://schema.org/InStock',
    },
    ...(product.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviews || 0,
      },
    }),
  };
};

/**
 * Generate breadcrumb schema markup
 */
export const generateBreadcrumbSchema = (breadcrumbs: Array<{ name: string; url: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${SEO_CONFIG.website}${crumb.url}`,
    })),
  };
};

/**
 * SEO Best Practices Checklist
 * 
 * Mobile Responsiveness:
 * ✓ All pages are mobile-friendly with responsive design
 * ✓ Touch-friendly buttons and navigation
 * ✓ Fast loading times optimized for mobile
 * 
 * Meta Tags:
 * ✓ Unique title tags (50-60 characters)
 * ✓ Unique meta descriptions (150-160 characters)
 * ✓ Open Graph tags for social sharing
 * ✓ Twitter Card tags
 * 
 * Structured Data:
 * ✓ JSON-LD schema markup for products
 * ✓ Organization schema
 * ✓ Breadcrumb schema
 * ✓ Review/Rating schema
 * 
 * Content Optimization:
 * ✓ H1 tags for main headings
 * ✓ Keyword-rich content
 * ✓ Internal linking strategy
 * ✓ Alt text for images
 * ✓ Image optimization and compression
 * 
 * Technical SEO:
 * ✓ XML sitemap
 * ✓ Robots.txt configuration
 * ✓ SSL/HTTPS encryption
 * ✓ Fast page load times
 * ✓ Clean URL structure
 * ✓ Proper redirects
 * 
 * Link Strategy:
 * ✓ High-quality backlinks
 * ✓ Internal linking
 * ✓ Anchor text optimization
 */

export default SEO_CONFIG;
