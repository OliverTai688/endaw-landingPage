"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Navbar from "@/components/navbar";
import { WorkshopCard } from "@/components/workshops/workshop-card";
import { FAQAccordion } from "@/components/shared/faq-accordion";
import { workshops, workshopFAQs } from "@/data/workshops";
import Footer from "@/components/footer";
import FeedbackOverlay from "@/components/admin/FeedbackOverlay";

import { useEffect, useState } from "react";
import { useContent } from "@/components/providers/ContentProvider";
import { ContentType, ContentEntity, PublishStatus } from "@/domain/models/Content";

export default function WorkshopsPage() {
    const { refreshContent, isLoading } = useContent();
    const [displayWorkshops, setDisplayWorkshops] = useState<any[]>(workshops);
    const [isPreviewMode, setIsPreviewMode] = useState(false);

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
            const dynamicItems = await refreshContent(ContentType.WORKSHOP);

            const filteredItems = dynamicItems
                .filter(item => showAll || item.publishStatus === PublishStatus.PUBLISHED)
                .map(item => ({
                    id: item.id,
                    title: item.title,
                    subtitle: item.subtitle || "新推出的工作坊",
                    description: item.description,
                    coverImage: item.coverImage,
                    price: item.price,
                    tags: item.tags || ["新活動"],
                    // Robust mapping for nested structures required by WorkshopCard
                    schedule: item.metadata?.schedule || {
                        date: item.createdAt || new Date(),
                        location: item.metadata?.location || "城市實驗室",
                        duration: item.metadata?.duration || "2 小時"
                    },
                    capacity: item.metadata?.capacity || {
                        total: 20,
                        remaining: 20
                    },
                    instructor: item.metadata?.instructor || {
                        name: "資深講師",
                        bio: "專業音樂、藝術教育工作者",
                        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400"
                    }
                }));

            if (filteredItems.length > 0) {
                setDisplayWorkshops([...filteredItems, ...workshops]);
            }
        }
        load();
    }, [refreshContent]);

    return (
        <FeedbackOverlay pageName="城市實驗室工作坊">
            {isPreviewMode && (
                <div className="fixed top-0 left-0 right-0 z-[100] bg-orange-500/90 text-white text-[10px] uppercase tracking-[0.2em] font-bold py-1 text-center backdrop-blur-md">
                    Preview Mode Active &bull; Showing Drafts and Published Content
                </div>
            )}
            <Navbar />
            <div className="min-h-screen bg-black text-white relative overflow-hidden">
                {/* Background effects */}
                <div className="fixed inset-0 opacity-30">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
                </div>

                {/* Grain texture */}
                <div
                    className="fixed inset-0 opacity-[0.02] pointer-events-none"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    }}
                />

                <div className="relative container mx-auto px-6 py-24">
                    {/* ... page header remains same ... */}
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
                            <Sparkles className="text-gold" size={20} />
                        </motion.div>

                        <h1 className="text-5xl md:text-6xl font-light tracking-tight mb-4">
                            城市實驗室工作坊
                        </h1>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            探索音樂的無限可能，體驗創作的純粹樂趣
                        </p>

                        {/* Decorative line */}
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                            className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent mt-12"
                        />
                    </motion.div>

                    {/* Workshop Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
                        {displayWorkshops.map((workshop, index) => (
                            <WorkshopCard key={workshop.id} workshop={workshop} index={index} />
                        ))}
                    </div>

                    {/* FAQ Section */}
                    <div className="mb-20">
                        <FAQAccordion faqs={workshopFAQs} />
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
                            每場工作坊都是獨特的音樂體驗，期待與你相遇
                        </p>
                    </motion.div>
                </div>
            </div>
            <Footer />
        </FeedbackOverlay>
    );
}
