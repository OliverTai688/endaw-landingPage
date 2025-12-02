"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function BannerCarousel() {
  const banners = [
    "/banner/1.jpg",
    "/banner/2.jpg",
    "/banner/3.jpg",
    "/banner/4.jpg",
    "/banner/5.jpg",
    "/banner/6.jpg",
    "/banner/7.jpg",
    "/banner/8.jpg",
    "/banner/9.jpg",
  ];

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (!api) return;
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  useEffect(() => {
    if (!api || isHovering) return;
    const interval = setInterval(() => {
      api.scrollNext();
    }, 4000);
    return () => clearInterval(interval);
  }, [api, isHovering]);

  return (
    <div className="w-full mt-20 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Decorative top border */}
        <div className="absolute -top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        <Carousel opts={{ loop: true }} setApi={setApi} className="relative group">
          <CarouselContent>
            {banners.map((src, index) => (
              <CarouselItem key={index}>
                <motion.div
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  className="relative w-full h-[280px] sm:h-[360px] md:h-[480px] xl:h-[600px] overflow-hidden"
                >
                  {/* Decorative corner accents */}
                  <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-gold/30 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-gold/30 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-gold/30 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-gold/30 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Main Image */}
                  <div className="relative w-full h-full bg-black">
                    <Image
                      src={src}
                      alt={`Curated collection ${index + 1}`}
                      fill
                      priority={index === 0}
                      className="object-cover"
                    />
                    
                    {/* Elegant vignette overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
                    
                    {/* Grain texture */}
                    <div className="absolute inset-0 opacity-[0.02] bg-noise mix-blend-overlay" />
                  </div>

                  {/* Slide number indicator */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="absolute top-6 right-6 z-20 backdrop-blur-md bg-black/30 px-4 py-2 rounded-sm border border-gold/20"
                  >
                    <span className="text-xs tracking-[0.2em] text-gold/90 font-light">
                      {String(index + 1).padStart(2, '0')} / {String(banners.length).padStart(2, '0')}
                    </span>
                  </motion.div>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Custom Navigation Buttons */}
          <div className="hidden md:block">
            <CarouselPrevious className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/60 backdrop-blur-sm text-white border border-gold/30 hover:bg-black/80 hover:border-gold transition-all duration-300 opacity-0 group-hover:opacity-100 z-20">
              <ChevronLeft className="w-6 h-6" />
            </CarouselPrevious>
            
            <CarouselNext className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/60 backdrop-blur-sm text-white border border-gold/30 hover:bg-black/80 hover:border-gold transition-all duration-300 opacity-0 group-hover:opacity-100 z-20">
              <ChevronRight className="w-6 h-6" />
            </CarouselNext>
          </div>
        </Carousel>

        {/* Elegant Pagination Dots */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-2 z-30">
          {/* Progress bar background */}
          <div className="flex items-center gap-3 backdrop-blur-md bg-black/30 px-6 py-3 rounded-full border border-gold/20">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => api?.scrollTo(i)}
                className="relative group/dot"
                aria-label={`Go to slide ${i + 1}`}
              >
                {/* Dot */}
                <motion.div
                  className={`rounded-full transition-all duration-300 ${
                    current === i
                      ? "w-8 h-2 bg-gold"
                      : "w-2 h-2 bg-white/30 hover:bg-white/50"
                  }`}
                  whileHover={{ scale: 1.2 }}
                />
                
                {/* Tooltip on hover */}
                <AnimatePresence>
                  {current !== i && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 0, y: 5 }}
                      whileHover={{ opacity: 1, y: -5 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 backdrop-blur-sm text-xs text-gold/90 rounded whitespace-nowrap pointer-events-none border border-gold/20"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            ))}
          </div>
        </div>

        {/* Progress indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 overflow-hidden z-20">
          <motion.div
            className="h-full bg-gradient-to-r from-gold via-yellow-500 to-gold"
            initial={{ width: "0%" }}
            animate={{ width: isHovering ? "0%" : "100%" }}
            transition={{
              duration: isHovering ? 0 : 4,
              ease: "linear",
            }}
            key={current}
          />
        </div>

        {/* Decorative bottom border */}
        <div className="absolute -bottom-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      </motion.div>

      <style jsx>{`
        .bg-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
      `}</style>
    </div>
  );
}