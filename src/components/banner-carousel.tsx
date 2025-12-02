"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

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

  // Detect slide change
  useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Auto-play every 3 seconds
  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 3000);

    return () => clearInterval(interval);
  }, [api]);

  return (
    <div className="w-full mt-16 relative">

      <Carousel opts={{ loop: true }} setApi={setApi}>
        <CarouselContent>
          {banners.map((src, index) => (
            <CarouselItem key={index}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.9 }}
                className="w-full h-[400px] md:h-[550px] relative"
              >
                <img
                  src={src}
                  className="w-full h-full object-cover rounded-xl"
                  alt={`banner-${index}`}
                />
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Left/right buttons */}
        <CarouselPrevious className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 text-white border border-gold hover:bg-black/70" />
        <CarouselNext className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 text-white border border-gold hover:bg-black/70" />
      </Carousel>

      {/* Pagination dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => api?.scrollTo(i)}
            className={`w-3 h-3 rounded-full transition-all ${
              current === i ? "bg-gold scale-125" : "bg-white/40"
            }`}
          ></button>
        ))}
      </div>

    </div>
  );
}
