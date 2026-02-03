"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Music, Sparkles, LogOut, ArrowRight, ExternalLink } from "lucide-react";

interface ProtectedPage {
    id: string;
    title: string;
    description: string;
    href: string;
    status: 'draft' | 'pending' | 'published';
    icon: React.ReactNode;
}

function AdminDashboardContent() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            const cookies = document.cookie.split('; ');
            const authCookie = cookies.find(row => row.startsWith('internal_access='));
            if (authCookie && authCookie.split('=')[1] === 'true') {
                setIsAuthenticated(true);
            } else {
                router.push('/internal-access?from=/admin');
            }
        };
        checkAuth();
    }, [router]);

    const handleLogout = () => {
        document.cookie = "internal_access=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        router.push('/home');
    };

    const pages: ProtectedPage[] = [
        {
            id: 'workshops',
            title: '城市實驗室工作坊',
            description: '管理單次活動與工作坊課程',
            href: '/workshops',
            status: 'pending',
            icon: <Sparkles className="text-gold" size={24} />
        },
        {
            id: 'music',
            title: '樂器訓練所',
            description: '管理系統化長期待發布課程',
            href: '/music',
            status: 'pending',
            icon: <Music className="text-blue-400" size={24} />
        }
    ];

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 relative overflow-hidden">
            {/* Background effects */}
            <div className="fixed inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                            <LayoutDashboard className="text-gold" size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-light tracking-tight">ENDAW 管理後台</h1>
                            <p className="text-gray-500 text-sm font-light mt-1">內部人員專屬預覽與管理空間</p>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-6 py-2 rounded-lg bg-zinc-900 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all duration-300 text-sm font-light"
                    >
                        登出系統 <LogOut size={16} />
                    </motion.button>
                </header>

                {/* Statistics Row (Placeholder) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl">
                        <div className="text-gray-500 text-xs uppercase tracking-wider mb-2">待發布頁面</div>
                        <div className="text-3xl font-light">{pages.length}</div>
                    </div>
                    <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl">
                        <div className="text-gray-500 text-xs uppercase tracking-wider mb-2">上架中課程</div>
                        <div className="text-3xl font-light">0</div>
                    </div>
                    <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl text-gold/60">
                        <div className="text-gray-500 text-xs uppercase tracking-wider mb-2">系統狀態</div>
                        <div className="text-sm font-light">運行正常</div>
                    </div>
                </div>

                {/* Page Manager */}
                <h2 className="text-xl font-light mb-8 flex items-center gap-2">
                    <span className="w-1 h-6 bg-gold rounded-full" />
                    內容管理
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {pages.map((page, index) => (
                        <motion.div
                            key={page.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="group bg-zinc-900/40 backdrop-blur-md border border-white/5 hover:border-gold/30 rounded-2xl p-8 transition-all duration-500 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                        {page.icon}
                                    </div>
                                    <span className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] uppercase tracking-widest">
                                        {page.status === 'pending' ? '待發布' : '草稿'}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-light mb-3 group-hover:text-gold transition-colors duration-300">
                                    {page.title}
                                </h3>
                                <p className="text-gray-400 font-light text-sm mb-8 leading-relaxed">
                                    {page.description}
                                </p>
                            </div>

                            <div className="flex items-center gap-4 mt-auto">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => router.push(page.href)}
                                    className="flex-1 bg-white text-black py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gold hover:text-black transition-all duration-300"
                                >
                                    預覽頁面 <ExternalLink size={18} />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-14 h-14 rounded-xl border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all duration-300"
                                >
                                    <ArrowRight size={20} />
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </div>
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

export default function AdminDashboardPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
            </div>
        }>
            <AdminDashboardContent />
        </Suspense>
    );
}
