/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  canonical?: string;
  keywords?: string;
  author?: string;
  robots?: string;
  productData?: {
    name: string;
    price: number;
    image: string;
    description: string;
    currency?: string;
    sku?: string;
    category?: string;
    rating?: number;
    reviewCount?: number;
    availability?: string;
  };
  articleData?: {
    publishedDate?: string;
    modifiedDate?: string;
    author?: string;
  };
}

export const SEOHead = ({
  title = "HLX - Premium Leather Luxury | Footwear, Apparel & Accessories",
  description = "Discover HLX's exquisite collection of premium leather goods including footwear, apparel, bags, accessories, furniture and automotive leather. Luxury crafted with genuine hide.",
  image = "https://www.28hideluxe.com/logo.png",
  url = "https://www.28hideluxe.com",
  type = "website",
  canonical,
  keywords = "luxury leather, premium footwear, leather apparel, leather bags, leather accessories, luxury goods Nigeria",
  author = "28th Hide Luxe (HLX)",
  robots = "index, follow",
  productData,
  articleData,
}: SEOHeadProps) => {
  React.useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta tags
    const updateMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[${name.startsWith('og:') || name.startsWith('twitter:') ? 'property' : 'name'}="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(name.startsWith('og:') || name.startsWith('twitter:') ? 'property' : 'name', name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Standard Meta Tags
    updateMetaTag('description', description);
    updateMetaTag('author', author);
    updateMetaTag('keywords', keywords);
    updateMetaTag('robots', robots);
    
    // Open Graph Tags
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:image', image);
    updateMetaTag('og:url', url);
    updateMetaTag('og:type', type);
    updateMetaTag('og:site_name', 'HLX - 28th Hide Luxe');
    
    // Twitter Card Tags
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:site', '@hideluxe');
    
    // Canonical URL
    if (canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.rel = 'canonical';
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.href = canonical;
    } else if (url) {
      let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.rel = 'canonical';
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.href = url;
    }

    // Add JSON-LD schema markup
    let schemaScript = document.querySelector('script[type="application/ld+json"][data-schema-type="main"]') as HTMLScriptElement;
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.type = 'application/ld+json';
      schemaScript.setAttribute('data-schema-type', 'main');
      document.head.appendChild(schemaScript);
    }

    const schema: any = {
      '@context': 'https://schema.org',
      '@type': type === 'product' ? 'Product' : type === 'article' ? 'Article' : 'Organization',
    };

    if (type === 'product' && productData) {
      schema.name = productData.name;
      schema.description = productData.description;
      schema.image = productData.image;
      if (productData.sku) schema.sku = productData.sku;
      if (productData.category) schema.category = productData.category;
      
      schema.offers = {
        '@type': 'Offer',
        price: productData.price,
        priceCurrency: productData.currency || 'NGN',
        availability: productData.availability || 'https://schema.org/InStock',
        url: url,
      };

      if (productData.rating && productData.reviewCount) {
        schema.aggregateRating = {
          '@type': 'AggregateRating',
          ratingValue: productData.rating,
          reviewCount: productData.reviewCount,
        };
      }

      schema.brand = {
        '@type': 'Brand',
        name: 'HLX - 28th Hide Luxe',
      };
    } else if (type === 'article' && articleData) {
      schema.name = title;
      schema.description = description;
      schema.image = image;
      schema.author = {
        '@type': 'Person',
        name: articleData.author || 'HLX Team',
      };
      if (articleData.publishedDate) schema.datePublished = articleData.publishedDate;
      if (articleData.modifiedDate) schema.dateModified = articleData.modifiedDate;
    } else {
      schema.name = 'HLX - 28th Hide Luxe';
      schema.alternateName = 'Hide Luxe Legacy';
      schema.description = description;
      schema.url = url;
      schema.image = image;
      schema.sameAs = [
        'https://www.instagram.com/hideluxe',
        'https://www.twitter.com/hideluxe',
        'https://www.facebook.com/hideluxe',
      ];
      schema.contactPoint = {
        '@type': 'ContactPoint',
        contactType: 'Customer Service',
        email: 'contact@28hideluxe.com',
      };
      schema.address = {
        '@type': 'PostalAddress',
        addressCountry: 'NG',
      };
    }

    schemaScript.innerHTML = JSON.stringify(schema);

  }, [title, description, image, url, type, canonical, keywords, author, robots, productData, articleData]);

  return null;
};
