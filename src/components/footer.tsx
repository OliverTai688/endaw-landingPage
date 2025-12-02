"use client";

import { Instagram, Facebook, Mail, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Footer() {
  const socialLinks = [
    { icon: Instagram, href: "https://www.instagram.com/endaw.tw/", label: "Instagram" },
    { icon: Facebook, href: "https://www.facebook.com/ENDAW.TW", label: "Facebook" },
  ];

  const footerLinks = [
    { title: "About Us", href: "/about" },
    { title: "Products", href: "/products" },
    { title: "Contact", href: "/contact" },
  ];

  return (
    <footer className="relative w-full bg-gradient-to-b from-black to-gray-950 border-t border-gold/20 overflow-hidden">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-radial from-gold/5 to-transparent blur-3xl pointer-events-none" />

      {/* Grain texture */}
      <div className="absolute inset-0 opacity-[0.015] bg-noise mix-blend-overlay pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-20">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 mb-12">
          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center md:text-left"
          >
            <div className="flex justify-center md:justify-start mb-4">
              <Image
                src="/logo/endaw.png"
                alt="ENDAW Logo"
                width={1434}
                height={647}
                className="object-contain w-40 invert brightness-200"
              />
            </div>
            <p className="text-gray-500 text-sm font-light leading-relaxed max-w-xs mx-auto md:mx-0">
              Curating exceptional experiences through premium quality and timeless elegance.
            </p>
          </motion.div>

          {/* Quick Links Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-center md:text-left"
          >
            <h4 className="text-sm tracking-[0.2em] uppercase text-gold/90 mb-6 font-light">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {footerLinks.map((link, index) => (
                <motion.li
                  key={link.title}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-gold text-sm font-light transition-colors duration-300 inline-flex items-center gap-2 group"
                  >
                    <span className="w-0 h-px bg-gold group-hover:w-4 transition-all duration-300" />
                    {link.title}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center md:text-left"
          >
            <h4 className="text-sm tracking-[0.2em] uppercase text-gold/90 mb-6 font-light">
              Get in Touch
            </h4>
            <div className="space-y-4">
              <a
                href="mailto:staff@endaw.co"
                className="flex items-center justify-center md:justify-start gap-3 text-gray-400 hover:text-gold text-sm font-light transition-colors duration-300 group"
              >
                <Mail size={16} className="text-gold/60 group-hover:text-gold transition-colors" />
                <span>staff@endaw.co</span>
              </a>
              <div className="flex items-center justify-center md:justify-start gap-3 text-gray-400 text-sm font-light">
                <MapPin size={16} className="text-gold/60" />
                <span>Taipei, Taiwan</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent mb-8"
        />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="flex items-center gap-4"
          >
            <span className="text-xs tracking-wider uppercase text-gray-600 font-light">
              Follow Us
            </span>
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  whileHover={{ y: -3, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.4 + index * 0.1,
                    type: "spring",
                    stiffness: 200,
                  }}
                  viewport={{ once: true }}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-900 to-black border border-gold/20 hover:border-gold/50 flex items-center justify-center text-gray-400 hover:text-gold transition-all duration-300 group"
                >
                  <social.icon size={18} className="group-hover:scale-110 transition-transform duration-300" />
                  
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 rounded-full bg-gold/0 group-hover:bg-gold/10 blur-lg transition-all duration-500" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Copyright */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-gray-600 text-xs font-light tracking-wide"
          >
            © 2025 ENDAW. All rights reserved.
          </motion.p>
        </div>

        {/* Decorative corner accents */}
        <div className="absolute bottom-0 left-0 w-24 h-24 border-b-2 border-l-2 border-gold/10 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-gold/10 pointer-events-none" />
      </div>

      <style jsx global>{`
        .bg-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }

        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `}</style>
    </footer>
  );
}