"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ChevronRight, Sparkles, Users, Heart, Zap } from "lucide-react";
import Navbar from "@/components/navbar";

const teamMembers = [
  {
    name: "Kirin Lam",
    role: "Singer/Guitar man/CEO of ENDAW",
    specialty: "Ukulele Lover",
  },
  {
    name: "Yalun Lee",
    role: "Industrial designer/Small forward",
    specialty: "3 time MVP, 4 times All-Star, Defensive Player Of The Year",
  },
  {
    name: "Jr Lian",
    role: "Craftman/Designer/Guitarist",
    specialty: "12-year Metal, Coating Specialist",
  },
  {
    name: "Sloan Shiu",
    role: "80 rock GT player/ Cat enthusiast",
    specialty: "Founder of CATFORCE, Co-founder of CFD CABLE, Circuit Designer, Expert Welder, 9-year Experience",
  },
  {
    name: "Ether Kur Ker",
    role: "Punk Vo&Bass/Graphic designer",
    specialty: "Co-founder of CFD Cable, 9-year Veteran in repairing, designing, and welding",
  },
];

export default function AboutPage() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.3]);

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
            <span className="text-white">About</span>
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
              About Endaw
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Where passion meets craftsmanship
            </p>

            {/* Decorative line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent mt-12"
            />
          </motion.div>

          {/* Story Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-4xl mx-auto mb-24"
          >
            <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-lg p-12 border border-gray-800">
              {/* Decorative corner accents */}
              <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-gold/20 rounded-tl-lg" />
              <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-gold/20 rounded-br-lg" />

              <div className="relative">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                    <Heart className="text-gold" size={18} />
                  </div>
                  <h2 className="text-3xl font-light tracking-wide">Our Story</h2>
                </div>

                <div className="space-y-6 text-gray-300 leading-relaxed">
                  <p className="text-lg">
                    <span className="text-gold font-light">"ENDAW"</span> means{" "}
                    <span className="text-gold">帥 (shuài)</span> in Taiwanese. It also means{" "}
                    <span className="text-gold">"source,"</span> where it all begins.
                  </p>

                  <div className="h-px bg-gradient-to-r from-gold/20 via-gold/50 to-gold/20 my-8" />

                  <p>
                    Endaw Manufacture was founded in <span className="text-gold">2015</span>, where we
                    gather top designers in Taiwan, striving to create products that are simply right.
                  </p>

                  <p>
                    It is what it is when an instrument just lies on the shelf in the store, but when
                    it becomes a possession, there is <span className="text-gold">music</span>, there
                    is <span className="text-gold">warmth</span>, and there is a{" "}
                    <span className="text-gold">spark</span>.
                  </p>

                  <p className="text-lg italic text-gold/80 pt-4">
                    With your creativity, we are most excited about what can and is about to be
                    ignited!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Team Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                <Users className="text-gold" size={18} />
              </div>
              <h2 className="text-4xl font-light tracking-wide">The Crew</h2>
            </div>
            <p className="text-gray-400">The passionate minds behind Endaw</p>

            {/* Decorative line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent mt-8"
            />
          </motion.div>

          {/* Team Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + 0.1 * index, duration: 0.5 }}
                whileHover={{ y: -8 }}
                className="relative group"
              >
                <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-lg p-8 border border-gray-800 hover:border-gold/40 transition-all duration-500 h-full">
                  {/* Decorative corner accents */}
                  <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-gold/20 rounded-tl-lg" />
                  <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-gold/20 rounded-br-lg" />

                  {/* Member number badge */}
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm border border-gold/30 rounded px-3 py-1 text-xs text-gold font-light">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="relative">
                    {/* Name */}
                    <h3 className="text-2xl font-light tracking-wide mb-3 group-hover:text-gold transition-colors duration-300">
                      {member.name}
                    </h3>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-gold/20 via-gold/50 to-gold/20 mb-4" />

                    {/* Role */}
                    <p className="text-gray-300 mb-4 text-sm leading-relaxed">{member.role}</p>

                    {/* Specialty */}
                    <div className="pt-4 border-t border-gray-800">
                      <p className="text-gray-400 text-xs leading-relaxed">{member.specialty}</p>
                    </div>
                  </div>

                  {/* Subtle shimmer effect on hover */}
                  <motion.div
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/5 to-transparent pointer-events-none"
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom decorative section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center py-12"
          >
            <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent mb-8" />
            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm font-light">
              <Zap className="text-gold" size={16} />
              <p>Igniting creativity since 2015</p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}