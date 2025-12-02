"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Instagram, Facebook, Send } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { sendContactEmail } from "./action";
import Navbar from "@/components/navbar";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(formData: FormData) {
    setStatus("loading");

    const res = await sendContactEmail(formData);

    if (res.success) {
      setStatus("success");
    } else {
      setErrorMsg(res.error || "Failed to send email");
      setStatus("error");
    }
  }

  return (
    <>
    <Navbar/>
    <div className="min-h-screen mt-10 bg-black text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-radial from-gold/5 to-transparent blur-3xl opacity-40 pointer-events-none" />

      {/* Grain texture */}
      <div className="absolute inset-0 opacity-[0.015] bg-noise mix-blend-overlay pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6 lg:px-12 py-24">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <h1 className="text-4xl lg:text-5xl font-light tracking-tight mb-4">
            Get in Touch
          </h1>
          <p className="text-gray-400 font-light tracking-wide max-w-xl mx-auto">
            We're here to help. Reach out to us for inquiries, collaborations, or product support.
          </p>

          <div className="w-24 h-px bg-gradient-to-r from-gold via-gold/60 to-transparent mx-auto mt-6" />
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* LEFT INFO */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <Image
              src="/logo/endaw.png"
              alt="ENDAW Logo"
              width={1434}
              height={647}
              className="object-contain w-40 invert brightness-200 mb-4"
            />

            <p className="text-gray-400 leading-relaxed max-w-sm font-light">
              For product details, premium consultations, or special collaborations,
              feel free to connect with us anytime.
            </p>

            <div className="flex items-center gap-4">
              <Mail className="text-gold/70" size={20} />
              <span className="text-gray-300 text-sm">staff@endaw.co</span>
            </div>

            <div className="flex items-center gap-4">
              <MapPin className="text-gold/70" size={20} />
              <span className="text-gray-300 text-sm">Taipei, Taiwan</span>
            </div>

            <div className="mt-8">
              <p className="text-sm uppercase tracking-[0.1em] text-gray-600 mb-4">
                Follow Us
              </p>
              <div className="flex gap-4">
                {[{ icon: Instagram, href: "https://www.instagram.com/endaw.tw/" },
                  { icon: Facebook, href: "https://www.facebook.com/ENDAW.TW" }].map((s, i) => (
                  <motion.a
                    key={i}
                    href={s.href}
                    target="_blank"
                    whileHover={{ y: -3, scale: 1.05 }}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-900 to-black border border-gold/20 hover:border-gold/50 flex items-center justify-center text-gray-400 hover:text-gold transition-all duration-300"
                  >
                    <s.icon size={18} />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* RIGHT FORM */}
          <motion.form
            action={handleSubmit}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-black/40 border border-gold/20 rounded-lg p-8 shadow-xl shadow-black/50 space-y-6 backdrop-blur"
          >
            <h2 className="text-lg uppercase tracking-[0.2em] text-gold/80 font-light mb-2">
              Send us a message
            </h2>

            <input
              name="name"
              type="text"
              placeholder="Your Name"
              required
              className="w-full bg-transparent border border-gray-700 focus:border-gold/60 px-4 py-3 rounded-sm text-sm text-gray-200 outline-none transition-all"
            />

            <input
              name="email"
              type="email"
              placeholder="Your Email"
              required
              className="w-full bg-transparent border border-gray-700 focus:border-gold/60 px-4 py-3 rounded-sm text-sm text-gray-200 outline-none transition-all"
            />

            <textarea
              name="message"
              placeholder="Your Message"
              rows={5}
              required
              className="w-full bg-transparent border border-gray-700 focus:border-gold/60 px-4 py-3 rounded-sm text-sm text-gray-200 outline-none transition-all resize-none"
            />

            <motion.button
              disabled={status === "loading"}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 mt-2 bg-gradient-to-r from-gold via-yellow-600 to-gold
                text-black text-sm tracking-[0.15em] uppercase rounded-sm font-medium
                flex items-center justify-center gap-2 shadow-lg shadow-gold/20
                disabled:opacity-50"
            >
              {status === "loading" ? "Sending..." : "Send Message"}
              <Send size={16} />
            </motion.button>

            {/* Success / Error Messages */}
            {status === "success" && (
              <p className="text-green-400 text-sm mt-2">Message sent successfully! 🎉</p>
            )}

            {status === "error" && (
              <p className="text-red-400 text-sm mt-2">Error: {errorMsg}</p>
            )}
          </motion.form>
        </div>
      </div>

      <style jsx global>{`
        .bg-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' ... %3E");
        }
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
    </>
  );
}
