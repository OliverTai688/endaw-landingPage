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

        {/* Logo：使用原尺寸，但自動縮小 */}
        <div className="flex items-center">
          <Image
            src="/logo/endaw.png"
            alt="ENDAW Logo"
            width={1434}
            height={647}
            priority
            className="
              object-contain 
              w-32 md:w-40 
              invert brightness-200     /* 將黑色 Logo 反白 + 提亮 */
            "
          />
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
