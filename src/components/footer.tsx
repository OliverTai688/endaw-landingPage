"use client";

import { Instagram, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-black border-t border-gold/30 py-10 text-center rounded-t-3xl mt-10">
      <h3 className="text-gold text-xl font-bold">GoldWave</h3>

      <div className="flex justify-center gap-6 mt-4">
        <a
          href="https://instagram.com"
          target="_blank"
          className="hover:text-gold transition"
        >
          <Instagram size={28} />
        </a>
        <a
          href="https://facebook.com"
          target="_blank"
          className="hover:text-gold transition"
        >
          <Facebook size={28} />
        </a>
      </div>

      <p className="text-gray-500 text-sm mt-6">
        © 2025 GoldWave. All rights reserved.
      </p>
    </footer>
  );
}
