/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  Pause,
} from "lucide-react";
import { useSwipeable } from "react-swipeable";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategoriesGrid } from "@/components/CategoriesGrid";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

import heroFootwear from "@/assets/hero-leather-craft.jpg";
import heroJackets from "@/assets/hero-jackets.jpg";
import heroAccessories from "@/assets/hero-accessories.jpg";
import heroFurniture from "@/assets/hero-furniture.jpg";
import heroAutomotive from "@/assets/hero-automotive.jpg";
import categoryAccessories from "@/assets/category-accessories.jpg";

const HERO_SLIDES = [
  {
    image: heroFootwear,
    title: "HLX Footwear Atelier",
    subtitle: "Step Into Luxury",
    description: "Impeccably crafted leather footwear, designed for the discerning.",
    link: "/footwear",
  },
  {
    image: heroJackets,
    title: "HLX Apparels & Outerwear",
    subtitle: "Timeless Elegance",
    description: "Elevate your wardrobe with refined leather jackets and outerwear.",
    link: "/apparel",
  },
  {
    image: heroAccessories,
    title: "HLX Bags & Travel",
    subtitle: "Carry Distinction",
    description: "Premium leather bags for work, travel, and everyday luxury.",
    link: "/category?name=Bags+%26+Travel",
  },
  {
    image: categoryAccessories,
    title: "HLX Accessories",
    subtitle: "Refined Details",
    description: "Small touches that make a powerful statement.",
    link: "/accessories",
  },
  {
    image: heroFurniture,
    title: "HLX Leather Interiors",
    subtitle: "Transform Your Space",
    description: "Furniture and accents crafted from the finest hides.",
    link: "/furniture",
  },
  {
    image: heroAutomotive,
    title: "HLX Automotive Leather",
    subtitle: "Drive in Luxury",
    description: "Unparalleled comfort and craftsmanship for your drive.",
    link: "/automotive",
  },
];

const Index = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [heroContent, setHeroContent] = useState({
    ctaText: "Shop New Arrivals",
    ctaLink: "/new-arrivals",
    ctaButtonColor: "#eab308",
    secondaryCtaText: "Our Story",
    secondaryCtaLink: "/about",
  });
  const [noticeBoard, setNoticeBoard] = useState<any>(null);
  const [showNotice, setShowNotice] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

  // Autoplay
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 12000);
  };

  const nextSlide = () => goToSlide((currentSlide + 1) % HERO_SLIDES.length);
  const prevSlide = () => goToSlide((currentSlide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: nextSlide,
    onSwipedRight: prevSlide,
    trackMouse: true,
  });

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

        {/* Hero Carousel */}
        <section
          ref={heroRef}
          className="relative h-screen overflow-hidden"
          {...swipeHandlers}
        >
          {/* Slides */}
          {HERO_SLIDES.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
            </div>
          ))}

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all backdrop-blur-sm border border-white/20"
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all backdrop-blur-sm border border-white/20"
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Autoplay Toggle */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="absolute top-6 right-6 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white transition backdrop-blur-sm border border-white/20"
            aria-label={isPaused ? "Play" : "Pause"}
          >
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </button>

          {/* Hero Content */}
          <div className="absolute inset-0 flex items-center justify-start px-6 md:px-12 lg:px-24 z-10">
            <div className="max-w-4xl text-white">
              {/* Subtitle */}
              <div className="mb-4">
                <span className="inline-block px-5 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm md:text-base font-semibold border border-white/30">
                  {HERO_SLIDES[currentSlide].subtitle}
                </span>
              </div>

              {/* Title */}
              <h1 className="font-playfair font-bold text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-tight mb-6 bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent">
                {HERO_SLIDES[currentSlide].title}
              </h1>

              {/* Description */}
              <p className="text-lg md:text-xl lg:text-2xl mb-10 max-w-2xl leading-relaxed opacity-95 font-light">
                {HERO_SLIDES[currentSlide].description}
              </p>

              {/* CTA Buttons - Perfectly sized & elegant */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to={HERO_SLIDES[currentSlide].link || heroContent.ctaLink}
                  className="group inline-flex items-center justify-center px-8 py-4 rounded-md font-semibold text-black transition-all hover:scale-105 shadow-2xl text-base md:text-lg"
                  style={{ backgroundColor: heroContent.ctaButtonColor || "#eab308" }}
                >
                  {heroContent.ctaText}
                  <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition" />
                </Link>

                <Link
                  to={heroContent.secondaryCtaLink}
                  className="inline-flex items-center justify-center px-8 py-4 rounded-md font-semibold text-white border-2 border-white/70 backdrop-blur-sm hover:bg-white hover:text-black transition-all text-base md:text-lg"
                >
                  {heroContent.secondaryCtaText}
                </Link>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
            <div
              className="h-full bg-white transition-all duration-6000 ease-linear"
              style={{
                width: isPaused ? `${(currentSlide + 1) * (100 / HERO_SLIDES.length)}%` : "0%",
                animation: isPaused ? "none" : `progress${currentSlide} 6s linear forwards`,
              }}
            />
          </div>

          {/* Dot Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {HERO_SLIDES.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 ${
                  index === currentSlide
                    ? "w-10 h-2 bg-white rounded-full"
                    : "w-2 h-2 bg-white/50 rounded-full hover:bg-white/80"
                }`}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>
        </section>

        {/* Categories Grid */}
        <CategoriesGrid />

        {/* Add your other sections below */}
      </main>

      <Footer />

      <style>{`
        ${HERO_SLIDES.map((_, i) => `
          @keyframes progress${i} {
            from { width: 0%; }
            to { width: 100%; }
          }
        `).join("")}
      `}</style>
    </div>
  );
};

export default Index;