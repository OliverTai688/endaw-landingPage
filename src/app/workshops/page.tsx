"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Navbar from "@/components/navbar";
import { WorkshopCard } from "@/components/workshops/workshop-card";
import { FAQAccordion } from "@/components/shared/faq-accordion";
import { workshops, workshopFAQs } from "@/data/workshops";
import Footer from "@/components/footer";
import FeedbackOverlay from "@/components/admin/FeedbackOverlay";

export default function WorkshopsPage() {
    return (
        <FeedbackOverlay pageName="城市實驗室工作坊">
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
                        {workshops.map((workshop, index) => (
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
