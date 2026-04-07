"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Megaphone,
    Plus,
    Trash2,
    Save,
    Eye,
    ChevronLeft,
    ChevronRight,
    Calendar,
    X,
    Loader2,
} from "lucide-react";

interface Announcement {
    id: string;
    date: number;
    title: string;
    content: string;
}

const DAYS_OF_WEEK = ["日", "一", "二", "三", "四", "五", "六"];

function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
}

export default function AnnouncementsPage() {
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [showAddForm, setShowAddForm] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");
    const [newDate, setNewDate] = useState(1);

    const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const monthLabel = `${currentYear} 年 ${currentMonth + 1} 月`;

    useEffect(() => {
        fetchAnnouncements();
    }, [currentYear, currentMonth]);

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/announcements');
            const data = await res.json();
            const currentMonthData = data.find((d: any) => d.month === monthStr);
            if (currentMonthData) {
                setAnnouncements(currentMonthData.schedule as Announcement[]);
            } else {
                setAnnouncements([]);
            }
        } catch (error) {
            console.error("Failed to fetch announcements:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/announcements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    month: monthStr,
                    schedule: announcements,
                    instrumentIds: [],
                    announcements: []
                }),
            });
            if (res.ok) {
                // Show success toast or feedback
                console.log("Saved successfully");
            }
        } catch (error) {
            console.error("Failed to save announcements:", error);
        } finally {
            setSaving(false);
        }
    };

    const calendarDays: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
        calendarDays.push(d);
    }

    const goToPrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const handleAddAnnouncement = () => {
        if (!newTitle.trim()) return;
        const newAnnouncement: Announcement = {
            id: `a-${Date.now()}`,
            date: newDate,
            title: newTitle,
            content: newContent,
        };
        setAnnouncements([...announcements, newAnnouncement]);
        setNewTitle("");
        setNewContent("");
        setNewDate(1);
        setShowAddForm(false);
    };

    const handleDelete = (id: string) => {
        setAnnouncements(announcements.filter((a) => a.id !== id));
    };

    const getAnnouncementsForDay = (day: number) => {
        return announcements.filter((a) => a.date === day);
    };

    return (
        <div className="min-h-full bg-black text-white p-6 md:p-10 relative">
            {/* Background effects */}
            <div className="fixed inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-8"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                            <Megaphone className="text-orange-400" size={20} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-light tracking-tight">月份公告管理</h1>
                            <p className="text-gray-500 text-xs font-light mt-0.5">
                                管理每月活動與公告排程
                            </p>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowAddForm(true)}
                        className="bg-gold text-black px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2"
                    >
                        <Plus size={18} />
                        新增本日公告
                    </motion.button>
                </motion.div>

                {/* Month Selector */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="flex items-center justify-center gap-4 mb-8"
                >
                    <button
                        onClick={goToPrevMonth}
                        className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900/40 border border-white/5 rounded-xl">
                        <Calendar size={16} className="text-gold" />
                        <span className="text-sm font-light tracking-wide">{monthLabel}</span>
                    </div>
                    <button
                        onClick={goToNextMonth}
                        className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </motion.div>

                {/* Calendar Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 mb-8 relative"
                >
                    {loading && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-2xl">
                            <Loader2 className="animate-spin text-gold" size={32} />
                        </div>
                    )}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {DAYS_OF_WEEK.map((day) => (
                            <div
                                key={day}
                                className="text-center text-[10px] uppercase tracking-widest text-gray-500 py-2 font-bold"
                            >
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, idx) => {
                            const dayAnnouncements = day ? getAnnouncementsForDay(day) : [];
                            const hasAnnouncement = dayAnnouncements.length > 0;
                            return (
                                <div
                                    key={idx}
                                    className={`min-h-[72px] rounded-xl p-2 text-xs transition-colors ${
                                        day
                                            ? hasAnnouncement
                                                ? "bg-gold/5 border border-gold/10"
                                                : "bg-white/[0.02] border border-white/5 hover:bg-white/[0.04]"
                                            : ""
                                    }`}
                                >
                                    {day && (
                                        <>
                                            <span
                                                className={`text-[10px] font-mono ${
                                                    hasAnnouncement ? "text-gold" : "text-gray-500"
                                                }`}
                                            >
                                                {day}
                                            </span>
                                            {dayAnnouncements.map((a) => (
                                                <div
                                                    key={a.id}
                                                    className="mt-1 px-1.5 py-0.5 bg-gold/10 rounded text-[9px] text-gold truncate"
                                                    title={a.title}
                                                >
                                                    {a.title}
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Announcements List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="mb-8"
                >
                    <h2 className="text-lg font-light mb-4 flex items-center gap-2">
                        <span className="w-1 h-5 bg-orange-400 rounded-full" />
                        公告列表
                    </h2>
                    <div className="space-y-3">
                        {announcements.length > 0 ? (
                            announcements
                                .sort((a, b) => a.date - b.date)
                                .map((announcement, i) => (
                                    <motion.div
                                        key={announcement.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.03 * i }}
                                        className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 flex items-center justify-between group hover:border-gold/10 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                                                <span className="text-xs font-mono text-gold">
                                                    {announcement.date}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm text-white group-hover:text-gold transition-colors">
                                                    {announcement.title}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {announcement.content}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(announcement.id)}
                                            className="p-2 rounded-lg text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                            title="刪除"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </motion.div>
                                ))
                        ) : (
                            <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-12 text-center">
                                <Megaphone size={32} className="mx-auto mb-3 text-gray-700" />
                                <p className="text-gray-500 font-light text-sm">
                                    本月尚無公告
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-3"
                >
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="flex items-center gap-2 bg-gold text-black px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        儲存變更
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => window.open('/?preview=true', '_blank')}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm border border-white/10 text-gray-300 hover:bg-white/5 transition-all"
                    >
                        <Eye size={16} />
                        預覽
                    </motion.button>
                </motion.div>
            </div>

            {/* Add Announcement Modal */}
            <AnimatePresence>
                {showAddForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddForm(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl p-8 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-light">新增公告</h2>
                                <button
                                    onClick={() => setShowAddForm(false)}
                                    className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-widest block mb-1">
                                        日期 (日)
                                    </label>
                                    <select
                                        value={newDate}
                                        onChange={(e) => setNewDate(Number(e.target.value))}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors appearance-none cursor-pointer"
                                    >
                                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                                            (d) => (
                                                <option key={d} value={d}>
                                                    {currentMonth + 1} 月 {d} 日
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-widest block mb-1">
                                        標題
                                    </label>
                                    <input
                                        type="text"
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        placeholder="輸入公告標題..."
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-widest block mb-1">
                                        內容
                                    </label>
                                    <textarea
                                        value={newContent}
                                        onChange={(e) => setNewContent(e.target.value)}
                                        placeholder="輸入公告內容..."
                                        rows={3}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold/50 transition-colors resize-none"
                                    />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => setShowAddForm(false)}
                                        className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm"
                                    >
                                        取消
                                    </button>
                                    <button
                                        onClick={handleAddAnnouncement}
                                        disabled={!newTitle.trim()}
                                        className="flex-1 px-4 py-3 rounded-xl bg-gold text-black font-medium hover:brightness-110 transition-all disabled:opacity-50 disabled:grayscale text-sm"
                                    >
                                        新增
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Grain texture */}
            <div
                className="fixed inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            />
        </div>
    );
}
