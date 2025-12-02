"use client";

import { motion } from "framer-motion";
import { Star, Package, ShoppingBag, Sparkles } from "lucide-react";

const products = [
  { title: "Aurora Lamp", icon: Star, desc: "Luxury ambient lighting." },
  { title: "GoldWave Speaker", icon: Package, desc: "Premium sound quality." },
  { title: "Nightfall Watch", icon: ShoppingBag, desc: "Elegant craftsmanship." },
  { title: "Eclipse Perfume", icon: Sparkles, desc: "Exclusive fragrance." },
];

export default function ProductGrid() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <h2 className="text-center text-3xl font-bold mb-12 text-gold">
        Featured Products
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-black border border-gold/40 rounded-2xl p-6 text-center hover:border-gold/80 transition"
          >
            <p.icon className="mx-auto mb-4 text-gold" size={40} />
            <h3 className="font-semibold text-lg">{p.title}</h3>
            <p className="text-gray-400 text-sm mt-2">{p.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
