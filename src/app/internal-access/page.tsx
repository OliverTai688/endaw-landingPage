"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, ArrowRight } from "lucide-react";

function InternalAccessForm() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const from = searchParams.get("from") || "/admin";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === "endaw") {
            document.cookie = "internal_access=true; path=/; max-age=86400";
            router.push(from);
        } else {
            setError(true);
            setPassword("");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-gold/10 p-8 rounded-2xl shadow-2xl relative z-10"
        >
            <div className="flex justify-center mb-8">
                <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                    <Lock className="text-gold" size={28} />
                </div>
            </div>

            <h1 className="text-2xl font-light text-center mb-2 tracking-tight">內部人員存取</h1>
            <p className="text-gray-400 text-center text-sm font-light mb-8">請輸入管理密碼以繼續訪問受限內容</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (error) setError(false);
                        }}
                        placeholder="輸入密碼"
                        className={`w-full bg-black/50 border ${error ? "border-red-500/50" : "border-gold/20"} rounded-lg px-4 py-3 text-center tracking-[0.5em] focus:outline-none focus:border-gold/50 transition-all duration-300 font-light`}
                        autoFocus
                    />
                    {error && (
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-400 text-xs text-center mt-3 font-light"
                        >
                            密碼錯誤，請重新嘗試
                        </motion.p>
                    )}
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full bg-gold text-black py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gold/90 transition-all duration-300 shadow-lg shadow-gold/10"
                >
                    進入系統 <ArrowRight size={18} />
                </motion.button>
            </form>

            <div className="mt-8 pt-8 border-t border-white/5 text-center">
                <button
                    onClick={() => router.push("/home")}
                    className="text-gray-500 text-xs hover:text-white transition-colors duration-300 font-light"
                >
                    返回首頁
                </button>
            </div>
        </motion.div>
    );
}

export default function InternalAccessPage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-[120px]" />
            </div>

            <Suspense fallback={
                <div className="flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
                </div>
            }>
                <InternalAccessForm />
            </Suspense>

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
