"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    BarChart3,
    DollarSign,
    ClipboardList,
    TrendingUp,
    TrendingDown,
    Minus,
    PieChart,
    Calendar,
} from "lucide-react";

type TimeRange = "month" | "quarter" | "year" | "custom";

interface KPI {
    label: string;
    value: string;
    delta: string;
    deltaType: "up" | "down" | "neutral";
    icon: React.ReactNode;
}

interface RankingItem {
    rank: number;
    name: string;
    salesOrEnrollment: number;
    revenue: number;
    trend: "up" | "down" | "flat";
}

const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: "month", label: "本月" },
    { value: "quarter", label: "本季" },
    { value: "year", label: "本年" },
    { value: "custom", label: "自訂" },
];

const kpis: KPI[] = [
    {
        label: "總營收",
        value: "NT$16,288",
        delta: "+12.5%",
        deltaType: "up",
        icon: <DollarSign className="text-gold" size={20} />,
    },
    {
        label: "訂單數",
        value: "23",
        delta: "+3 筆",
        deltaType: "up",
        icon: <ClipboardList className="text-blue-400" size={20} />,
    },
    {
        label: "平均客單價",
        value: "NT$708",
        delta: "-2.1%",
        deltaType: "down",
        icon: <TrendingUp className="text-emerald-400" size={20} />,
    },
    {
        label: "報名率",
        value: "68%",
        delta: "+5%",
        deltaType: "up",
        icon: <PieChart className="text-purple-400" size={20} />,
    },
];

const rankingData: RankingItem[] = [
    { rank: 1, name: "手碟體驗工作坊", salesOrEnrollment: 12, revenue: 33600, trend: "up" },
    { rank: 2, name: "手碟基礎課程", salesOrEnrollment: 5, revenue: 22500, trend: "up" },
    { rank: 3, name: "Tributary Pebble 5", salesOrEnrollment: 8, revenue: 1032, trend: "flat" },
    { rank: 4, name: "JO-COOL", salesOrEnrollment: 6, revenue: 354, trend: "down" },
    { rank: 5, name: "Slip-Clip", salesOrEnrollment: 15, revenue: 135, trend: "up" },
];

const trendIcons: Record<string, React.ReactNode> = {
    up: <TrendingUp size={14} className="text-emerald-400" />,
    down: <TrendingDown size={14} className="text-red-400" />,
    flat: <Minus size={14} className="text-gray-500" />,
};

export default function InsightsPage() {
    const [timeRange, setTimeRange] = useState<TimeRange>("month");

    return (
        <div className="min-h-full bg-black text-white p-6 md:p-10 relative">
            {/* Background effects */}
            <div className="fixed inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-8"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                            <BarChart3 className="text-cyan-400" size={20} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-light tracking-tight">數據洞察</h1>
                            <p className="text-gray-500 text-xs font-light mt-0.5">
                                營收與業務數據分析
                            </p>
                        </div>
                    </div>

                    {/* Time Range Selector */}
                    <div className="flex items-center gap-1 bg-zinc-900/50 border border-white/5 rounded-xl p-1">
                        {timeRangeOptions.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setTimeRange(opt.value)}
                                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                                    timeRange === opt.value
                                        ? "bg-gold/10 text-gold font-medium"
                                        : "text-gray-500 hover:text-gray-300"
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {kpis.map((kpi, i) => (
                        <motion.div
                            key={kpi.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * i }}
                            className="bg-zinc-900/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-gray-500 text-xs uppercase tracking-wider">
                                    {kpi.label}
                                </span>
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                    {kpi.icon}
                                </div>
                            </div>
                            <div className="text-2xl font-light mb-1">{kpi.value}</div>
                            <div
                                className={`text-xs font-light flex items-center gap-1 ${
                                    kpi.deltaType === "up"
                                        ? "text-emerald-400"
                                        : kpi.deltaType === "down"
                                        ? "text-red-400"
                                        : "text-gray-500"
                                }`}
                            >
                                {kpi.deltaType === "up" && <TrendingUp size={12} />}
                                {kpi.deltaType === "down" && <TrendingDown size={12} />}
                                {kpi.delta}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Chart Placeholders - Two Column */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Revenue Trend */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6"
                    >
                        <h2 className="text-sm font-light mb-4 flex items-center gap-2">
                            <span className="w-1 h-4 bg-gold rounded-full" />
                            營收趨勢
                        </h2>
                        <div className="flex items-center justify-center h-48 text-gray-600">
                            <div className="text-center">
                                <BarChart3 size={36} className="mx-auto mb-3 text-gray-700" />
                                <p className="text-sm font-light">
                                    營收資料將在訂單建立後顯示
                                </p>
                                <p className="text-xs text-gray-700 mt-1">
                                    資料區間：{timeRange === "month" ? "本月" : timeRange === "quarter" ? "本季" : timeRange === "year" ? "本年" : "自訂"}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Revenue Distribution */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6"
                    >
                        <h2 className="text-sm font-light mb-4 flex items-center gap-2">
                            <span className="w-1 h-4 bg-purple-400 rounded-full" />
                            收入分布
                        </h2>
                        <div className="flex items-center justify-center h-48 text-gray-600">
                            <div className="text-center">
                                <PieChart size={36} className="mx-auto mb-3 text-gray-700" />
                                <p className="text-sm font-light">
                                    收入分布將在訂單建立後顯示
                                </p>
                                <p className="text-xs text-gray-700 mt-1">
                                    工作坊 / 樂器課 / 商品
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Ranking Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h2 className="text-lg font-light mb-4 flex items-center gap-2">
                        <span className="w-1 h-5 bg-gold rounded-full" />
                        熱門商品/課程排名
                    </h2>
                    <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 text-gray-400 text-xs uppercase tracking-widest">
                                    <th className="px-6 py-4 font-medium">排名</th>
                                    <th className="px-6 py-4 font-medium">名稱</th>
                                    <th className="px-6 py-4 font-medium">銷量/報名</th>
                                    <th className="px-6 py-4 font-medium">營收</th>
                                    <th className="px-6 py-4 font-medium">趨勢</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {rankingData.map((item, i) => (
                                    <motion.tr
                                        key={item.rank}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.05 * i + 0.3 }}
                                        className="group hover:bg-white/[0.02] transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <span
                                                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                                                    item.rank <= 3
                                                        ? "bg-gold/10 text-gold border border-gold/20"
                                                        : "bg-white/5 text-gray-500"
                                                }`}
                                            >
                                                {item.rank}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-200 group-hover:text-white transition-colors">
                                            {item.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-300 font-mono">
                                            {item.salesOrEnrollment}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-300">
                                            NT${item.revenue.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {trendIcons[item.trend]}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>

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
