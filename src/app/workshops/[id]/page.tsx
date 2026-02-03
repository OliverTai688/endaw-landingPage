"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Calendar, MapPin, Users, Clock, User, AlertCircle, ChevronRight } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { CountdownTimer } from "@/components/shared/countdown-timer";
import { FAQAccordion } from "@/components/shared/faq-accordion";
import { workshops, workshopFAQs } from "@/data/workshops";
import FeedbackOverlay from "@/components/admin/FeedbackOverlay";

export default function WorkshopDetailPage() {
    const params = useParams();
    const workshop = workshops.find((w) => w.id === params.id);

    if (!workshop) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <p>工作坊不存在</p>
            </div>
        );
    }

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat("zh-TW", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
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
        <FeedbackOverlay pageName={`工作坊詳情: ${workshop.title}`}>
            <Navbar />
            <div className="min-h-screen bg-black text-white">
                {/* Hero Section */}
                <div className="relative h-[60vh] min-h-[500px]">
                    {/* Cover Image */}
                    <div className="absolute inset-0">
                        <Image
                            src={workshop.coverImage}
                            alt={workshop.title}
                            fill
                            crossOrigin="anonymous"
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
                    </div>

                    {/* Navigation Overlay */}
                    <div className="absolute top-24 left-6 z-20">
                        <Link
                            href="/workshops"
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-300 group"
                        >
                            <div className="w-8 h-8 rounded-full bg-black/50 border border-gray-800 flex items-center justify-center group-hover:bg-gold/10 group-hover:border-gold/30">
                                <ChevronRight size={16} className="rotate-180" />
                            </div>
                            <span className="text-sm font-light">返回所有工作坊</span>
                        </Link>
                    </div>

                    {/* Hero Content */}
                    <div className="relative container mx-auto px-6 h-full flex flex-col justify-end pb-12">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {workshop.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1 bg-gold/20 border border-gold/30 rounded text-sm text-gold backdrop-blur-sm"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <h1 className="text-4xl md:text-6xl font-light tracking-tight mb-4">
                                {workshop.title}
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-300 font-light mb-8">
                                {workshop.subtitle}
                            </p>

                            {/* Quick Info */}
                            <div className="flex flex-wrap gap-6 mb-6">
                                <div className="flex items-center gap-2 text-gray-300">
                                    <Calendar size={20} className="text-gold" />
                                    <span>{formatDate(workshop.schedule.date)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                    <Clock size={20} className="text-gold" />
                                    <span>
                                        {formatTime(workshop.schedule.date)} · {workshop.schedule.duration}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                    <Users size={20} className="text-gold" />
                                    <span>
                                        剩餘{" "}
                                        <span className={isAlmostFull ? "text-orange-400 font-medium" : "text-gold font-medium"}>
                                            {workshop.capacity.remaining}
                                        </span>{" "}
                                        / {workshop.capacity.total} 位
                                    </span>
                                </div>
                            </div>

                            {/* Countdown Timer */}
                            <div className="mb-6">
                                <CountdownTimer deadline={workshop.registrationDeadline} />
                            </div>

                            {/* CTA Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={isFull}
                                className={`
                  px-8 py-4 rounded-lg font-light text-lg transition-all duration-300
                  ${isFull
                                        ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                                        : "bg-gold text-black hover:bg-gold/90 hover:shadow-lg hover:shadow-gold/20"
                                    }
                `}
                            >
                                {isFull ? "已額滿" : "立即報名"}
                            </motion.button>
                        </motion.div>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="container mx-auto px-6 py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-16">
                            {/* Story Section */}
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="text-3xl font-light tracking-tight mb-6 flex items-center gap-3">
                                    <div className="w-1 h-8 bg-gold rounded" />
                                    工作坊介紹
                                </h2>
                                <div
                                    className="prose prose-invert prose-lg max-w-none"
                                    dangerouslySetInnerHTML={{ __html: workshop.description }}
                                />
                            </motion.section>

                            {/* Gallery */}
                            {workshop.galleryImages.length > 0 && (
                                <motion.section
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                >
                                    <h2 className="text-3xl font-light tracking-tight mb-6 flex items-center gap-3">
                                        <div className="w-1 h-8 bg-gold rounded" />
                                        活動花絮
                                    </h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        {workshop.galleryImages.map((image, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                whileInView={{ opacity: 1, scale: 1 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: 0.1 * index }}
                                                className="relative aspect-square rounded-lg overflow-hidden group"
                                            >
                                                <Image
                                                    src={image}
                                                    alt={`${workshop.title} - 圖片 ${index + 1}`}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.section>
                            )}

                            {/* Instructor Section */}
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="bg-gradient-to-br from-gray-900/50 to-black/50 border border-gray-800 rounded-lg p-8"
                            >
                                <h2 className="text-3xl font-light tracking-tight mb-6 flex items-center gap-3">
                                    <div className="w-1 h-8 bg-gold rounded" />
                                    講師介紹
                                </h2>
                                <div className="flex gap-6 items-start">
                                    <div className="relative w-24 h-24 rounded-full overflow-hidden flex-shrink-0 border-2 border-gold/30">
                                        <Image
                                            src={workshop.instructor.avatar}
                                            alt={workshop.instructor.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-light text-gold mb-2">
                                            {workshop.instructor.name}
                                        </h3>
                                        <p className="text-gray-300 leading-relaxed">
                                            {workshop.instructor.bio}
                                        </p>
                                    </div>
                                </div>
                            </motion.section>

                            {/* Policy Section */}
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="text-3xl font-light tracking-tight mb-6 flex items-center gap-3">
                                    <div className="w-1 h-8 bg-gold rounded" />
                                    上課須知與退費政策
                                </h2>
                                <div className="space-y-6">
                                    <div className="bg-gradient-to-br from-gray-900/50 to-black/50 border border-gray-800 rounded-lg p-6">
                                        <div
                                            className="prose prose-invert max-w-none"
                                            dangerouslySetInnerHTML={{ __html: workshop.policies.attendanceRules }}
                                        />
                                    </div>
                                    <div className="bg-gradient-to-br from-orange-900/20 to-black/50 border border-orange-800/30 rounded-lg p-6">
                                        <div className="flex items-start gap-3 mb-4">
                                            <AlertCircle size={20} className="text-orange-400 flex-shrink-0 mt-1" />
                                            <h3 className="text-xl font-light text-orange-300">退費規則</h3>
                                        </div>
                                        <div
                                            className="prose prose-invert max-w-none"
                                            dangerouslySetInnerHTML={{ __html: workshop.policies.refundPolicy }}
                                        />
                                    </div>
                                </div>
                            </motion.section>

                            {/* FAQ */}
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <FAQAccordion faqs={workshopFAQs} />
                            </motion.section>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-6">
                                {/* Details Card */}
                                <div className="bg-gradient-to-br from-gray-900 to-black border border-gold/30 rounded-lg p-6">
                                    <h3 className="text-2xl font-light mb-6">活動資訊</h3>

                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <Calendar size={20} className="text-gold mt-1 flex-shrink-0" />
                                            <div>
                                                <div className="text-sm text-gray-400 mb-1">日期時間</div>
                                                <div className="text-white">{formatDate(workshop.schedule.date)}</div>
                                                <div className="text-gold">
                                                    {formatTime(workshop.schedule.date)} · {workshop.schedule.duration}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="h-px bg-gradient-to-r from-gold/20 via-gold/50 to-gold/20" />

                                        <div className="flex items-start gap-3">
                                            <MapPin size={20} className="text-gold mt-1 flex-shrink-0" />
                                            <div>
                                                <div className="text-sm text-gray-400 mb-1">上課地點</div>
                                                <div className="text-white">{workshop.schedule.location}</div>
                                            </div>
                                        </div>

                                        <div className="h-px bg-gradient-to-r from-gold/20 via-gold/50 to-gold/20" />

                                        <div className="flex items-start gap-3">
                                            <Users size={20} className="text-gold mt-1 flex-shrink-0" />
                                            <div>
                                                <div className="text-sm text-gray-400 mb-1">名額</div>
                                                <div className="text-white">
                                                    剩餘{" "}
                                                    <span className={isAlmostFull ? "text-orange-400 font-medium" : "text-gold font-medium"}>
                                                        {workshop.capacity.remaining}
                                                    </span>{" "}
                                                    / {workshop.capacity.total} 位
                                                </div>
                                            </div>
                                        </div>

                                        <div className="h-px bg-gradient-to-r from-gold/20 via-gold/50 to-gold/20" />

                                        <div>
                                            <div className="text-sm text-gray-400 mb-2">費用</div>
                                            <div className="text-4xl font-light text-gold">
                                                NT$ {workshop.price.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        disabled={isFull}
                                        className={`
                      w-full mt-6 px-6 py-4 rounded-lg font-light text-lg transition-all duration-300
                      ${isFull
                                                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                                                : "bg-gold text-black hover:bg-gold/90 hover:shadow-lg hover:shadow-gold/20"
                                            }
                    `}
                                    >
                                        {isFull ? "已額滿" : "立即報名"}
                                    </motion.button>

                                    {isAlmostFull && !isFull && (
                                        <p className="text-xs text-orange-300 text-center mt-3">
                                            ⚠️ 名額即將額滿！
                                        </p>
                                    )}
                                </div>

                                {/* Contact Info */}
                                <div className="bg-gradient-to-br from-gray-900/50 to-black/50 border border-gray-800 rounded-lg p-6">
                                    <h3 className="text-lg font-light mb-4">有問題嗎？</h3>
                                    <p className="text-sm text-gray-400 mb-3">
                                        歡迎聯繫我們，我們很樂意為您解答
                                    </p>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400">Email:</span>
                                            <a href="mailto:info@citylab.com" className="text-gold hover:underline">
                                                info@citylab.com
                                            </a>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400">電話:</span>
                                            <a href="tel:+886223456789" className="text-gold hover:underline">
                                                (02) 2345-6789
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky CTA Bar (Mobile) */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-gray-800 p-4 z-50">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <div className="text-xs text-gray-400">費用</div>
                            <div className="text-2xl font-light text-gold">
                                NT$ {workshop.price.toLocaleString()}
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={isFull}
                            className={`
                px-8 py-3 rounded-lg font-light transition-all duration-300
                ${isFull
                                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                                    : "bg-gold text-black hover:bg-gold/90"
                                }
              `}
                        >
                            {isFull ? "已額滿" : "立即報名"}
                        </motion.button>
                    </div>
                </div>
            </div>
            <Footer />
        </FeedbackOverlay>
    );
}
