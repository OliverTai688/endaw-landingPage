"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import type { Workshop } from "@/lib/types";

interface WorkshopCardProps {
    workshop: Workshop;
    index: number;
}

export function WorkshopCard({ workshop, index }: WorkshopCardProps) {
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat("zh-TW", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "short",
        }).format(date);
    };

    const formatTime = (date: Date) => {
        return new Intl.DateTimeFormat("zh-TW", {
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };

    const isAlmostFull = workshop.capacity.remaining <= 5;
    const isFull = workshop.capacity.remaining === 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
        >
            <Link href={`/workshops/${workshop.id}`}>
                <div className="group relative bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden border border-gray-800 hover:border-gold/40 transition-all duration-500">
                    {/* Decorative corner accents */}
                    <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-gold/20 rounded-tl-lg z-10" />
                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-gold/20 rounded-br-lg z-10" />

                    {/* Cover Image */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />

                        <Image
                            src={workshop.coverImage}
                            alt={workshop.title}
                            fill
                            crossOrigin="anonymous"
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />

                        {/* Status badges */}
                        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                            {isFull && (
                                <div className="bg-red-500/90 backdrop-blur-sm border border-red-400/30 rounded px-3 py-1 text-xs text-white font-medium">
                                    已額滿
                                </div>
                            )}
                            {!isFull && isAlmostFull && (
                                <div className="bg-orange-500/90 backdrop-blur-sm border border-orange-400/30 rounded px-3 py-1 text-xs text-white font-medium">
                                    即將額滿
                                </div>
                            )}
                        </div>

                        {/* Date badge overlay */}
                        <div className="absolute bottom-4 left-4 z-20">
                            <div className="bg-black/70 backdrop-blur-md border border-gold/30 rounded-lg px-4 py-2">
                                <div className="flex items-center gap-2 text-gold">
                                    <Calendar size={16} />
                                    <span className="text-sm font-light">
                                        {formatDate(workshop.schedule.date)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 relative">
                        {/* Title */}
                        <h3 className="text-2xl font-light tracking-wide mb-2 group-hover:text-gold transition-colors duration-300">
                            {workshop.title}
                        </h3>

                        {/* Subtitle */}
                        <p className="text-sm text-gray-400 mb-4">{workshop.subtitle}</p>

                        {/* Divider */}
                        <div className="h-px bg-gradient-to-r from-gold/20 via-gold/50 to-gold/20 mb-4" />

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Clock size={14} className="text-gold/70" />
                                <span>{formatTime(workshop.schedule.date)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Users size={14} className="text-gold/70" />
                                <span>
                                    剩餘 <span className="text-gold font-medium">{workshop.capacity.remaining}</span> 位
                                </span>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-start gap-2 text-xs text-gray-400 mb-4">
                            <MapPin size={14} className="text-gold/70 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-1">{workshop.schedule.location}</span>
                        </div>

                        {/* Price and CTA */}
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-2xl font-light text-gold">
                                    NT$ {workshop.price.toLocaleString()}
                                </span>
                            </div>
                            <motion.div
                                whileHover={{ x: 5 }}
                                className="text-gold text-sm font-light"
                            >
                                查看詳情 →
                            </motion.div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mt-4">
                            {workshop.tags.slice(0, 3).map((tag) => (
                                <span
                                    key={tag}
                                    className="px-2 py-1 bg-gold/10 border border-gold/20 rounded text-xs text-gold/80"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>

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
