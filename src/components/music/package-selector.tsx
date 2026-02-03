"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, AlertTriangle } from "lucide-react";
import type { Package, Level } from "@/lib/types";

interface PackageSelectorProps {
    levels: Level[];
    onSelectPackage?: (pkg: Package) => void;
}

export function PackageSelector({ levels, onSelectPackage }: PackageSelectorProps) {
    const [selectedLevelId, setSelectedLevelId] = useState(levels[0]?.id || "");

    // Sync selectedLevelId if levels change
    useEffect(() => {
        if (levels.length > 0 && !levels.find(l => l.id === selectedLevelId)) {
            setSelectedLevelId(levels[0].id);
        }
    }, [levels, selectedLevelId]);

    const selectedLevel = levels.find((level) => level.id === selectedLevelId);

    return (
        <div className="w-full">
            {/* Level Selector */}
            {levels.length > 1 && (
                <div className="mb-8">
                    <h3 className="text-lg font-light text-gray-300 mb-4">選擇程度</h3>
                    <div className="flex flex-wrap gap-3">
                        {levels.map((level) => (
                            <button
                                key={level.id}
                                onClick={() => setSelectedLevelId(level.id)}
                                className={`
                  px-8 py-3 rounded-lg border transition-all duration-300 text-base font-medium
                  ${selectedLevelId === level.id
                                        ? "bg-gold text-black border-gold shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                                        : "bg-transparent text-white border-gray-700 hover:border-gold/40"
                                    }
                `}
                            >
                                {level.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Package Grid */}
            {selectedLevel && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {selectedLevel.packages.map((pkg, index) => (
                        <PackageCard
                            key={pkg.id}
                            package={pkg}
                            index={index}
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
    onSelect?: (pkg: Package) => void;
}

function PackageCard({ package: pkg, index, onSelect }: PackageCardProps) {
    const totalLessons = pkg.lessonCount + pkg.bonusLessons;
    const hasBonus = pkg.bonusLessons > 0;

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat("zh-TW", {
            month: "long",
            day: "numeric",
            weekday: "short",
        }).format(date);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className="relative bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6 hover:border-gold/40 transition-all duration-300 group"
        >
            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-gold/20 rounded-tl-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-gold/20 rounded-br-lg" />

            {/* Bonus Badge */}
            {hasBonus && (
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs px-3 py-1 rounded-full border-2 border-black font-medium shadow-lg">
                    買{pkg.lessonCount}送{pkg.bonusLessons}
                </div>
            )}

            {/* Formation Required Badge */}
            {pkg.formationRequired && (
                <div className="absolute -top-3 -left-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-3 py-1 rounded-full border-2 border-black font-medium shadow-lg">
                    需成班
                </div>
            )}

            {/* Package Name */}
            <h4 className="text-xl font-light mb-4 group-hover:text-gold transition-colors duration-300">
                {pkg.name}
            </h4>

            {/* Lesson Count */}
            <div className="mb-4">
                <div className="text-3xl font-light text-gold mb-1">
                    {totalLessons} <span className="text-lg text-gray-400">堂</span>
                </div>
                {hasBonus && (
                    <div className="text-xs text-orange-300">
                        實付 {pkg.lessonCount} 堂 + 贈 {pkg.bonusLessons} 堂
                    </div>
                )}
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-gold/20 via-gold/50 to-gold/20 mb-4" />

            {/* Highlights */}
            {pkg.highlights && pkg.highlights.length > 0 && (
                <div className="mb-4 space-y-2">
                    {pkg.highlights.map((highlight, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                            <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                            <span>{highlight}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Key Info */}
            <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between text-gray-400">
                    <span>有效期限</span>
                    <span className="text-white">{pkg.validDuration} 個月</span>
                </div>
                <div className="flex justify-between text-gray-400">
                    <span>首堂時間</span>
                    <span className="text-white">{formatDate(pkg.firstClassDate)}</span>
                </div>
            </div>

            {/* Formation Warning */}
            {pkg.formationRequired && (
                <div className="mb-4 p-3 bg-blue-900/20 border border-blue-800/30 rounded text-xs text-blue-200 flex items-start gap-2">
                    <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                    <span>
                        開課前 {pkg.formationDecisionDays} 天確認是否成班，未成班將全額退費
                    </span>
                </div>
            )}

            {/* Equipment Included */}
            {pkg.includedEquipment && pkg.includedEquipment.length > 0 && (
                <div className="mb-4 p-3 bg-green-900/20 border border-green-800/30 rounded text-xs text-green-200">
                    <div className="font-medium mb-1">包含器材：</div>
                    <div className="flex flex-wrap gap-1">
                        {pkg.includedEquipment.map((item, idx) => (
                            <span key={idx} className="text-green-300">
                                {item}
                                {idx < pkg.includedEquipment!.length - 1 && "、"}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Price */}
            <div className="mb-4">
                <div className="text-3xl font-light text-gold">
                    NT$ {pkg.price.toLocaleString()}
                </div>
                {hasBonus && (
                    <div className="text-xs text-gray-400">
                        每堂約 NT$ {Math.round(pkg.price / totalLessons).toLocaleString()}
                    </div>
                )}
            </div>

            {/* CTA Button */}
            <motion.button
                onClick={() => onSelect?.(pkg)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gold text-black py-3 rounded-lg font-light hover:bg-gold/90 transition-all duration-300"
            >
                選擇方案
            </motion.button>
        </motion.div>
    );
}
