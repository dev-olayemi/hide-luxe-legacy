# HLX SEO Optimization Guide

## Overview
This document outlines all SEO optimizations implemented for HLX - 28th Hide Luxe Legacy website to ensure maximum search engine visibility and user experience.

---

## 1. Technical SEO ✅

### 1.1 XML Sitemap
- **File**: `/public/sitemap.xml`
- **Coverage**: All major pages including products, categories, and policy pages
- **Submitted to**: Google Search Console & Bing Webmaster Tools
- **Update Frequency**: Weekly for product pages, monthly for static pages

### 1.2 Robots.txt
- **File**: `/public/robots.txt`
- **Configuration**:
  - Allows Google, Bing, and major crawlers
  - Disallows: admin, api, dashboard, auth pages
  - Sitemap reference included
  - Crawl-delay optimized per bot

### 1.3 Meta Tags in index.html
- ✅ Charset: UTF-8
- ✅ Viewport: Mobile-optimized responsive
- ✅ Title: Optimized (60 chars)
- ✅ Description: Compelling (160 chars)
- ✅ Keywords: Primary & secondary keywords included
- ✅ Author: 28th Hide Luxe (HLX)
- ✅ Robots: index, follow, image-preview enabled
- ✅ Theme color: #eab308 (brand gold)
- ✅ Language & geo-targeting: Nigeria (NG)

### 1.4 Open Graph Tags
- ✅ og:type: website
- ✅ og:title, og:description, og:image
- ✅ og:url, og:site_name
- ✅ og:locale variants for multiple regions

### 1.5 Twitter Card Tags
- ✅ twitter:card: summary_large_image
- ✅ twitter:title, description, image
- ✅ twitter:site, twitter:creator

### 1.6 Canonical URLs
- ✅ Implemented in SEOHead component
- ✅ Prevents duplicate content issues
- ✅ Configurable per-page

---

## 2. Structured Data (Schema Markup) ✅

### 2.1 Organization Schema
**Location**: `index.html` & Injected via `seoUtils.ts`
```json
{
  "@type": "Organization",
  "name": "28th Hide Luxe (HLX)",
  "url": "https://www.28hideluxe.com",
  "logo": "https://www.28hideluxe.com/logo.png",
  "sameAs": ["Instagram", "Twitter", "Facebook"]
}
```

### 2.2 Product Schema
**Location**: `ProductDetail.tsx` (per-product)
- Product name, description, image
- Price with currency (NGN)
- Availability status
- Optional: Rating, reviews, SKU

### 2.3 Breadcrumb Schema
**Utility**: `generateBreadcrumbSchema()` in `seoUtils.ts`
- Helps search engines understand site structure
- Improves breadcrumb display in search results

### 2.4 FAQ Schema
**Utility**: `generateFAQSchema()` in `seoUtils.ts`
- Used on FAQ page
- Enables rich snippets in search results

---

## 3. Content Optimization ✅

### 3.1 Page Titles
**Format**: Primary Keyword | Brand
- Homepage: "HLX - Premium Leather Luxury | Footwear, Apparel & Accessories"
- Product pages: Dynamic (product name + category)
- Category pages: Unique per category

### 3.2 Meta Descriptions
- **Length**: 155-160 characters (optimal for SERPs)
- **Content**: Benefits + keywords + brand mention
- **Uniqueness**: One per page (no duplicates)

### 3.3 Header Tags (H1-H3)
- ✅ Single H1 per page (main topic)
- ✅ H2s for major sections
- ✅ Keyword-rich, descriptive headers

### 3.4 Keyword Strategy
**Location**: `/src/config/seoConfig.ts`
- General keywords
- Category-specific keywords (footwear, apparel, bags, etc.)
- Long-tail keywords
- Local keywords (Nigeria focus)

### 3.5 Image Optimization
**Best Practices Implemented**:
- Alt text on all images (descriptive)
- Lazy loading enabled
- Image format optimization
- Responsive image sizes

---

## 4. Mobile Optimization ✅

### 4.1 Responsive Design
- ✅ Mobile-first approach
- ✅ Flexible layouts (Tailwind CSS)
- ✅ Touch-friendly buttons (min 48x48px)
- ✅ Responsive font sizes

### 4.2 Mobile Meta Tags
- ✅ Viewport: width=device-width, initial-scale=1
- ✅ Apple mobile web app meta
- ✅ Apple touch icon

### 4.3 Mobile Performance
- ✅ Images optimized for mobile
- ✅ Lazy loading implemented
- ✅ Minimal JavaScript bloat
- ✅ CSS optimized with Tailwind

---

## 5. Internal Linking Strategy ✅

### 5.1 Navigation Structure
- Primary: Category pages (Accessories, Apparel, Automotive, etc.)
- Secondary: Men, Women, New Arrivals
- Tertiary: Product pages, Sub-categories

