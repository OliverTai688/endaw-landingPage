"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, AlertTriangle, CalendarDays } from "lucide-react";
import type { Package, Level } from "@/lib/types";

interface PackageSelectorProps {
    levels: Level[];
    onSelectPackage?: (pkg: Package) => void;
}

function getRecommendedPackageId(levels: Level[]): string | null {
    const all = levels.flatMap((l) => l.packages.filter((p) => p.status === "published"));
    if (all.length === 0) return null;

    const bonus = all.filter((p) => p.bonusLessons > 0);
    if (bonus.length > 0) {
        return bonus.reduce((best, p) => {
            const bPPL = best.price / (best.lessonCount + best.bonusLessons);
            const pPPL = p.price / (p.lessonCount + p.bonusLessons);
            return pPPL < bPPL ? p : best;
        }).id;
    }

    if (all.length <= 2) return all[all.length - 1].id;
    return all[Math.floor(all.length / 2)].id;
}

export function PackageSelector({ levels, onSelectPackage }: PackageSelectorProps) {
    const [selectedLevelId, setSelectedLevelId] = useState(levels[0]?.id || "");
    const recommendedId = getRecommendedPackageId(levels);

    useEffect(() => {
        if (levels.length > 0 && !levels.find((l) => l.id === selectedLevelId)) {
            setSelectedLevelId(levels[0].id);
        }
    }, [levels, selectedLevelId]);

    const selectedLevel = levels.find((l) => l.id === selectedLevelId);

    return (
        <div className="w-full">
            {levels.length > 1 && (
                <div className="mb-10">
                    <p className="text-sm text-gray-500 mb-3">選擇程度</p>
                    <div className="flex flex-wrap gap-3">
                        {levels.map((level) => (
                            <button
                                key={level.id}
                                onClick={() => setSelectedLevelId(level.id)}
                                className={`px-8 py-2.5 rounded-lg border text-sm font-medium transition-all duration-300
                                    ${selectedLevelId === level.id
                                        ? "bg-white/10 text-white border-white"
                                        : "bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600"
                                    }`}
                            >
                                {level.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {selectedLevel && (
                <div className={`grid grid-cols-1 gap-6 ${selectedLevel.packages.length === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"}`}>
                    {selectedLevel.packages.map((pkg, i) => (
                        <PackageCard
                            key={pkg.id}
                            package={pkg}
                            index={i}
                            isRecommended={pkg.id === recommendedId}
                            onSelect={onSelectPackage}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

interface PackageCardProps {
    package: Package;
    index: number;
    isRecommended: boolean;
    onSelect?: (pkg: Package) => void;
}

function PackageCard({ package: pkg, index, isRecommended, onSelect }: PackageCardProps) {
    const total = pkg.lessonCount + pkg.bonusLessons;
    const hasBonus = pkg.bonusLessons > 0;
    const perLesson = Math.round(pkg.price / total);

    const formatDate = (d: Date) =>
        new Intl.DateTimeFormat("zh-TW", {
            month: "long",
            day: "numeric",
            weekday: "short",
        }).format(d);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className={`relative rounded-2xl flex flex-col transition-all duration-300
                ${isRecommended
                    ? "bg-gradient-to-br from-[#1a1500] via-black to-[#0d0d00] border-2 border-gold/70 shadow-[0_0_40px_rgba(212,175,55,0.12)] md:scale-[1.03]"
                    : "bg-gradient-to-br from-gray-900 to-black border border-gray-800 hover:border-white/30"
                }`}
        >
            {isRecommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold text-black text-xs font-bold px-5 py-1.5 rounded-full whitespace-nowrap shadow-lg tracking-wide">
                    最多人選擇
                </div>
            )}

            {hasBonus && !isRecommended && (
                <div className="absolute -top-3 right-4 bg-white text-black text-xs font-bold px-3 py-1 rounded-full shadow">
                    買{pkg.lessonCount}送{pkg.bonusLessons}
                </div>
            )}

            {pkg.formationRequired && !isRecommended && (
                <div className="absolute -top-3 left-4 bg-zinc-700 text-white text-xs px-3 py-1 rounded-full">
                    需成班
                </div>
            )}

            <div className="p-7 flex flex-col flex-1">
                {/* Name */}
                <h4 className={`text-lg font-semibold mb-1 ${isRecommended ? "text-gold" : "text-white"}`}>
                    {pkg.name}
                </h4>

                {/* Lesson count */}
                <div className="mb-4">
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-5xl font-extralight text-white">{total}</span>
                        <span className="text-xl text-gray-400 font-light">堂</span>
                    </div>
                    {hasBonus && (
                        <p className="text-xs text-gold/60 mt-1">
                            實付 {pkg.lessonCount} 堂 + 贈 {pkg.bonusLessons} 堂
                        </p>
                    )}
                </div>

                {/* Divider */}
                <div className={`h-px mb-5 ${isRecommended ? "bg-gold/25" : "bg-white/8"}`} />

                {/* Highlights */}
                {pkg.highlights && pkg.highlights.length > 0 && (
                    <div className="mb-5 space-y-2 flex-1">
                        {pkg.highlights.map((h, i) => (
                            <div key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                                <Check
                                    size={14}
                                    className={`mt-0.5 flex-shrink-0 ${isRecommended ? "text-gold" : "text-white/50"}`}
                                />
                                <span>{h}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Meta info */}
                <div className="space-y-2.5 mb-5 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500">有效期限</span>
                        <span className="text-gray-300">{pkg.validDuration} 個月</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 flex items-center gap-1.5">
                            <CalendarDays size={13} />
                            下期開課
                        </span>
                        <span className={`font-medium ${isRecommended ? "text-gold" : "text-white"}`}>
                            {formatDate(pkg.firstClassDate)}
                        </span>
                    </div>
                </div>

                {/* Formation warning */}
                {pkg.formationRequired && (
                    <div className="mb-4 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 flex items-center gap-2">
                        <AlertTriangle size={12} className="flex-shrink-0" />
                        開課前 {pkg.formationDecisionDays} 天確認是否成班
                    </div>
                )}

                {/* Equipment */}
                {pkg.includedEquipment && pkg.includedEquipment.length > 0 && (
                    <div className="mb-4 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300">
                        <span className="text-gray-500">含器材：</span>
                        {pkg.includedEquipment.join("、")}
                    </div>
                )}

                {/* Price */}
                <div className={`pt-4 mb-5 border-t ${isRecommended ? "border-gold/20" : "border-white/8"}`}>
                    <div className="text-4xl font-light text-white">
                        NT$ {pkg.price.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        每堂約 NT$ {perLesson.toLocaleString()}
                    </div>
                </div>

                {/* CTA */}
                <motion.button
                    onClick={() => onSelect?.(pkg)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-4 rounded-xl font-bold text-sm tracking-widest transition-all duration-300
                        ${isRecommended
                            ? "bg-gold text-black hover:bg-yellow-400 shadow-[0_4px_20px_rgba(212,175,55,0.35)]"
                            : "bg-transparent border border-white/30 text-white hover:bg-white/8 hover:border-white/60"
                        }`}
                >
                    立即報名
                </motion.button>
            </div>
        </motion.div>
    );
}
