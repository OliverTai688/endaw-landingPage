"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ContentProvider } from "../../../components/providers/ContentProvider";
import { ContentManager } from "../../../components/admin/ContentManager";
import { LayoutDashboard, LogOut } from "lucide-react";
import { motion } from "framer-motion";

function AdminContentLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            const cookies = document.cookie.split('; ');
            const authCookie = cookies.find(row => row.startsWith('internal_access='));
            if (authCookie && authCookie.split('=')[1] === 'true') {
                setIsAuthenticated(true);
            } else {
                router.push('/internal-access?from=/admin/content');
            }
        };
        checkAuth();
    }, [router]);

    const handleLogout = () => {
        document.cookie = "internal_access=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        router.push('/home');
    };

    if (!isAuthenticated) return null;

    return (
        <div className="flex h-screen bg-black overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-20 md:w-64 border-r border-white/5 flex flex-col bg-zinc-950">
                <div className="p-6 flex items-center gap-4 border-b border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                        <LayoutDashboard className="text-gold" size={20} />
                    </div>
                    <span className="hidden md:block font-light text-lg tracking-tight">ENDAW Admin</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button
                        onClick={() => router.push('/admin')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                    >
                        <LayoutDashboard size={18} />
                        <span className="hidden md:block">Overview</span>
                    </button>
                    <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm bg-gold/10 text-gold font-medium">
                        <LayoutDashboard size={18} />
                        <span className="hidden md:block">Content</span>
                    </div>
                </nav>

                <div className="p-4 border-t border-white/5">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-red-500/10 transition-all duration-300"
                    >
                        <LogOut size={18} />
                        <span className="hidden md:block">Logout</span>
                    </motion.button>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 relative overflow-auto">
                {children}
            </main>
        </div>
    );
}

export default function AdminContentPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
            </div>
        }>
            <ContentProvider>
                <AdminContentLayout>
                    <ContentManager />
                </AdminContentLayout>
            </ContentProvider>
        </Suspense>
    );
}
