"use client";

import { motion } from "framer-motion";
import { Music } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { InstrumentCard } from "@/components/music/instrument-card";
import { FAQAccordion } from "@/components/shared/faq-accordion";
import { instruments, musicCommonFAQs, monthlyAnnouncements } from "@/data/music";
import FeedbackOverlay from "@/components/admin/FeedbackOverlay";

import { useEffect, useState } from "react";
import { useContent } from "@/components/providers/ContentProvider";
import { ContentType, ContentEntity, PublishStatus } from "@/domain/models/Content";

export default function MusicPage() {
    const { refreshContent } = useContent();
    const [displayInstruments, setDisplayInstruments] = useState<any[]>(instruments);
    const [isPreviewMode, setIsPreviewMode] = useState(false);

    const currentMonth = "2026-03";
    const currentAnnouncement = monthlyAnnouncements.find(
        (a) => a.month === currentMonth
    );

    useEffect(() => {
        const checkPreview = () => {
            const cookies = document.cookie.split('; ');
            const authCookie = cookies.find(row => row.startsWith('internal_access='));
            const urlParams = new URLSearchParams(window.location.search);
            const hasPreviewParam = urlParams.get('preview') === 'true';

            if ((authCookie && authCookie.split('=')[1] === 'true') || hasPreviewParam) {
                setIsPreviewMode(true);
                return true;
            }
            return false;
        };

        async function load() {
            const showAll = checkPreview();
            const dynamicItems = await refreshContent(ContentType.MUSIC);

            const filteredItems = dynamicItems
                .filter(item => showAll || item.publishStatus === PublishStatus.PUBLISHED)
                .map(item => ({
                    id: item.id,
                    name: item.title,
                    nameEn: item.metadata?.nameEn || item.id,
                    description: item.description,
                    coverImage: item.coverImage,
                    price: item.price,
                    containsEquipment: item.metadata?.containsEquipment || false,
                    equipmentDescription: item.metadata?.equipmentDescription || "",
                    rentalAvailable: item.metadata?.rentalAvailable || false,
                    rentalOffsetAllowed: item.metadata?.rentalOffsetAllowed || false,
                    // Robust mapping for InstrumentCard
                    levels: item.metadata?.levels || [
                        {
                            id: `${item.id}-beginner`,
                            name: "基礎課程",
                            packages: [{ id: `${item.id}-pkg`, name: "入門套票", price: item.price, lessonCount: 4 }]
                        }
                    ],
                    faqs: item.metadata?.faqs || []
                }));

            if (filteredItems.length > 0) {
                setDisplayInstruments([...filteredItems, ...instruments]);
            }
        }
        load();
    }, [refreshContent]);

    return (
        <FeedbackOverlay pageName="樂器訓練所">
            {isPreviewMode && (
                <div className="fixed top-0 left-0 right-0 z-[100] bg-blue-500/90 text-white text-[10px] uppercase tracking-[0.2em] font-bold py-1 text-center backdrop-blur-md shadow-lg">
                    Preview Mode Active &bull; Showing Drafts and Published Content
                </div>
            )}
            <Navbar />
            <div className="min-h-screen bg-black text-white relative overflow-hidden">
                {/* ... background and header ... */}
                <div className="fixed inset-0 opacity-30">
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
                </div>

                {/* Grain texture */}
                <div
                    className="fixed inset-0 opacity-[0.02] pointer-events-none"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    }}
                />

                <div className="relative container mx-auto px-6 py-24">
                    {/* Page Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-20"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/10 border border-gold/20 mb-6"
                        >
                            <Music className="text-gold" size={20} />
                        </motion.div>

                        <h1 className="text-5xl md:text-6xl font-light tracking-tight mb-4">
                            樂器訓練所
                        </h1>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            系統化套票課程，三個月內完成學習目標
                        </p>

                        {/* Decorative line */}
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                            className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent mt-12"
                        />
                    </motion.div>

                    {/* Monthly Announcement Banner ... */}
                    {currentAnnouncement && currentAnnouncement.announcements.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="mb-16 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-blue-900/20 border border-blue-800/30 rounded-lg p-6"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                                    <Music size={20} className="text-blue-300" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-light text-blue-200 mb-2">
                                        {currentMonth.replace("-", "年")}月課程公告
                                    </h3>
                                    <ul className="space-y-1">
                                        {currentAnnouncement.announcements.map((announcement, idx) => (
                                            <li key={idx} className="text-sm text-blue-100/80 flex items-start gap-2">
                                                <span className="text-blue-400 mt-1">•</span>
                                                <span>{announcement}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Instruments Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
                        {displayInstruments.map((instrument, index) => (
                            <InstrumentCard key={instrument.id} instrument={instrument} index={index} />
                        ))}
                    </div>

                    {/* Policy Highlight Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-20"
                    >
                        <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-8 text-center">
                            課程政策重點
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gradient-to-br from-gray-900/50 to-black/50 border border-gray-800 rounded-lg p-6">
                                <div className="text-gold text-2xl font-light mb-3">3 個月</div>
                                <h3 className="text-lg font-light mb-2">有效期限</h3>
                                <p className="text-sm text-gray-400">
                                    所有課程套票自首堂課起算，須於三個月內使用完畢
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-gray-900/50 to-black/50 border border-gray-800 rounded-lg p-6">
                                <div className="text-gold text-2xl font-light mb-3">24 小時</div>
                                <h3 className="text-lg font-light mb-2">請假通知</h3>
                                <p className="text-sm text-gray-400">
                                    請於上課前 24 小時告知，我們會協助您安排補課
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-gray-900/50 to-black/50 border border-gray-800 rounded-lg p-6">
                                <div className="text-gold text-2xl font-light mb-3">100%</div>
                                <h3 className="text-lg font-light mb-2">成班保證</h3>
                                <p className="text-sm text-gray-400">
                                    需成班課程如未達人數，開課前通知並全額退費
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* FAQ Section */}
                    <div className="mb-20">
                        <FAQAccordion faqs={musicCommonFAQs} title="音樂課程常見問題" />
                    </div>

                    {/* Bottom decorative section */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-center py-12"
                    >
                        <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent mb-8" />
                        <p className="text-gray-500 text-sm font-light">
                            開始你的音樂旅程，用心學習每一個音符
                        </p>
                    </motion.div>
                </div>
            </div>
            <Footer />
        </FeedbackOverlay>
    );
}
