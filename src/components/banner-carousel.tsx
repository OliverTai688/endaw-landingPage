"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

export function BannerCarousel() {
  const banners = [
    "/banner1.jpg",
    "/banner2.jpg",
    "/banner3.jpg",
  ];

  return (
    <div className="w-full mt-16">
      <Carousel opts={{ loop: true }}>
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
                />
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
