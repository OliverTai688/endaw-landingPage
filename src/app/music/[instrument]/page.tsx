"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Music2, Package, Calendar, AlertCircle, Info, ChevronRight } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { PackageSelector } from "@/components/music/package-selector";
import { FAQAccordion } from "@/components/shared/faq-accordion";
import { instruments, monthlyAnnouncements } from "@/data/music";
import FeedbackOverlay from "@/components/admin/FeedbackOverlay";
import type { Package as PackageType } from "@/lib/types";

export default function InstrumentDetailPage() {
    const params = useParams();
    const instrument = instruments.find((i) => i.nameEn === params.instrument);

    if (!instrument) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <p>樂器課程不存在</p>
            </div>
        );
    }

    const currentMonth = "2026-03";
    const currentAnnouncement = monthlyAnnouncements.find(
        (a) => a.month === currentMonth && a.instruments.includes(instrument.id)
    );

    const handleSelectPackage = (pkg: PackageType) => {
        // Navigate to checkout page (to be implemented)
        console.log("Selected package:", pkg);
        // For MVP, we'll just log it
    };

    return (
        <FeedbackOverlay pageName={`樂器課程詳情: ${instrument.name}`}>
            <Navbar />
            <div className="min-h-screen bg-black text-white">
                {/* Hero Section */}
                <div className="relative h-[50vh] min-h-[400px]">
                    {/* Cover Image */}
                    <div className="absolute inset-0">
                        <Image
                            src={instrument.coverImage}
                            alt={instrument.name}
                            fill
                            crossOrigin="anonymous"
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40" />
                    </div>

                    {/* Navigation Overlay */}
                    <div className="absolute top-24 left-6 z-20">
                        <Link
                            href="/music"
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-300 group"
                        >
                            <div className="w-8 h-8 rounded-full bg-black/50 border border-gray-800 flex items-center justify-center group-hover:bg-gold/10 group-hover:border-gold/30">
                                <ChevronRight size={16} className="rotate-180" />
                            </div>
                            <span className="text-sm font-light">返回所有樂器課程</span>
                        </Link>
                    </div>

                    {/* Hero Content */}
                    <div className="relative container mx-auto px-6 h-full flex flex-col justify-end pb-12">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            {/* Badges */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {instrument.rentalAvailable && (
                                    <span className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded text-sm text-blue-200 backdrop-blur-sm">
                                        可租借
                                    </span>
                                )}
                                {instrument.containsEquipment && (
                                    <span className="px-3 py-1 bg-green-500/20 border border-green-400/30 rounded text-sm text-green-200 backdrop-blur-sm">
                                        含器材
                                    </span>
                                )}
                            </div>

                            <h1 className="text-5xl md:text-6xl font-light tracking-tight mb-4">
                                {instrument.name}
                            </h1>

                            <p className="text-lg text-gray-300 max-w-2xl">
                                {instrument.description.replace(/<[^>]*>/g, "").substring(0, 150)}...
                            </p>
                        </motion.div>
                    </div>
                </div>

                {/* Content */}
                <div className="container mx-auto px-6 py-20">
                    {/* Monthly Announcement */}
                    {currentAnnouncement && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mb-16 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-blue-900/20 border border-blue-800/30 rounded-lg p-6"
                        >
                            <div className="flex items-start gap-4">
                                <Calendar size={24} className="text-blue-300 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="text-xl font-light text-blue-200 mb-4">
                                        {currentMonth.replace("-", "年")}月課程時間表
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {currentAnnouncement.schedule
                                            .filter((s) => s.type.includes(instrument.name))
                                            .map((schedule, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center gap-3 text-sm text-blue-100/80 bg-blue-900/10 rounded px-3 py-2"
                                                >
                                                    <span className="text-blue-400">
                                                        {new Intl.DateTimeFormat("zh-TW", {
                                                            month: "numeric",
                                                            day: "numeric",
                                                        }).format(schedule.date)}
                                                    </span>
                                                    <span>·</span>
                                                    <span>{schedule.time}</span>
                                                    <span>·</span>
                                                    <span className="text-blue-200">{schedule.instructor}</span>
                                                </div>
                                            ))}
                                    </div>
                                    {currentAnnouncement.announcements.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-blue-800/30">
                                            <ul className="space-y-1">
                                                {currentAnnouncement.announcements.map((announcement, idx) => (
                                                    <li key={idx} className="text-sm text-blue-100/80 flex items-start gap-2">
                                                        <span className="text-blue-400 mt-1">•</span>
                                                        <span>{announcement}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Description Section */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-16"
                    >
                        <h2 className="text-3xl font-light tracking-tight mb-6 flex items-center gap-3">
                            <div className="w-1 h-8 bg-gold rounded" />
                            課程介紹
                        </h2>
                        <div
                            className="prose prose-invert prose-lg max-w-none"
                            dangerouslySetInnerHTML={{ __html: instrument.description }}
                        />
                    </motion.section>

                    {/* Equipment Info */}
                    {instrument.containsEquipment && instrument.equipmentDescription && (
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mb-16"
                        >
                            <div className="bg-gradient-to-br from-green-900/20 to-black/50 border border-green-800/30 rounded-lg p-6">
                                <div className="flex items-start gap-3 mb-3">
                                    <Package size={24} className="text-green-400 flex-shrink-0" />
                                    <h3 className="text-2xl font-light text-green-200">器材包含</h3>
                                </div>
                                <p className="text-green-100/80 leading-relaxed">
                                    {instrument.equipmentDescription}
                                </p>
                            </div>
                        </motion.section>
                    )}

                    {/* Rental Info */}
                    {instrument.rentalAvailable && (
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mb-16"
                        >
                            <div className="bg-gradient-to-br from-blue-900/20 to-black/50 border border-blue-800/30 rounded-lg p-6">
                                <div className="flex items-start gap-3 mb-3">
                                    <Info size={24} className="text-blue-400 flex-shrink-0" />
                                    <h3 className="text-2xl font-light text-blue-200">樂器租借</h3>
                                </div>
                                <p className="text-blue-100/80 leading-relaxed mb-2">
                                    我們提供{instrument.name}租借服務，讓您在確定學習意願前無需立即購買樂器。
                                </p>
                                {instrument.rentalOffsetAllowed && (
                                    <p className="text-blue-300 text-sm">
                                        ✓ 租借費用可折抵購買樂器費用（限租借期間內）
                                    </p>
                                )}
                            </div>
                        </motion.section>
                    )}

                    {/* Package Selection */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-16"
                    >
                        <h2 className="text-3xl font-light tracking-tight mb-8 flex items-center gap-3">
                            <div className="w-1 h-8 bg-gold rounded" />
                            選擇課程方案
                        </h2>
                        <PackageSelector levels={instrument.levels} onSelectPackage={handleSelectPackage} />
                    </motion.section>

                    {/* Policy Section */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-16"
                    >
                        <h2 className="text-3xl font-light tracking-tight mb-8 flex items-center gap-3">
                            <div className="w-1 h-8 bg-gold rounded" />
                            課程政策
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Validity Period */}
                            <div className="bg-gradient-to-br from-gray-900/50 to-black/50 border border-gray-800 rounded-lg p-6">
                                <h3 className="text-xl font-light text-gold mb-3">有效期限政策</h3>
                                <p className="text-gray-300 text-sm leading-relaxed mb-3">
                                    所有課程套票自首堂課日期起算，須於三個月內使用完畢。請務必妥善安排您的學習時間。
                                </p>
                                <div className="text-xs text-gray-400">
                                    <div className="flex items-start gap-2 mb-1">
                                        <span className="text-gold">•</span>
                                        <span>有效期限內可彈性安排上課時間</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-gold">•</span>
                                        <span>逾期將無法補課或延期</span>
                                    </div>
                                </div>
                            </div>

                            {/* Leave Policy */}
                            <div className="bg-gradient-to-br from-gray-900/50 to-black/50 border border-gray-800 rounded-lg p-6">
                                <h3 className="text-xl font-light text-gold mb-3">請假與補課</h3>
                                <p className="text-gray-300 text-sm leading-relaxed mb-3">
                                    如需請假，請於上課前 24 小時告知，我們會協助您安排補課時間。
                                </p>
                                <div className="text-xs text-gray-400">
                                    <div className="flex items-start gap-2 mb-1">
                                        <span className="text-gold">•</span>
                                        <span>提前 24 小時通知可安排補課</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-orange-400">•</span>
                                        <span className="text-orange-300">未提前通知視為已使用該堂課</span>
                                    </div>
                                </div>
                            </div>

                            {/* Refund Policy */}
                            <div className="bg-gradient-to-br from-orange-900/20 to-black/50 border border-orange-800/30 rounded-lg p-6">
                                <div className="flex items-start gap-3 mb-3">
                                    <AlertCircle size={20} className="text-orange-400 flex-shrink-0 mt-1" />
                                    <h3 className="text-xl font-light text-orange-300">退費政策</h3>
                                </div>
                                <p className="text-orange-100/80 text-sm leading-relaxed">
                                    開課前 7 天可申請全額退費。開課後，已使用的課程不予退費，未使用的課程可依比例退費（需扣除 10% 行政手續費）。
                                </p>
                            </div>

                            {/* Formation Policy (if any package requires formation) */}
                            {instrument.levels.some((level) =>
                                level.packages.some((pkg) => pkg.formationRequired)
                            ) && (
                                    <div className="bg-gradient-to-br from-blue-900/20 to-black/50 border border-blue-800/30 rounded-lg p-6">
                                        <div className="flex items-start gap-3 mb-3">
                                            <AlertCircle size={20} className="text-blue-400 flex-shrink-0 mt-1" />
                                            <h3 className="text-xl font-light text-blue-300">成班政策</h3>
                                        </div>
                                        <p className="text-blue-100/80 text-sm leading-relaxed mb-2">
                                            部分課程需達到最低開班人數才會開課。我們會在開課前 3 天確認是否成班。
                                        </p>
                                        <div className="text-xs text-blue-200">
                                            <div className="flex items-start gap-2 mb-1">
                                                <span className="text-blue-400">•</span>
                                                <span>未達開班人數將主動聯繫並全額退費</span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <span className="text-blue-400">•</span>
                                                <span>或協助改報下一期課程</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                        </div>
                    </motion.section>

                    {/* FAQ Section */}
                    {instrument.faqs.length > 0 && (
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <FAQAccordion faqs={instrument.faqs} title={`${instrument.name}常見問題`} />
                        </motion.section>
                    )}
                </div>
            </div>
            <Footer />
        </FeedbackOverlay>
    );
}
