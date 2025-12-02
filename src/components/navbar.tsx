"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const menuItems = ["Home", "Products", "About", "Contact"];

  return (
    <nav className="w-full bg-black text-white fixed top-0 left-0 z-50 border-b border-gold/30">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image
            src="/logo-black.png"
            alt="Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
          <span className="text-xl font-bold tracking-wide">GoldWave</span>
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex gap-8">
          {menuItems.map((item) => (
            <button
              key={item}
              className="hover:text-gold transition-colors"
            >
              {item}
            </button>
          ))}
        </div>

        {/* Mobile menu icon */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden bg-black border-t border-gold/30 px-6 py-4 space-y-3">
          {menuItems.map((item) => (
            <div key={item} className="text-lg hover:text-gold">{item}</div>
          ))}
        </div>
      )}
    </nav>
  );
}
