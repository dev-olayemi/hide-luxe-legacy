/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  productData?: {
    name: string;
    price: number;
    image: string;
    description: string;
    currency?: string;
  };
}

export const SEOHead = ({
  title = "HLX - Premium Leather Luxury | Footwear, Apparel & Accessories",
  description = "Discover HLX's exquisite collection of premium leather footwear, apparel, bags, accessories, furniture and automotive leather goods. Luxury crafted with genuine hide.",
  image = "https://www.28hideluxe.com/og-image.jpg",
  url = "https://www.28hideluxe.com",
  type = "website",
  productData,
}: SEOHeadProps) => {
  React.useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta tags
    const updateMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[${name.startsWith('og:') ? 'property' : 'name'}="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(name.startsWith('og:') ? 'property' : 'name', name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    updateMetaTag('description', description);
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:image', image);
    updateMetaTag('og:url', url);
    updateMetaTag('og:type', type);
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    updateMetaTag('twitter:card', 'summary_large_image');

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
      '@type': type === 'product' ? 'Product' : 'Organization',
    };

    if (type === 'product' && productData) {
      schema.name = productData.name;
      schema.description = productData.description;
      schema.image = productData.image;
      schema.offers = {
        '@type': 'Offer',
        price: productData.price,
        priceCurrency: productData.currency || 'NGN',
        availability: 'https://schema.org/InStock',
      };
    } else {
      schema.name = 'HLX - Hide Luxe Legacy';
      schema.description = description;
      schema.url = url;
      schema.image = image;
      schema.sameAs = [
        'https://www.instagram.com/hideluxe',
        'https://www.twitter.com/hideluxe',
        'https://www.facebook.com/hideluxe',
      ];
    }

    schemaScript.innerHTML = JSON.stringify(schema);

  }, [title, description, image, url, type, productData]);

  return null;
};
