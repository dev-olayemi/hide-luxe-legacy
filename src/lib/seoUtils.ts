/**
 * SEO Utilities for HLX - Hide Luxe Legacy
 * Provides helper functions for SEO optimization across the application
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { SEO_CONFIG, generateProductSchema, generateBreadcrumbSchema } from '@/config/seoConfig';

/**
 * Generate structured data for JSON-LD
 */
export const generateStructuredData = (type: 'organization' | 'product' | 'breadcrumb', data?: any) => {
  switch (type) {
    case 'organization':
      return SEO_CONFIG.organization;
    case 'product':
      return data ? generateProductSchema(data as any) : null;
    case 'breadcrumb':
      return data ? generateBreadcrumbSchema(data as any) : null;
    default:
      return null;
  }
};

/**
 * Inject structured data into the document head
 */
export const injectStructuredData = (schema: any) => {
  if (!schema) return;

  let script = document.querySelector('script[type="application/ld+json"][data-type="structured-data"]') as HTMLScriptElement;
  if (!script) {
    script = document.createElement('script');
    (script as HTMLScriptElement).type = 'application/ld+json';
    script.setAttribute('data-type', 'structured-data');
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(schema);
};

/**
 * Set canonical URL to prevent duplicate content issues
 */
export const setCanonicalUrl = (url: string) => {
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!canonical) {
    canonical = document.createElement('link') as HTMLLinkElement;
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = url;
};

/**
 * Generate breadcrumb structured data and inject it
 */
export const setBreadcrumbs = (breadcrumbs: Array<{ name: string; url: string }>) => {
  const schema = generateBreadcrumbSchema(breadcrumbs);
  injectStructuredData(schema);
};

/**
 * Set viewport for mobile optimization
 */
export const ensureMobileViewport = () => {
  let viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
  if (!viewport) {
    viewport = document.createElement('meta') as HTMLMetaElement;
    viewport.name = 'viewport';
    document.head.appendChild(viewport);
  }
  viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes');
};

/**
 * Add theme color meta tag for mobile browsers
 */
export const setThemeColor = (color: string = '#eab308') => {
  let themeColor = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
  if (!themeColor) {
    themeColor = document.createElement('meta') as HTMLMetaElement;
    themeColor.name = 'theme-color';
    document.head.appendChild(themeColor);
  }
  themeColor.setAttribute('content', color);
};

/**
 * Generate Open Graph meta tags for social sharing
 */
export const generateOGTags = (options: {
  title: string;
  description: string;
  image: string;
  url: string;
  type?: 'website' | 'article' | 'product';
}) => {
  return {
    'og:title': options.title,
    'og:description': options.description,
    'og:image': options.image,
    'og:url': options.url,
    'og:type': options.type || 'website',
    'og:site_name': SEO_CONFIG.brand,
  };
};

/**
 * Generate Twitter Card meta tags
 */
export const generateTwitterTags = (options: {
  title: string;
  description: string;
  image: string;
}) => {
  return {
    'twitter:card': 'summary_large_image',
    'twitter:title': options.title,
    'twitter:description': options.description,
    'twitter:image': options.image,
    'twitter:site': '@hideluxe',
    'twitter:creator': '@hideluxe',
  };
};

/**
 * Get category-specific keywords
 */
export const getCategoryKeywords = (category: keyof typeof SEO_CONFIG.keywords): string => {
  const keywords = SEO_CONFIG.keywords[category] || SEO_CONFIG.keywords.general;
  return keywords.join(', ');
};

/**
 * Optimize image for SEO
 * - Ensures alt text
 * - Adds lazy loading
 * - Optimizes for responsive sizes
 */
export const optimizeImageForSEO = (
  imageUrl: string,
  altText: string,
  width?: number,
  height?: number
) => {
  return {
    src: imageUrl,
    alt: altText,
    loading: 'lazy' as const,
    decoding: 'async' as const,
    ...(width && { width }),
    ...(height && { height }),
  };
};

/**
 * Generate page-specific SEO metadata
 */
export const getPageSEOData = (page: keyof typeof SEO_CONFIG.pages) => {
  return SEO_CONFIG.pages[page] || {
    title: SEO_CONFIG.brand,
    description: SEO_CONFIG.description,
  };
};

/**
 * Create a formatted H1 tag (for semantic HTML)
 */
export const createH1 = (text: string, className?: string) => {
  return {
    tag: 'h1',
    text,
    className: className || 'text-4xl font-bold',
  };
};

/**
 * Ensure all images have alt text
 * Utility to validate alt text on images
 */
export const validateImageAltText = (): { valid: boolean; missingAlts: number } => {
  const images = document.querySelectorAll('img');
  let missingAlts = 0;

  images.forEach((img) => {
    if (!img.alt || img.alt.trim() === '') {
      console.warn('Image missing alt text:', img.src);
      missingAlts++;
    }
  });

  return {
    valid: missingAlts === 0,
    missingAlts,
  };
};

/**
 * Track page view for analytics (Google Analytics integration)
 */
export const trackPageView = (page: string, title: string) => {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    const gtag = (window as any).gtag;
    gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: page,
      page_title: title,
    });
  }
};

/**
 * Generate schema markup for FAQ pages
 */
export const generateFAQSchema = (
  faqs: Array<{ question: string; answer: string }>
) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
};

/**
 * Generate schema markup for local business
 */
export const generateLocalBusinessSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: SEO_CONFIG.brand,
    image: 'https://www.28hideluxe.com/og-image.jpg',
    description: SEO_CONFIG.description,
    url: SEO_CONFIG.website,
    telephone: SEO_CONFIG.contact.phone,
    email: SEO_CONFIG.contact.email,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'NG',
      addressLocality: 'Nigeria',
    },
    sameAs: Object.values(SEO_CONFIG.social),
  };
};

export default {
  generateStructuredData,
  injectStructuredData,
  setCanonicalUrl,
  setBreadcrumbs,
  ensureMobileViewport,
  setThemeColor,
  generateOGTags,
  generateTwitterTags,
  getCategoryKeywords,
  optimizeImageForSEO,
  getPageSEOData,
  createH1,
  validateImageAltText,
  trackPageView,
  generateFAQSchema,
  generateLocalBusinessSchema,
};
