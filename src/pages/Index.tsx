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
import { ProductCard } from "@/components/ProductCard";
import { CookieConsent } from "@/components/CookieConsent";
import { CategoriesGrid } from "@/components/CategoriesGrid";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { getAllProducts } from "@/firebase/firebaseUtils";
import { db } from "@/firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import heroFootwear from "@/assets/hero-leather-craft.jpg";
import heroJackets from "@/assets/hero-jackets.jpg";
import heroAccessories from "@/assets/hero-accessories.jpg";
import heroFurniture from "@/assets/hero-furniture.jpg";
import heroAutomotive from "@/assets/hero-automotive.jpg";
import menLoafers from "@/assets/products/men-loafers-brown.jpg";
import womenBoots from "@/assets/products/women-boots-black.jpg";
import categoryAccessories from "@/assets/category-accessories.jpg";
import categoryApparel from "@/assets/category-apparel.jpg";
import categoryFurniture from "@/assets/category-furniture.jpg";
import categoryAutomotive from "@/assets/category-automotive.jpg";

const HERO_SLIDES = [
  {
    image: heroFootwear,
    title: "HLX Footwear Atelier",
    subtitle: "Step Into Luxury",
    description:
      "Step into luxury with our impeccably crafted leather footwear collection",
    link: "/accessories",
  },
  {
    image: heroJackets,
    title: "HLX Apparels & Outerwear",
    subtitle: "Premium Fashion",
    description: "Elevate your closet with our sophisticated apparels and outerwear collections finished in premium leather details",
    link: "/apparel",
  },
  {
    image: heroAccessories,
    title: "HLX Bags & Travel",
    subtitle: "Go Further",
    description:
      "Go further with HLX leather bags for motion, work, and leisure — refined in genuine hide. The world moves, carry luxury with you",
    link: "/category?name=Bags%20%26%20Travel",
  },
  {
    image: categoryAccessories,
    title: "HLX Accessories",
    subtitle: "Refined Details",
    description: "Elevate your style with our premium and meticulous accessories",
    link: "/accessories",
  },
  {
    image: heroFurniture,
    title: "HLX Leather Interiors",
    subtitle: "Transform Your Space",
    description: "Transform your space with premium leather-crafted furniture and accents designed for comfort",
    link: "/furniture",
  },
  {
    image: heroAutomotive,
    title: "HLX Automotive Leather",
    subtitle: "Drive Luxury",
    description: "Experience unparalleled comfort and drive luxury with our automotive leather",
    link: "/automotive",
  },
];

