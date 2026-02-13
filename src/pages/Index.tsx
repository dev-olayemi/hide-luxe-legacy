/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, X } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategoriesGrid } from "@/components/CategoriesGrid";
import { SEOHead } from "@/components/SEOHead";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

import heroImage from "@/assets/hero-leather-craft.jpg"; // ← pick your favorite hero image

const Index = () => {
  const [heroContent, setHeroContent] = useState({
    ctaText: "Shop Now",
    ctaLink: "/category",           // or "/new-arrivals" / "/categories"
    ctaButtonColor: "#eab308",
    secondaryCtaText: "Our Story",
    secondaryCtaLink: "/about",
  });

  const [noticeBoard, setNoticeBoard] = useState<any>(null);
  const [showNotice, setShowNotice] = useState(true);
  const categoriesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Optional: still load custom button text/color from firebase
    getDoc(doc(db, "siteSettings", "hero")).then((docSnap) => {
      if (docSnap.exists()) setHeroContent(docSnap.data() as any);
    });

    getDoc(doc(db, "siteSettings", "noticeBoard")).then((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data?.enabled) setNoticeBoard(data);
      }
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="28th Hide Luxe - Premium Leather Luxury"
        description="Discover HLX's exquisite collection of leather footwear, apparel, bags, furniture, and automotive interiors. Luxury. Leather. Legacy."
        url="https://www.28hideluxe.com"
      />
      <Header />

      <main className="flex-1">
        {/* Notice Board */}
        {noticeBoard && showNotice && (
          <div className="relative bg-amber-600 text-white">
            <div className="container mx-auto px-4 py-3 text-center flex items-center justify-center gap-4">
              {noticeBoard.link ? (
                <Link to={noticeBoard.link} className="font-medium hover:underline">
                  {noticeBoard.message}
                </Link>
              ) : (
                <p className="font-medium">{noticeBoard.message}</p>
              )}
              <button
                onClick={() => setShowNotice(false)}
                className="hover:bg-white/20 rounded-full p-1 transition"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Single Hero Section */}
        <section className="relative h-screen overflow-hidden">
          {/* Background Image */}
          <img
            src={heroImage}
            alt="HLX Premium Leather Craft"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/60 to-black/30" />

          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-start px-6 md:px-12 lg:px-24">
            <div className="max-w-4xl text-white">
              {/* Small accent label */}
              <div className="mb-5">
                <span className="inline-block px-6 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm md:text-base font-semibold border border-white/30">
                  28th Hide Luxe
                </span>
              </div>

              {/* Main Title */}
              <h1 className="font-playfair font-bold text-5xl xs:text-6xl sm:text-7xl md:text-8xl lg:text-9xl leading-tight mb-6 bg-gradient-to-br from-white to-gray-200 bg-clip-text text-transparent">
                Premium Leather Luxury
              </h1>

              {/* Subtitle / Tagline */}
              <p className="text-xl md:text-2xl lg:text-3xl mb-10 max-w-3xl font-light leading-relaxed opacity-95">
                Masterfully crafted leather goods • Footwear • Apparel • Bags • Interiors • Automotive • Leather Accessories
              </p>

              {/* Two main CTAs */}
              <div className="flex flex-col sm:flex-row gap-5">
                <button
                  onClick={() => {
                    categoriesRef.current?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="group inline-flex items-center justify-center px-10 py-5 rounded-md font-semibold text-black text-lg md:text-xl transition-all hover:scale-105 shadow-xl"
                  style={{ backgroundColor: heroContent.ctaButtonColor || "#eab308" }}
                >
                  {heroContent.ctaText || "Shop Now"}
                  <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition" />
                </button>

                <Link
                  to={heroContent.secondaryCtaLink}
                  className="inline-flex items-center justify-center px-10 py-5 rounded-md font-semibold text-white text-lg md:text-xl border-2 border-white/70 backdrop-blur-sm hover:bg-white hover:text-black transition-all"
                >
                  {heroContent.secondaryCtaText || "Our Story"}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <div ref={categoriesRef}>
          <CategoriesGrid />
        </div>

        {/* Add other sections below if needed */}
      </main>

      <Footer />
    </div>
  );
};

export default Index;