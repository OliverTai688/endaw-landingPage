"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ChevronRight, Star, Shield, Package, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import Link from "next/link";

interface ProductImage {
  url: string;
  alt: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

interface ProductSpec {
  label: string;
  value: string;
  sortOrder: number;
}

interface ProductData {
  id: string;
  slug: string;
  name: string;
  slogan: string | null;
  shortDescription: string | null;
  description: string;
  price: number;
  currency: string;
  images: ProductImage[];
  specs: ProductSpec[];
}

export default function ProductDetailPage() {
    const { id } = useParams();
    const [product, setProduct] = useState<ProductData | null>(null);
    const [isNotFound, setIsNotFound] = useState(false);
    const [mainImg, setMainImg] = useState<string | undefined>();
    const [isHovering, setIsHovering] = useState(false);
    const [imagesLoaded, setImagesLoaded] = useState<{ [key: string]: boolean }>({});
    const [mainImageLoaded, setMainImageLoaded] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const { scrollYProgress } = useScroll();
    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.3]);

    // Fetch product by slug
    useEffect(() => {
        if (!id) return;
        fetch(`/api/bff/v1/products?slug=${id}`)
            .then(res => res.json())
            .then(json => {
                if (json.success && json.data) {
                    setProduct(json.data);
                    setMainImg(json.data.images?.[0]?.url);
                } else {
                    setIsNotFound(true);
                }
            })
            .catch(() => setIsNotFound(true));
    }, [id]);

    // Initial loading animation
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsInitialLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    // Track individual image loading
    const handleImageLoad = (imgSrc: string) => {
        setImagesLoaded((prev) => ({ ...prev, [imgSrc]: true }));
    };

    if (isNotFound) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 font-light tracking-wider">Product not found</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 font-light tracking-wider">Loading...</p>
                </div>
            </div>
        );
    }

    const imageUrls = product.images.map(img => img.url);
    const formatSpec = (spec: ProductSpec) => {
        if (spec.label) return `${spec.label} — ${spec.value}`;
        return spec.value;
    };

    return (
        <>
            <Navbar />
            <div className="mt-10 min-h-screen bg-black relative overflow-hidden">

                {/* Subtle background effects */}
                <div className="fixed inset-0 opacity-30">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-gold/5 to-transparent blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-gold/3 to-transparent blur-3xl" />
                </div>

                {/* Grain texture overlay */}
                <div className="fixed inset-0 opacity-[0.015] pointer-events-none bg-noise mix-blend-overlay" />

                {/* Initial page loading overlay */}
                <AnimatePresence>
                    {isInitialLoading && (
                        <motion.div
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="fixed inset-0 bg-black z-50 flex items-center justify-center"
                        >
                            <div className="text-center">
                                <motion.div
                                    animate={{
                                        rotate: 360,
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: "linear",
                                    }}
                                    className="w-16 h-16 border-2 border-gold/30 border-t-gold rounded-full mx-auto mb-4"
                                />
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-gray-500 font-light tracking-[0.2em] uppercase text-xs"
                                >
                                    Loading Excellence
                                </motion.p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-20">
                    {/* Breadcrumb with elegant styling */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="flex items-center gap-2 text-xs tracking-widest uppercase mb-12 lg:mb-16"
                    >
                        <span className="text-gray-600 hover:text-gold/70 transition-colors cursor-pointer">
                            <Link href="/home">Home</Link>
                        </span>
                        <ChevronRight size={12} className="text-gray-700" />
                        <span className="text-gray-600 hover:text-gold/70 transition-colors cursor-pointer">
                            <Link href="/products">Products</Link>
                        </span>
                        <ChevronRight size={12} className="text-gray-700" />
                        <span className="text-gold/90">{product.name}</span>
                    </motion.div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                        {/* Left: Images - 7 columns */}
                        <div className="lg:col-span-7">
                            {/* Main Image with elegant border */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                className="relative group"
                            >
                                {/* Decorative corner accents */}
                                <div className="absolute -top-3 -left-3 w-12 h-12 border-t-2 border-l-2 border-gold/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                                <div className="absolute -top-3 -right-3 w-12 h-12 border-t-2 border-r-2 border-gold/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                                <div className="absolute -bottom-3 -left-3 w-12 h-12 border-b-2 border-l-2 border-gold/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                                <div className="absolute -bottom-3 -right-3 w-12 h-12 border-b-2 border-r-2 border-gold/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

                                <motion.div
                                    key={mainImg}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className="relative w-full aspect-[4/5] bg-gradient-to-br from-gray-950 to-black rounded-sm overflow-hidden border border-gold/10 shadow-2xl shadow-gold/5"
                                    onMouseEnter={() => setIsHovering(true)}
                                    onMouseLeave={() => setIsHovering(false)}
                                >
                                    {/* Loading skeleton for main image */}
                                    {!mainImageLoaded && (
                                        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-950 animate-pulse">
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/5 to-transparent animate-shimmer" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-12 h-12 border-2 border-gold/20 border-t-gold/60 rounded-full animate-spin" />
                                            </div>
                                        </div>
                                    )}

                                    {mainImg && (
                                        <Image
                                            src={mainImg}
                                            alt={product.name}
                                            fill
                                            priority
                                            className="object-cover transition-all duration-700 ease-out"
                                            style={{
                                                transform: isHovering ? "scale(1.05)" : "scale(1)",
                                                opacity: mainImageLoaded ? 1 : 0,
                                            }}
                                            onLoadingComplete={() => setMainImageLoaded(true)}
                                        />
                                    )}

                                    {/* Subtle vignette */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                                </motion.div>
                            </motion.div>

                            {/* Thumbnail Gallery */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="mt-6"
                            >
                                <div className="relative">
                                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
                                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

                                    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 scroll-smooth">
                                        {imageUrls.map((img, idx) => (
                                            <motion.button
                                                key={img}
                                                onClick={() => {
                                                    setMainImg(img);
                                                    setMainImageLoaded(false);
                                                }}
                                                whileHover={{ y: -4 }}
                                                whileTap={{ scale: 0.95 }}
                                                transition={{ duration: 0.2 }}
                                                className={`relative flex-shrink-0 w-20 h-20 rounded-sm overflow-hidden border transition-all duration-300 ${mainImg === img
                                                    ? "border-gold shadow-lg shadow-gold/20"
                                                    : "border-gray-800 hover:border-gold/40"
                                                    }`}
                                            >
                                                {!imagesLoaded[img] && (
                                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-950 animate-pulse">
                                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/5 to-transparent animate-shimmer-fast" />
                                                    </div>
                                                )}

                                                <Image
                                                    src={img}
                                                    width={100}
                                                    height={100}
                                                    alt={`View ${idx + 1}`}
                                                    className="object-cover w-full h-full transition-opacity duration-300"
                                                    style={{ opacity: imagesLoaded[img] ? 1 : 0 }}
                                                    onLoadingComplete={() => handleImageLoad(img)}
                                                />

                                                {mainImg === img && (
                                                    <motion.div
                                                        layoutId="thumbnail-indicator"
                                                        className="absolute inset-0 bg-gold/10"
                                                    />
                                                )}

                                                <div className="absolute top-1 right-1 bg-black/80 backdrop-blur-sm px-1.5 py-0.5 rounded-sm">
                                                    <span className="text-[9px] text-white font-light">
                                                        {String(idx + 1).padStart(2, '0')}
                                                    </span>
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                <p className="text-center text-xs text-gray-600 mt-4 font-light tracking-wider">
                                    {imageUrls.length} Images Available
                                </p>
                            </motion.div>
                        </div>

                        {/* Right: Product Info - 5 columns */}
                        <div className="lg:col-span-5 flex flex-col">
                            {/* Product Title */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <Sparkles size={16} className="text-gold" />
                                    <span className="text-xs tracking-[0.2em] uppercase text-gold/70">Premium Selection</span>
                                </div>

                                <h1 className="text-4xl lg:text-5xl font-light text-white mb-4 tracking-tight leading-tight">
                                    {product.name}
                                </h1>

                                <p className="text-gray-400 italic text-sm tracking-wide mb-8 font-light">
                                    {product.slogan}
                                </p>

                                <div className="w-16 h-px bg-gradient-to-r from-gold to-transparent mb-8" />
                            </motion.div>

                            {/* Price */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.7, delay: 0.2 }}
                                className="mb-10"
                            >
                                <p className="text-3xl lg:text-4xl font-light text-gold tracking-wide">
                                    ${product.price} {product.currency}
                                </p>
                            </motion.div>

                            {/* Description */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.7, delay: 0.3 }}
                                className="mb-12"
                            >
                                <p className="text-gray-300 leading-relaxed text-sm font-light whitespace-pre-line">
                                    {product.description}
                                </p>
                            </motion.div>

                            {/* Features */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.7, delay: 0.4 }}
                                className="mb-12"
                            >
                                <h3 className="text-sm tracking-[0.2em] uppercase text-gold/90 mb-6 font-light">
                                    Distinguished Features
                                </h3>
                                <div className="space-y-4">
                                    {product.specs.map((spec, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                                            className="flex items-start gap-3 group"
                                        >
                                            <div className="w-1 h-1 mt-2 bg-gold rounded-full group-hover:scale-150 transition-transform duration-300" />
                                            <span className="text-gray-300 text-sm font-light leading-relaxed flex-1 group-hover:text-gray-100 transition-colors duration-300">
                                                {formatSpec(spec)}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Trust Badges */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.6 }}
                                className="grid grid-cols-3 gap-4 mb-12 pb-12 border-b border-gray-900"
                            >
                                <div className="text-center">
                                    <Shield size={20} className="text-gold/60 mx-auto mb-2" />
                                    <p className="text-xs text-gray-500 font-light tracking-wide">Authentic</p>
                                </div>
                                <div className="text-center">
                                    <Star size={20} className="text-gold/60 mx-auto mb-2" />
                                    <p className="text-xs text-gray-500 font-light tracking-wide">Premium</p>
                                </div>
                                <div className="text-center">
                                    <Package size={20} className="text-gold/60 mx-auto mb-2" />
                                    <p className="text-xs text-gray-500 font-light tracking-wide">Curated</p>
                                </div>
                            </motion.div>

                            {/* CTA Button */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.7 }}
                            >
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="relative w-full py-5 bg-gradient-to-r from-gold via-yellow-600 to-gold text-black font-light tracking-[0.15em] uppercase text-sm rounded-sm overflow-hidden group shadow-lg shadow-gold/20"
                                >
                                    <span className="relative z-10">Inquire for Acquisition</span>

                                    {/* Shimmer effect */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                        animate={{
                                            x: ['-200%', '200%'],
                                        }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            ease: "linear",
                                        }}
                                    />
                                </motion.button>

                                <p className="text-center text-xs text-gray-600 mt-4 font-light tracking-wide">
                                    Exclusive consultation available upon request
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </div>

                <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Montserrat:wght@300;400;500&display=swap');

        body {
          font-family: 'Montserrat', sans-serif;
        }

        h1, h2, h3 {
          font-family: 'Cormorant Garamond', serif;
        }

        .bg-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }

        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }

        @keyframes shimmer {
          0% { transform: translateX(-200%); }
          100% { transform: translateX(200%); }
        }

        @keyframes shimmer-fast {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .animate-shimmer-fast {
          animation: shimmer-fast 1.5s infinite;
        }

        /* Hide scrollbar but keep functionality */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
            </div>
        </>
    );
}
