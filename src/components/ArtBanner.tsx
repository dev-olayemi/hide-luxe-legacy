import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const SLIDES = [
  "/art-banner/art1.jpeg",
  "/art-banner/art2.jpeg",
  "/art-banner/art3.jpeg",
  "/art-banner/art4.jpeg",
  "/art-banner/art5.jpeg",
];

const ArtBanner = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="my-10 rounded-2xl overflow-hidden shadow-xl mx-0">
      {/* Stack on mobile, side-by-side on md+ */}
      <div className="flex flex-col md:flex-row">

        {/* LEFT — sliding image, fixed height on all breakpoints */}
        <div className="relative w-full md:w-[45%] h-56 sm:h-64 md:h-80 lg:h-96 flex-shrink-0 overflow-hidden">
          {SLIDES.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={`Art ${i + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                i === current ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          {/* Right-edge fade into black panel on desktop */}
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-r from-transparent to-black hidden md:block" />
          {/* Slide dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? "bg-white w-5" : "bg-white/40 w-1.5"
                }`}
              />
            ))}
          </div>
        </div>

        {/* RIGHT — copy, grows to fill remaining space */}
        <div className="flex-1 bg-black flex flex-col justify-center px-6 sm:px-8 md:px-10 lg:px-14 py-8 md:py-10">
          <p className="text-yellow-400 text-[10px] sm:text-xs font-bold tracking-[3px] uppercase mb-3">
            New Collection
          </p>

          <h2 className="text-white font-bold text-2xl sm:text-3xl lg:text-4xl leading-tight mb-3">
            Art That Speaks<br />
            <span className="text-yellow-400">Before You Do.</span>
          </h2>

          <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6 w-full max-w-md">
            Original works by a master artist — each piece is a conversation
            starter, a statement, and an investment. Curated exclusively for
            those who live boldly.
          </p>

          <Link
            to="/artwork"
            className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-5 py-3 rounded-lg transition-all w-fit group text-sm sm:text-base"
          >
            View Artwork
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default ArtBanner;