const Index = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [heroContent, setHeroContent] = useState({
    subtitle: "Premium Leather",
    title: "Luxury. Leather. Legacy.",
    ctaText: "Shop New Arrivals",
    ctaLink: "/new-arrivals",
    ctaButtonColor: "#eab308",
    secondaryCtaText: "Our Story",
    secondaryCtaLink: "/about",
  });
  const [noticeBoard, setNoticeBoard] = useState<{
    enabled: boolean;
    message: string;
    type: "info" | "warning" | "success";
    link?: string;
  } | null>(null);
  const [showNotice, setShowNotice] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getAllProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });

    // Load hero content
    getDoc(doc(db, "siteSettings", "hero")).then((docSnap) => {
      if (docSnap.exists()) {
        setHeroContent(docSnap.data() as any);
      }
    });

    // Load notice board
    getDoc(doc(db, "siteSettings", "noticeBoard")).then((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as any;
        if (data.enabled) {
          setNoticeBoard(data);
        }
      }
    });
  }, []);

  // Mouse move effect for parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;

      const { left, top, width, height } =
        heroRef.current.getBoundingClientRect();
      const x = (e.clientX - left) / width;
      const y = (e.clientY - top) / height;

      setMousePosition({ x, y });
    };

    const heroElement = heroRef.current;
    if (heroElement) {
      heroElement.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (heroElement) {
        heroElement.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      handleSlideTransition((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const handleSlideTransition = (targetSlide: number) => {
    setIsTransitioning(true);
    setCurrentSlide(targetSlide);

    setTimeout(() => {
      setIsTransitioning(false);
    }, 1000);
  };

  const goToSlide = (index: number) => {
    handleSlideTransition(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  const nextSlide = () => {
    handleSlideTransition((currentSlide + 1) % HERO_SLIDES.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  const prevSlide = () => {
    handleSlideTransition(
      (currentSlide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length
    );
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  const toggleAutoplay = () => {
    setIsPaused(!isPaused);
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => nextSlide(),
    onSwipedRight: () => prevSlide(),
    trackMouse: true,
  });

  const parallaxStyle = {
    transform: `translate(${mousePosition.x * 20}px, ${
      mousePosition.y * 20
    }px)`,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead 
        title="HLX - Premium Leather Luxury | Footwear, Apparel & Accessories"
        description="Discover HLX's exquisite collection of premium leather footwear, apparel, bags, accessories, furniture and automotive leather goods. Luxury crafted with genuine hide."
        url="https://www.28hideluxe.com"
      />
      <Header />

      <main className="flex-1">
        {/* Notice Board */}
        {noticeBoard && noticeBoard.enabled && showNotice && (
          <div
            className={`relative ${
              noticeBoard.type === "info"
                ? "bg-blue-500"
                : noticeBoard.type === "warning"
                ? "bg-yellow-500"
                : "bg-green-500"
            } text-white`}
          >
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                {noticeBoard.link ? (
                  <Link
                    to={noticeBoard.link}
                    className="flex-1 text-center font-medium hover:underline"
                  >
                    {noticeBoard.message}
                  </Link>
                ) : (
                  <p className="flex-1 text-center font-medium">
                    {noticeBoard.message}
                  </p>
                )}
                <button
                  onClick={() => setShowNotice(false)}
                  className="flex-shrink-0 hover:bg-white/20 rounded-full p-1 transition"
                  aria-label="Close notice"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Hero Carousel */}
        <section
          ref={heroRef}
          className="relative overflow-hidden bg-background"
          {...swipeHandlers}
        >
          <div className="relative w-full h-[60vh] sm:h-[70vh] md:h-screen">
            {/* Slides with enhanced transitions */}
            {HERO_SLIDES.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-1000 ease-out ${
                  index === currentSlide
                    ? "opacity-100 z-10 scale-100"
                    : "opacity-0 z-0 pointer-events-none scale-105"
                } ${isTransitioning ? "transitioning" : ""}`}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="h-full w-full object-cover object-center transform transition-transform duration-700"
                  style={index === currentSlide ? parallaxStyle : {}}
                />

                {/* Dynamic gradient overlay based on slide - stronger on mobile */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-black/40" />
                  <div className="absolute inset-0 backdrop-blur-[0.5px]" />
                </div>
              </div>
            ))}

            {/* Enhanced Navigation - hide on mobile */}
            <button
              onClick={prevSlide}
              aria-label="Previous slide"
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 hidden sm:flex items-center justify-center w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-black/40 text-white hover:bg-black/60 focus:outline-none transition-all duration-300 backdrop-blur-sm border border-white/20 hover:scale-110 group"
            >
              <ChevronLeft className="w-5 sm:w-6 h-5 sm:h-6 group-hover:-translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={nextSlide}
              aria-label="Next slide"
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 hidden sm:flex items-center justify-center w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-black/40 text-white hover:bg-black/60 focus:outline-none transition-all duration-300 backdrop-blur-sm border border-white/20 hover:scale-110 group"
            >
              <ChevronRight className="w-5 sm:w-6 h-5 sm:h-6 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Autoplay Toggle - smaller on mobile */}
            <button
              onClick={toggleAutoplay}
              aria-label={isPaused ? "Play slideshow" : "Pause slideshow"}
              className="absolute top-3 sm:top-6 right-3 sm:right-6 z-30 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 text-white hover:bg-black/60 focus:outline-none transition-all duration-300 backdrop-blur-sm border border-white/20"
            >
              {isPaused ? (
                <Play className="w-3 sm:w-4 h-3 sm:h-4" />
              ) : (
                <Pause className="w-3 sm:w-4 h-3 sm:h-4" />
              )}
            </button>

            {/* Enhanced Hero Content with Slide-specific Text */}
            <div className="absolute inset-0 flex items-center justify-center md:items-center md:justify-start px-4 sm:px-6 md:px-12 lg:px-24 z-20">
              <div className="text-white max-w-full md:max-w-2xl">
                {/* Subtitle Tag */}
                <div className="mb-3 sm:mb-4">
                  <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-sm rounded-full text-xs sm:text-sm font-semibold border border-white/20">
                    {HERO_SLIDES[currentSlide].subtitle}
                  </span>
                </div>

                {/* Main Title - responsive sizing */}
                <h1 className="font-playfair font-bold mb-4 sm:mb-6 tracking-tight">
                  <span className="block text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight md:leading-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {HERO_SLIDES[currentSlide].title}
                  </span>
                </h1>

                {/* Description - responsive sizing */}
                <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 max-w-xl leading-relaxed font-light opacity-90">
                  {HERO_SLIDES[currentSlide].description}
                </p>

                {/* CTA Buttons - stacked on mobile, side-by-side on larger screens with controlled widths */}
                <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 xs:gap-3 sm:gap-4 w-full xs:w-auto">
                  <Link
                    to={HERO_SLIDES[currentSlide].link || heroContent.ctaLink}
                    className="group relative inline-flex items-center justify-center text-black px-6 sm:px-8 lg:px-6 py-2.5 xs:py-3 sm:py-3 md:py-3 lg:py-2.5 rounded-md font-semibold hover:scale-105 transition-all duration-300 text-sm sm:text-base lg:text-sm overflow-hidden shadow-2xl w-full xs:w-auto xs:whitespace-nowrap"
                    style={{ backgroundColor: heroContent.ctaButtonColor }}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {heroContent.ctaText}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </Link>

                  <Link
                    to={heroContent.secondaryCtaLink}
                    className="group relative inline-flex items-center justify-center border-2 border-white text-white px-6 sm:px-8 lg:px-6 py-2.5 xs:py-3 sm:py-3 md:py-3 lg:py-2.5 rounded-md font-semibold hover:bg-white hover:text-black transition-all duration-300 text-sm sm:text-base lg:text-sm overflow-hidden w-full xs:w-auto xs:whitespace-nowrap"
                  >
                    <span className="relative z-10">
                      {heroContent.secondaryCtaText}
                    </span>
                    <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 z-30 h-1 bg-white/20">
              <div
                className="h-full bg-white transition-all duration-5000 ease-linear"
                style={{
                  width: isPaused ? "0%" : "100%",
                  animation: isPaused ? "none" : "progress 5s linear",
                }}
              />
            </div>

            {/* Enhanced Dot Indicators - compact on mobile */}
            <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2 sm:gap-3">
              {HERO_SLIDES.map((slide, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className="group flex flex-col items-center gap-1 sm:gap-2"
                  aria-label={`Go to ${slide.title}`}
                >
                  <div
                    className={`rounded-full transition-all duration-500 ${
                      index === currentSlide
                        ? "bg-white w-8 sm:w-12 h-2"
                        : "bg-white/50 hover:bg-white/75 w-2 sm:w-3 h-2 sm:h-3"
                    } group-hover:scale-110`}
                  />
                </button>
              ))}
            </div>

            {/* Slide Counter - smaller on mobile */}
            <div className="absolute bottom-4 sm:bottom-8 right-3 sm:right-8 z-30">
              <div className="bg-black/40 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 border border-white/20">
                <span className="text-white font-mono text-xs sm:text-sm">
                  {String(currentSlide + 1).padStart(2, "0")} /{" "}
                  {String(HERO_SLIDES.length).padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>

          {/* Scroll Indicator - hidden on mobile to save space */}
          <div className="hidden md:flex absolute bottom-4 left-1/2 -translate-x-1/2 z-30 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse" />
            </div>
          </div>
        </section>

        {/* Categories Grid Section */}
        <CategoriesGrid />

        {/* Rest of your existing sections remain the same */}
        <section className="container mx-auto px-4 py-20">
          {/* ... existing featured products section ... */}
        </section>

        {/* ... existing categories section ... */}

        {/* ... existing bespoke CTA section ... */}
      </main>

      <Footer />
      <CookieConsent />

      <style>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Index;
