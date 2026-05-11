"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    Package, Calendar, AlertCircle, Info, ChevronRight,
    Music2, Clock, ShieldCheck, ArrowDown,
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { PackageSelector } from "@/components/music/package-selector";
import { FAQAccordion } from "@/components/shared/faq-accordion";
import FeedbackOverlay from "@/components/admin/FeedbackOverlay";
import type { Package as PackageType, Instrument, MonthlyAnnouncement } from "@/lib/types";
import { useState, useEffect, useRef } from "react";

function mapDbInstrument(data: any): Instrument {
    return {
        id: data.id,
        name: data.name,
        nameEn: data.nameEn,
        coverImage: data.coverImage,
        description: data.description,
        containsEquipment: data.containsEquipment,
        equipmentDescription: data.equipmentDescription || undefined,
        rentalAvailable: data.rentalAvailable,
        rentalOffsetAllowed: data.rentalOffsetAllowed,
        levels: (data.levels || []).map((level: any) => ({
            id: level.id,
            name: level.name,
            packages: (level.packages || []).map((pkg: any) => ({
                id: pkg.id,
                name: pkg.name,
                lessonCount: pkg.lessonCount,
                bonusLessons: pkg.bonusLessons,
                validDuration: pkg.validDuration,
                firstClassDate: pkg.firstClassDate ? new Date(pkg.firstClassDate) : new Date(),
                registrationStartDates: (pkg.registrationStartDates || []).map((d: string) => new Date(d)),
                formationRequired: pkg.formationRequired,
                formationDecisionDays: pkg.formationDecisionDays,
                refundPolicy: pkg.refundPolicy,
                price: pkg.price,
                status: pkg.status === "PUBLISHED" ? "published" as const : "draft" as const,
                includedEquipment: pkg.includedEquipment || [],
                highlights: pkg.highlights || [],
            })),
        })),
        faqs: (data.faqs || []).map((faq: any) => ({
            question: faq.question,
            answer: faq.answer,
        })),
    };
}

function mapDbAnnouncement(data: any): MonthlyAnnouncement {
    return {
        id: data.id,
        month: data.month,
        instruments: data.instrumentIds || [],
        schedule: (data.schedule || []).map((s: any) => ({
            date: new Date(s.date),
            time: s.time,
            instructor: s.instructor,
            type: s.type,
        })),
        announcements: data.announcements || [],
    };
}

