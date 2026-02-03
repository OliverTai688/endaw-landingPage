"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Music2, ChevronRight } from "lucide-react";
import type { Instrument } from "@/lib/types";

interface InstrumentCardProps {
    instrument: Instrument;
    index: number;
}

export function InstrumentCard({ instrument, index }: InstrumentCardProps) {
    const totalPackages = instrument.levels.reduce(
        (sum, level) => sum + level.packages.length,
        0
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
        >
            <Link href={`/music/${instrument.nameEn}`}>
                <div className="group relative bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden border border-gray-800 hover:border-gold/40 transition-all duration-500 h-full">
                    {/* Decorative corner accents */}
                    <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-gold/20 rounded-tl-lg z-10" />
                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-gold/20 rounded-br-lg z-10" />

                    {/* Cover Image */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />

                        <Image
                            src={instrument.coverImage}
                            alt={instrument.name}
                            fill
                            crossOrigin="anonymous"
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />

                        {/* Badge overlays */}
                        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                            {instrument.rentalAvailable && (
                                <div className="bg-blue-500/80 backdrop-blur-sm border border-blue-400/30 rounded px-3 py-1 text-xs text-white font-light">
                                    可租借
                                </div>
                            )}
                            {instrument.containsEquipment && (
                                <div className="bg-green-500/80 backdrop-blur-sm border border-green-400/30 rounded px-3 py-1 text-xs text-white font-light">
                                    含器材
                                </div>
                            )}
                        </div>

                        {/* Instrument icon */}
                        <div className="absolute bottom-4 right-4 z-20">
                            <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border border-gold/30 flex items-center justify-center">
                                <Music2 size={20} className="text-gold" />
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 relative">
                        {/* Instrument Name */}
                        <h3 className="text-2xl font-light tracking-wide mb-2 group-hover:text-gold transition-colors duration-300">
                            {instrument.name}
                        </h3>

                        {/* Description Preview */}
                        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                            {instrument.description.replace(/<[^>]*>/g, "").substring(0, 100)}...
                        </p>

                        {/* Divider */}
                        <div className="h-px bg-gradient-to-r from-gold/20 via-gold/50 to-gold/20 mb-4" />

                        {/* Package Info */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-sm text-gray-400">
                                <span className="text-gold font-medium">{instrument.levels.length}</span> 等級 •{" "}
                                <span className="text-gold font-medium">{totalPackages}</span> 套票方案
                            </div>
                        </div>

                        {/* Highlights */}
                        {instrument.containsEquipment && instrument.equipmentDescription && (
                            <div className="text-xs text-green-300/70 mb-4 flex items-start gap-2">
                                <ChevronRight size={14} className="mt-0.5 flex-shrink-0" />
                                <span className="line-clamp-1">{instrument.equipmentDescription}</span>
                            </div>
                        )}

                        {instrument.rentalAvailable && (
                            <div className="text-xs text-blue-300/70 mb-4 flex items-start gap-2">
                                <ChevronRight size={14} className="mt-0.5 flex-shrink-0" />
                                <span>
                                    提供樂器租借服務
                                    {instrument.rentalOffsetAllowed && " · 租金可折抵購買"}
                                </span>
                            </div>
                        )}

                        {/* CTA */}
                        <motion.div
                            whileHover={{ x: 5 }}
                            className="flex items-center justify-between text-gold text-sm font-light mt-6"
                        >
                            <span>探索課程</span>
                            <ChevronRight size={16} />
                        </motion.div>

                        {/* Hover shimmer effect */}
                        <motion.div
                            initial={{ x: "-100%" }}
                            whileHover={{ x: "100%" }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/5 to-transparent pointer-events-none"
                        />
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
