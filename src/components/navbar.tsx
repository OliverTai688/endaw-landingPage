"use client";

import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link"; // ⬅️ 新增
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const menuItems = [
    { name: "Home", href: "/home" },
    { name: "Products", href: "/products" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`w-full bg-black/95 backdrop-blur-md text-white fixed top-0 left-0 z-50 border-b transition-all duration-500 ${
        scrolled ? "border-gold/20 shadow-lg shadow-black/50" : "border-gold/10"
      }`}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center relative group"
        >
          <Link href="/home">
            <Image
              src="/logo/endaw.png"
              alt="ENDAW Logo"
              width={1434}
              height={647}
              priority
              className="object-contain w-32 md:w-40 lg:w-44 invert brightness-200 transition-all duration-300 group-hover:brightness-150 cursor-pointer"
            />
          </Link>

          <div className="absolute inset-0 bg-gold/0 group-hover:bg-gold/5 blur-xl transition-all duration-500 -z-10" />
        </motion.div>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-1">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
            >
              <Link
                href={item.href}
                className="relative px-5 py-2 text-sm tracking-wider uppercase font-light text-gray-400 hover:text-white transition-colors duration-300 group"
              >
                <span className="relative z-10">{item.name}</span>

                <span className="absolute bottom-1 left-5 right-5 h-px bg-gradient-to-r from-transparent via-gold to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                <span className="absolute inset-0 bg-gold/0 group-hover:bg-gold/5 rounded transition-all duration-300" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile menu toggle */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="md:hidden relative p-2 hover:bg-gold/5 rounded transition-colors duration-300"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X size={24} className="text-gold" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu size={24} className="text-gray-400" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden bg-black/98 border-t border-gold/10 overflow-hidden"
          >
            <div className="px-6 py-6 space-y-1">
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block w-full text-left px-4 py-3 text-base tracking-wider uppercase font-light text-gray-400 hover:text-white hover:bg-gold/5 rounded transition-all duration-300 group"
                  >
                    <span className="flex items-center justify-between">
                      {item.name}
                      <span className="w-0 h-px bg-gold group-hover:w-6 transition-all duration-300" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-noise mix-blend-overlay" />

      <style jsx>{`
        .bg-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
      `}</style>
    </motion.nav>
  );
}
