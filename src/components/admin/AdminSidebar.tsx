"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    ClipboardList,
    ShoppingBag,
    Package,
    FileEdit,
    Megaphone,
    BarChart3,
    LogOut,
    Calendar,
    Music2,
} from "lucide-react";

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

const navSections: NavSection[] = [
    {
        title: "",
        items: [
            { label: "總覽", href: "/admin", icon: <LayoutDashboard size={18} /> },
        ],
    },
    {
        title: "商務管理",
        items: [
            { label: "訂單管理", href: "/admin/orders", icon: <ClipboardList size={18} /> },
            { label: "商品上架", href: "/admin/products", icon: <ShoppingBag size={18} /> },
            { label: "庫存管理", href: "/admin/inventory", icon: <Package size={18} /> },
        ],
    },
    {
        title: "課程活動",
        items: [
            { label: "工作坊管理", href: "/admin/workshops", icon: <Calendar size={18} /> },
            { label: "樂器課程", href: "/admin/music", icon: <Music2 size={18} /> },
        ],
    },
    {
        title: "內容管理",
        items: [
            { label: "內容編輯", href: "/admin/content", icon: <FileEdit size={18} /> },
            { label: "公告管理", href: "/admin/announcements", icon: <Megaphone size={18} /> },
        ],
    },
    {
        title: "數據分析",
        items: [
            { label: "數據洞察", href: "/admin/insights", icon: <BarChart3 size={18} /> },
        ],
    },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        document.cookie = "internal_access=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        router.push("/home");
    };

    const isActive = (href: string) => {
        if (href === "/admin") return pathname === "/admin";
        return pathname.startsWith(href);
    };

    return (
        <div className="w-16 md:w-64 border-r border-white/5 flex flex-col bg-zinc-950 shrink-0">
            {/* Logo */}
            <div className="p-4 md:p-6 flex items-center gap-4 border-b border-white/5">
                <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                    <LayoutDashboard className="text-gold" size={20} />
                </div>
                <span className="hidden md:block font-light text-lg tracking-tight text-white">
                    ENDAW Admin
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-2 md:p-4 space-y-1 overflow-y-auto">
                {navSections.map((section, si) => (
                    <div key={si} className={si > 0 ? "mt-4" : ""}>
                        {section.title && (
                            <p className="hidden md:block text-[10px] uppercase tracking-[0.2em] text-gray-600 px-4 mb-2 font-bold">
                                {section.title}
                            </p>
                        )}
                        {section.items.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <button
                                    key={item.href}
                                    onClick={() => router.push(item.href)}
                                    className={`w-full flex items-center justify-center md:justify-start gap-3 px-3 md:px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                                        active
                                            ? "bg-gold/10 text-gold font-medium"
                                            : "text-gray-400 hover:bg-white/5 hover:text-white"
                                    }`}
                                    title={item.label}
                                >
                                    {item.icon}
                                    <span className="hidden md:block">{item.label}</span>
                                </button>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* Logout */}
            <div className="p-2 md:p-4 border-t border-white/5">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center md:justify-start gap-3 px-3 md:px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-red-500/10 transition-all duration-300"
                    title="登出"
                >
                    <LogOut size={18} />
                    <span className="hidden md:block">登出</span>
                </motion.button>
            </div>
        </div>
    );
}