### 5.2 Anchor Text Optimization
- ✅ Descriptive (not "click here")
- ✅ Keyword-rich when relevant
- ✅ Contextual linking

### 5.3 Link Hierarchy
```
Home
├── Categories (high priority 0.9)
├── Product Pages (medium priority)
├── Information (About, Contact, FAQ)
└── Policies (Privacy, Terms, Returns)
```

---

## 6. Performance Optimization ✅

### 6.1 Page Speed
- ✅ Vite for fast builds
- ✅ Code splitting for bundles
- ✅ Image lazy loading
- ✅ CSS optimization with Tailwind
- ✅ Font preconnect/prefetch

### 6.2 Core Web Vitals
**Targets**:
- Largest Contentful Paint (LCP): < 2.5s
- First Input Delay (FID): < 100ms
- Cumulative Layout Shift (CLS): < 0.1

### 6.3 Caching Strategy
- ✅ Browser caching headers
- ✅ Service workers (if applicable)
- ✅ Static asset optimization

---

## 7. SEO Configuration Files

### 7.1 `/src/config/seoConfig.ts`
Central SEO configuration with:
- Brand information
- Social media links
- Contact information
- Keywords by category
- Page-specific metadata

### 7.2 `/src/lib/seoUtils.ts`
Utility functions:
- `setCanonicalUrl()` - Set canonical URLs
- `setBreadcrumbs()` - Inject breadcrumb schema
- `generateOGTags()` - Generate Open Graph tags
- `generateTwitterTags()` - Generate Twitter Card tags
- `validateImageAltText()` - Check image accessibility
- `generateProductSchema()` - Create product markup
- `generateFAQSchema()` - Create FAQ markup

### 7.3 `/src/components/SEOHead.tsx`
React component for page-level SEO:
- Dynamic meta tags
- Title management
- Schema markup injection
- Canonical URL handling
- Open Graph & Twitter tags

---

## 8. Implementation Checklist

### Must-Have Elements
- [x] XML Sitemap
- [x] Robots.txt
- [x] Meta tags (title, description, keywords)
- [x] Open Graph tags
- [x] Twitter Card tags
- [x] Canonical URLs
- [x] Mobile viewport
- [x] Organization schema
- [x] Fast page load times
- [x] SSL/HTTPS (via hosting)

### Should-Have Elements
- [x] Product schema markup
- [x] Breadcrumb schema
- [x] FAQ schema
- [x] Image alt text
- [x] Internal linking strategy
- [x] Mobile optimization
- [x] Touch-friendly UI

### Nice-to-Have Elements
- [ ] Video schema
- [ ] Review/rating schema
- [ ] Event schema
- [ ] Structured data testing (to be done)

---

## 9. Monitoring & Maintenance

### 9.1 Google Search Console
- Submit sitemap
- Monitor impressions & CTR
- Fix indexing issues
- Review search queries

### 9.2 SEO Audits
- Quarterly: Full SEO audit
- Monthly: Ranking checks
- Weekly: Error monitoring
- On-demand: After major changes

### 9.3 Analytics Tracking
- Google Analytics 4
- Track pageviews by category
- Monitor user engagement
- Set conversion goals

### 9.4 Tools for Monitoring
- Google Search Console
- Google Analytics
- SEO tools (Ahrefs, SEMrush, Moz)
- Page Speed Insights
- Lighthouse

---

## 10. Content Strategy

### 10.1 Keyword Targeting
**Primary**: Premium leather, luxury goods, Nigeria
**Secondary**: Specific product types (shoes, bags, jackets)
**Long-tail**: "Handcrafted leather footwear Nigeria"

### 10.2 Content Calendar
- New product pages: Weekly
- Category optimizations: Monthly
- Blog/article content: As relevant
- Policy updates: As needed

### 10.3 Link Building
- Internal links: Comprehensive
- External links: To high-authority sites
- Backlink strategy: Guest posts, directories

---

## 11. Local SEO

### 11.1 Local Business Schema
Implemented with:
- Business name, address, phone
- Service areas
- Local reviews (to be added)

### 11.2 Local Keywords
- "Nigeria" in titles and content
- Geo-targeted landing pages
- Local business directories

---

## 12. Future Improvements

### Quick Wins
- [ ] Add product ratings/reviews to schema
- [ ] Implement breadcrumb navigation UI
- [ ] Add FAQ section with schema
- [ ] Create blog for content marketing

### Medium-term
- [ ] Video content with schema
- [ ] Featured snippets optimization
- [ ] User-generated content strategy
- [ ] Link building campaign

### Long-term
- [ ] International SEO (multi-language)
- [ ] Advanced analytics tracking
- [ ] Conversion rate optimization
- [ ] Brand authority building

---

## 13. Contact & Support

For SEO questions or updates:
- Email: contact@28hideluxe.com
- Website: https://www.28hideluxe.com

---

**Last Updated**: November 30, 2025
**Version**: 1.0
**Status**: ✅ Complete
