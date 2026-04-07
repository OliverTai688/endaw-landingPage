"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Star, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";

interface ProductData {
  id: string;
  slug: string;
  name: string;
  slogan: string | null;
  shortDescription: string | null;
  price: number;
  currency: string;
  images: { url: string; alt: string | null }[];
}

export default function ProductsPage() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.3]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/bff/v1/products')
      .then(res => res.json())
      .then(json => {
        if (json.success) setProducts(json.data);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        {/* Subtle background effects */}
        <div className="fixed inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        </div>

        {/* Grain texture overlay */}
        <div
          className="fixed inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative container mx-auto px-6 py-24">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm mb-12"
          >
            <Link href="/" className="text-gray-400 hover:text-gold transition-colors">
              Home
            </Link>
            <ChevronRight size={16} className="text-gray-600" />
            <span className="text-white">Products</span>
          </motion.div>

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/10 border border-gold/20 mb-6"
            >
              <Sparkles className="text-gold" size={20} />
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-light tracking-tight mb-4">
              Premium Collection
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Discover our carefully curated selection of exceptional products
            </p>

            {/* Decorative line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent mt-12"
            />
          </motion.div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-gray-900 rounded-lg animate-pulse" />
                ))
              : products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
              >
                <Link href={`/products/${product.slug}`}>
                  <div className="group relative bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden border border-gray-800 hover:border-gold/40 transition-all duration-500">
                    {/* Decorative corner accents */}
                    <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-gold/20 rounded-tl-lg" />
                    <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-gold/20 rounded-br-lg" />

                    {/* Product Image Container */}
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />

                      {/* Grain texture */}
                      <div
                        className="absolute inset-0 opacity-[0.03] z-10"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        }}
                      />

                      {product.images[0] && (
                        <Image
                          src={product.images[0].url}
                          alt={product.images[0].alt || product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      )}

                      {/* Product number badge */}
                      <div className="absolute top-4 right-4 z-20 bg-black/50 backdrop-blur-sm border border-gold/30 rounded px-3 py-1 text-xs text-gold font-light">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-6 relative">
                      {/* Product Name */}
                      <h3 className="text-xl font-light tracking-wide mb-2 group-hover:text-gold transition-colors duration-300">
                        {product.name}
                      </h3>

                      {/* Short Description */}
                      <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                        {product.shortDescription}
                      </p>

                      {/* Divider */}
                      <div className="h-px bg-gradient-to-r from-gold/20 via-gold/50 to-gold/20 mb-4" />

                      {/* Price and Slogan */}
                      <div className="flex items-center justify-between">
                        <span className="text-gold font-light text-lg">${product.price} {product.currency}</span>
                        <span className="text-xs text-gray-500 italic">{product.slogan}</span>
                      </div>

                      {/* Hover indicator */}
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{
                          opacity: hoveredIndex === index ? 1 : 0,
                          x: hoveredIndex === index ? 0 : -10
                        }}
                        className="absolute bottom-6 right-6 text-gold text-sm font-light"
                      >
                        View →
                      </motion.div>

                      {/* Subtle shimmer effect on hover */}
                      <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: hoveredIndex === index ? "100%" : "-100%" }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/5 to-transparent pointer-events-none"
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Bottom decorative section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center py-12"
          >
            <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent mb-8" />
            <p className="text-gray-500 text-sm font-light">
              Each piece carefully selected for distinction and quality
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