export default function InstrumentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [instrument, setInstrument] = useState<Instrument | null>(null);
    const [currentAnnouncement, setCurrentAnnouncement] = useState<MonthlyAnnouncement | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showStickyCTA, setShowStickyCTA] = useState(false);

    const packagesRef = useRef<HTMLDivElement>(null);
    const currentMonth = "2026-03";

    useEffect(() => {
        if (!params.instrument) return;
        Promise.all([
            fetch(`/api/bff/v1/music?nameEn=${params.instrument}`).then((r) => r.json()),
            fetch(`/api/bff/v1/music?type=announcements&month=${currentMonth}`).then((r) => r.json()),
        ])
            .then(([instrumentJson, announcementJson]) => {
                if (instrumentJson.success && instrumentJson.data) {
                    setInstrument(mapDbInstrument(instrumentJson.data));
                }
                if (announcementJson.success && announcementJson.data) {
                    const ann = mapDbAnnouncement(announcementJson.data);
                    if (ann.instruments.includes(params.instrument as string)) {
                        setCurrentAnnouncement(ann);
                    }
                }
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [params.instrument]);

    useEffect(() => {
        if (!packagesRef.current) return;
        const obs = new IntersectionObserver(
            ([entry]) => setShowStickyCTA(!entry.isIntersecting),
            { rootMargin: "0px 0px -80px 0px" }
        );
        obs.observe(packagesRef.current);
        return () => obs.disconnect();
    }, [instrument]);

    if (isLoading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-black text-white flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                </div>
            </>
        );
    }

    if (!instrument) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <p>樂器課程不存在</p>
            </div>
        );
    }

    const minPrice = Math.min(
        ...instrument.levels.flatMap((l) => l.packages.map((p) => p.price))
    );

    const handleSelectPackage = (pkg: PackageType) => {
        router.push(`/music/${params.instrument}/checkout?packageId=${pkg.id}`);
    };

    const scrollToPackages = () => {
        packagesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <FeedbackOverlay pageName={`樂器課程詳情: ${instrument.name}`}>
            <Navbar />
            <div className="min-h-screen bg-black text-white">

                {/* ── Hero ── */}
                <div className="relative h-[55vh] min-h-[420px]">
                    <div className="absolute inset-0">
                        <Image
                            src={instrument.coverImage}
                            alt={instrument.name}
                            fill
                            crossOrigin="anonymous"
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-black/30" />
                    </div>

                    <div className="absolute top-24 left-6 z-20">
                        <Link
                            href="/music"
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                        >
                            <div className="w-8 h-8 rounded-full bg-black/50 border border-gray-800 flex items-center justify-center group-hover:bg-gold/10 group-hover:border-gold/30">
                                <ChevronRight size={16} className="rotate-180" />
                            </div>
                            <span className="text-sm font-light">返回所有樂器課程</span>
                        </Link>
                    </div>

                    <div className="relative container mx-auto px-6 h-full flex flex-col justify-end pb-10">
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {instrument.rentalAvailable && (
                                    <span className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded text-sm text-blue-200 backdrop-blur-sm">可租借</span>
                                )}
                                {instrument.containsEquipment && (
                                    <span className="px-3 py-1 bg-green-500/20 border border-green-400/30 rounded text-sm text-green-200 backdrop-blur-sm">含器材</span>
                                )}
                            </div>

                            <h1 className="text-5xl md:text-6xl font-light tracking-tight mb-4">
                                {instrument.name}
                            </h1>
                            <p className="text-lg text-gray-300 max-w-2xl mb-6">
                                {instrument.description.replace(/<[^>]*>/g, "").substring(0, 120)}…
                            </p>

                            {/* Hero CTA */}
                            <button
                                onClick={scrollToPackages}
                                className="inline-flex items-center gap-2 bg-gold text-black font-bold px-7 py-3.5 rounded-xl hover:bg-yellow-400 transition-colors shadow-[0_4px_20px_rgba(212,175,55,0.4)]"
                            >
                                查看課程方案
                                <ArrowDown size={16} />
                            </button>
                        </motion.div>
                    </div>
                </div>

                {/* ── Quick Benefits Strip ── */}
                <div className="border-y border-white/6 bg-white/2">
                    <div className="container mx-auto px-6 py-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                                    <Music2 size={18} className="text-gold" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">適合各程度</p>
                                    <p className="text-xs text-gray-500">零基礎到進階全覆蓋</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                                    <Clock size={18} className="text-gold" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">彈性補課安排</p>
                                    <p className="text-xs text-gray-500">提前 24 小時通知即可補課</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                                    <ShieldCheck size={18} className="text-gold" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">開課前 7 天全額退款</p>
                                    <p className="text-xs text-gray-500">報名無後顧之憂</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Main Content ── */}
                <div className="container mx-auto px-6 py-16">

                    {/* ── Package Selection (TOP PRIORITY) ── */}
                    <motion.section
                        ref={packagesRef}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-20"
                    >
                        <div className="mb-10">
                            <h2 className="text-3xl font-light tracking-tight mb-2 flex items-center gap-3">
                                <div className="w-1 h-8 bg-gold rounded" />
                                選擇課程方案
                            </h2>
                            <p className="text-gray-500 text-sm ml-4">
                                從 NT$ {minPrice.toLocaleString()} 起 · 三個月有效期
                            </p>
                        </div>
                        <PackageSelector levels={instrument.levels} onSelectPackage={handleSelectPackage} />
                    </motion.section>

                    {/* ── Monthly Announcement ── */}
                    {currentAnnouncement && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mb-16 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-blue-900/20 border border-blue-800/30 rounded-xl p-6"
                        >
                            <div className="flex items-start gap-4">
                                <Calendar size={22} className="text-blue-300 flex-shrink-0 mt-1" />
                                <div className="w-full">
                                    <h3 className="text-lg font-light text-blue-200 mb-4">
                                        {currentMonth.replace("-", "年")}月課程時間表
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {currentAnnouncement.schedule
                                            .filter((s) => s.type.includes(instrument.name))
                                            .map((schedule, idx) => (
                                                <div key={idx} className="flex items-center gap-3 text-sm text-blue-100/80 bg-blue-900/10 rounded px-3 py-2">
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
                                                {currentAnnouncement.announcements.map((a, idx) => (
                                                    <li key={idx} className="text-sm text-blue-100/80 flex items-start gap-2">
                                                        <span className="text-blue-400 mt-1">•</span>
                                                        <span>{a}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ── Course Description ── */}
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

                    {/* ── Equipment Info ── */}
                    {instrument.containsEquipment && instrument.equipmentDescription && (
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mb-16"
                        >
                            <div className="bg-gradient-to-br from-green-900/20 to-black/50 border border-green-800/30 rounded-xl p-6">
                                <div className="flex items-start gap-3 mb-3">
                                    <Package size={22} className="text-green-400 flex-shrink-0" />
                                    <h3 className="text-xl font-light text-green-200">器材包含</h3>
                                </div>
                                <p className="text-green-100/80 leading-relaxed">{instrument.equipmentDescription}</p>
                            </div>
                        </motion.section>
                    )}

                    {/* ── Rental Info ── */}
                    {instrument.rentalAvailable && (
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mb-16"
                        >
                            <div className="bg-gradient-to-br from-blue-900/20 to-black/50 border border-blue-800/30 rounded-xl p-6">
                                <div className="flex items-start gap-3 mb-3">
                                    <Info size={22} className="text-blue-400 flex-shrink-0" />
                                    <h3 className="text-xl font-light text-blue-200">樂器租借</h3>
                                </div>
                                <p className="text-blue-100/80 leading-relaxed mb-2">
                                    我們提供{instrument.name}租借服務，讓您在確定學習意願前無需立即購買樂器。
                                </p>
                                {instrument.rentalOffsetAllowed && (
                                    <p className="text-blue-300 text-sm">租借費用可折抵購買樂器費用（限租借期間內）</p>
                                )}
                            </div>
                        </motion.section>
                    )}

                    {/* ── Policy Section ── */}
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="bg-gradient-to-br from-gray-900/50 to-black/50 border border-gray-800 rounded-xl p-6">
                                <h3 className="text-lg font-medium text-gold mb-3">有效期限政策</h3>
                                <p className="text-gray-300 text-sm leading-relaxed mb-3">
                                    所有課程套票自首堂課日期起算，須於三個月內使用完畢。
                                </p>
                                <div className="text-xs text-gray-400 space-y-1">
                                    <div className="flex items-start gap-2"><span className="text-gold">•</span><span>有效期限內可彈性安排上課時間</span></div>
                                    <div className="flex items-start gap-2"><span className="text-gold">•</span><span>逾期將無法補課或延期</span></div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-gray-900/50 to-black/50 border border-gray-800 rounded-xl p-6">
                                <h3 className="text-lg font-medium text-gold mb-3">請假與補課</h3>
                                <p className="text-gray-300 text-sm leading-relaxed mb-3">
                                    如需請假，請於上課前 24 小時告知，我們會協助安排補課時間。
                                </p>
                                <div className="text-xs text-gray-400 space-y-1">
                                    <div className="flex items-start gap-2"><span className="text-gold">•</span><span>提前 24 小時通知可安排補課</span></div>
                                    <div className="flex items-start gap-2"><span className="text-orange-400">•</span><span className="text-orange-300">未提前通知視為已使用該堂課</span></div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-orange-900/20 to-black/50 border border-orange-800/30 rounded-xl p-6">
                                <div className="flex items-start gap-3 mb-3">
                                    <AlertCircle size={18} className="text-orange-400 flex-shrink-0 mt-0.5" />
                                    <h3 className="text-lg font-medium text-orange-300">退費政策</h3>
                                </div>
                                <p className="text-orange-100/80 text-sm leading-relaxed">
                                    開課前 7 天可申請全額退費。開課後已使用課程不予退費，未使用部分可依比例退費（需扣除 10% 行政手續費）。
                                </p>
                            </div>

                            {instrument.levels.some((l) => l.packages.some((p) => p.formationRequired)) && (
                                <div className="bg-gradient-to-br from-blue-900/20 to-black/50 border border-blue-800/30 rounded-xl p-6">
                                    <div className="flex items-start gap-3 mb-3">
                                        <AlertCircle size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
                                        <h3 className="text-lg font-medium text-blue-300">成班政策</h3>
                                    </div>
                                    <p className="text-blue-100/80 text-sm leading-relaxed mb-2">
                                        部分課程需達到最低開班人數才會開課，開課前 3 天確認是否成班。
                                    </p>
                                    <div className="text-xs text-blue-200 space-y-1">
                                        <div className="flex items-start gap-2"><span className="text-blue-400">•</span><span>未達開班人數將主動聯繫並全額退費</span></div>
                                        <div className="flex items-start gap-2"><span className="text-blue-400">•</span><span>或協助改報下一期課程</span></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.section>

                    {/* ── FAQ ── */}
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

            {/* ── Sticky CTA Bar ── */}
            <AnimatePresence>
                {showStickyCTA && (
                    <motion.div
                        initial={{ y: 80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 80, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 border-t border-white/10 backdrop-blur-md"
                    >
                        <div className="container mx-auto px-6 py-4 flex items-center justify-between gap-4">
                            <div className="min-w-0">
                                <p className="text-sm text-gray-400 truncate">{instrument.name}</p>
                                <p className="text-xl font-light text-white">
                                    NT$ {minPrice.toLocaleString()}{" "}
                                    <span className="text-sm text-gray-500 font-normal">起</span>
                                </p>
                            </div>
                            <button
                                onClick={scrollToPackages}
                                className="flex-shrink-0 bg-gold text-black font-bold px-8 py-3 rounded-xl hover:bg-yellow-400 transition-colors shadow-[0_4px_20px_rgba(212,175,55,0.4)] text-sm tracking-wide"
                            >
                                立即報名
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </FeedbackOverlay>
    );
}
