"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { products } from "@/data/products";
import { Sparkles } from "lucide-react";

export default function ProductGrid() {
  return (
    <section className="relative max-w-7xl mx-auto px-6 lg:px-12 py-24 lg:py-32">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-radial from-gold/5 to-transparent blur-3xl pointer-events-none" />

      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        viewport={{ once: true }}
        className="text-center mb-16 lg:mb-20 relative"
      >
        {/* Decorative icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          whileInView={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="inline-flex items-center justify-center mb-4"
        >
          <Sparkles className="text-gold/60" size={20} />
        </motion.div>

        <h2 className="text-4xl lg:text-5xl font-light text-white mb-4 tracking-tight">
          Featured Products
        </h2>
        
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-6" />
        
        <p className="text-sm tracking-[0.2em] uppercase text-gray-500 font-light">
          Curated Collection
        </p>
      </motion.div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
        {products.map((p, i) => (
          <Link key={p.id} href={`/products/${p.id}`} className="block group">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                delay: i * 0.08,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
              viewport={{ once: true }}
              className="relative h-full"
            >
              {/* Card container */}
              <div className="relative h-full bg-gradient-to-br from-gray-950 to-black rounded-sm overflow-hidden border border-gold/20 hover:border-gold/50 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-gold/10">
                {/* Decorative corner accent - top left */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gold/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                
                {/* Decorative corner accent - bottom right */}
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gold/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

                {/* Product Image Container */}
                <div className="relative aspect-square w-full bg-black overflow-hidden">
                  <Image
                    src={p.images[0]}
                    alt={p.name}
                    width={500}
                    height={500}
                    className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Grain texture */}
                  <div className="absolute inset-0 opacity-[0.02] bg-noise mix-blend-overlay" />
                </div>

                {/* Product Info */}
                <div className="relative p-4 lg:p-5">
                  {/* Product Name */}
                  <h3 className="font-light text-base lg:text-lg text-white mb-2 tracking-wide group-hover:text-gold/90 transition-colors duration-300">
                    {p.name}
                  </h3>

                  {/* Short Description */}
                  <p className="text-gray-400 text-xs leading-relaxed mb-3 line-clamp-2">
                    {p.shortDescription}
                  </p>

                  {/* Divider */}
                  <div className="w-8 h-px bg-gradient-to-r from-gold/50 to-transparent mb-3 group-hover:w-full transition-all duration-500" />

                  {/* Slogan */}
                  <p className="text-[10px] lg:text-[11px] text-gray-500/80 italic font-light tracking-wide">
                    {p.slogan}
                  </p>

                  {/* Hover indicator */}
                  <motion.div
                    className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ x: -10 }}
                    whileHover={{ x: 0 }}
                  >
                    <div className="flex items-center gap-1 text-gold/70 text-xs tracking-wider uppercase">
                      <span className="font-light">View</span>
                      <motion.span
                        animate={{ x: [0, 4, 0] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        →
                      </motion.span>
                    </div>
                  </motion.div>
                </div>

                {/* Subtle shimmer effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/5 to-transparent"
                    animate={{
                      x: ['-200%', '200%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Bottom decorative line */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        viewport={{ once: true }}
        className="w-full h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent mt-16 lg:mt-20"
      />

      <style jsx global>{`
        .bg-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }

        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
}