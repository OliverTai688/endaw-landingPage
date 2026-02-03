"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { FAQ } from "@/lib/types";

interface FAQAccordionProps {
    faqs: FAQ[];
    title?: string;
}

export function FAQAccordion({ faqs, title = "常見問題" }: FAQAccordionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    // Group FAQs by category if they have categories
    const groupedFAQs = faqs.reduce((acc, faq) => {
        const category = faq.category || "其他";
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(faq);
        return acc;
    }, {} as Record<string, FAQ[]>);

    const hasCategories = Object.keys(groupedFAQs).length > 1;

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Title */}
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-4xl font-light tracking-tight mb-8 text-center"
            >
                {title}
            </motion.h2>

            {/* Decorative line */}
            <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mb-12"
            />

            {/* FAQ Items */}
            <div className="space-y-3">
                {hasCategories ? (
                    // Render with categories
                    Object.entries(groupedFAQs).map(([category, categoryFAQs], categoryIndex) => (
                        <div key={category} className="mb-8">
                            <h3 className="text-lg font-light text-white mb-4">{category}</h3>
                            <div className="space-y-3">
                                {categoryFAQs.map((faq, faqIndex) => {
                                    const globalIndex = categoryIndex * 100 + faqIndex;
                                    return (
                                        <FAQItem
                                            key={globalIndex}
                                            faq={faq}
                                            index={globalIndex}
                                            isOpen={openIndex === globalIndex}
                                            onToggle={() =>
                                                setOpenIndex(openIndex === globalIndex ? null : globalIndex)
                                            }
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ))
                ) : (
                    // Render without categories
                    faqs.map((faq, index) => (
                        <FAQItem
                            key={index}
                            faq={faq}
                            index={index}
                            isOpen={openIndex === index}
                            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

interface FAQItemProps {
    faq: FAQ;
    index: number;
    isOpen: boolean;
    onToggle: () => void;
}

function FAQItem({ faq, index, isOpen, onToggle }: FAQItemProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.05 * (index % 10) }}
            className="group"
        >
            <div
                className={`
          border rounded-lg overflow-hidden transition-all duration-300
          ${isOpen ? "border-white/40 bg-gradient-to-br from-gray-900/50 to-black/50" : "border-gray-800 bg-gray-900/30"}
        `}
            >
                {/* Question */}
                <button
                    onClick={onToggle}
                    className="w-full px-6 py-4 flex items-center justify-between gap-4 text-left hover:bg-white/5 transition-colors duration-300"
                >
                    <span
                        className={`
              font-light transition-colors duration-300
              ${isOpen ? "text-white" : "text-white/60 group-hover:text-white/90"}
            `}
                    >
                        {faq.question}
                    </span>
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex-shrink-0"
                    >
                        <ChevronDown
                            size={20}
                            className={`transition-colors duration-300 ${isOpen ? "text-white" : "text-gray-400"}`}
                        />
                    </motion.div>
                </button>

                {/* Answer */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="px-6 pb-4 pt-2">
                                <div className="h-px bg-gradient-to-r from-white/10 via-white/30 to-white/10 mb-4" />
                                <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                                    {faq.answer}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
