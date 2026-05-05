"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    CreditCard,
    Mail,
    Phone,
    User,
    Calendar,
    Tag,
    RotateCcw,
    Send,
    MessageSquare,
    Clock,
    Hash,
    ExternalLink,
    ChevronDown,
} from "lucide-react";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { useOrders } from "@/components/providers/OrderProvider";

interface Payment {
    id: string;
    merchantTradeNo: string;
    ecpayTradeNo: string | null;
    paymentMethod: string | null;
    paymentStatus: PaymentStatus;
    totalAmount: number;
    rtnCode: string | null;
    rtnMsg: string | null;
    rawCallback: any;
    paidAt: string | null;
    createdAt: string;
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
    PENDING_PAYMENT: {
        label: "待付款",
        className: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    },
    PAID: {
        label: "已付款",
        className: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    },
    PROCESSING: {
        label: "處理中",
        className: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
    },
    SHIPPED: {
        label: "已出貨",
        className: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
    },
    DELIVERED: {
        label: "已送達",
        className: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    },
    CANCELLED: {
        label: "已取消",
        className: "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20",
    },
    REFUNDED: {
        label: "已退款",
        className: "bg-red-500/10 text-red-400 border border-red-500/20",
    },
};

const paymentStatusConfig: Record<PaymentStatus, { label: string; className: string }> = {
    PENDING: {
        label: "等待中",
        className: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    },
    COMPLETED: {
        label: "成功",
        className: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    },
    FAILED: {
        label: "失敗",
        className: "bg-red-500/10 text-red-400 border border-red-500/20",
    },
    REFUNDED: {
        label: "已退款",
        className: "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20",
    },
    PARTIALLY_REFUNDED: {
        label: "部分退款",
        className: "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20",
    },
};

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const { fetchOrderById, updateStatus } = useOrders();

    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [noteInput, setNoteInput] = useState("");
    const [expandedCallbacks, setExpandedCallbacks] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const loadOrder = async () => {
            const data = await fetchOrderById(id);
            if (data) setOrder(data);
            setIsLoading(false);
        };
        loadOrder();
    }, [id]);

    const toggleCallback = (paymentId: string) => {
        setExpandedCallbacks(prev => ({ ...prev, [paymentId]: !prev[paymentId] }));
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6">
                <p className="text-gray-500 mb-4">找不到此訂單</p>
                <button onClick={() => router.push("/admin/orders")} className="text-gold text-sm hover:underline">返回列表</button>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-black text-white p-6 md:p-10 relative">
            {/* Background effects */}
            <div className="fixed inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Back Button */}
                <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => router.push("/admin/orders")}
                    className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
                >
                    <ArrowLeft size={16} />
                    返回訂單列表
                </motion.button>

                {/* Order Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="flex items-center justify-between mb-8"
                >
                    <div>
                        <h1 className="text-2xl font-light tracking-tight font-mono">
                            {order.orderNumber}
                        </h1>
                        <p className="text-gray-500 text-xs font-light mt-1">
                            建立於 {new Date(order.createdAt).toLocaleString("zh-TW")}
                        </p>
                    </div>
                    <span
                        className={`px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider font-bold ${statusConfig[order.status as OrderStatus]?.className || ""}`}
                    >
                        {statusConfig[order.status as OrderStatus]?.label || order.status}
                    </span>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Info Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6"
                        >
                            <h2 className="text-sm font-light mb-4 flex items-center gap-2 text-gray-400">
                                <span className="w-1 h-4 bg-gold rounded-full" />
                                訂單資訊
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">類型</p>
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <Tag size={14} className="text-gold/60" />
                                        {order.orderType}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">付款狀態</p>
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <CreditCard size={14} className="text-gold/60" />
                                        {order.paymentStatus}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">幣別</p>
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <Hash size={14} className="text-gold/60" />
                                        {order.currency}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Customer Info Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6"
                        >
                            <h2 className="text-sm font-light mb-4 flex items-center gap-2 text-gray-400">
                                <span className="w-1 h-4 bg-blue-400 rounded-full" />
                                客戶資訊
                            </h2>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm text-gray-300">
                                    <User size={14} className="text-gray-500" />
                                    {order.customer.name}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-300">
                                    <Mail size={14} className="text-gray-500" />
                                    {order.customer.email}
                                </div>
                                {order.shippingAddress && (
                                    <div className="flex items-center gap-3 text-sm text-gray-300">
                                        <Tag size={14} className="text-gray-500" />
                                        地址：{order.shippingAddress}
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Order Items Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6"
                        >
                            <h2 className="text-sm font-light mb-4 flex items-center gap-2 text-gray-400">
                                <span className="w-1 h-4 bg-emerald-400 rounded-full" />
                                訂購項目
                            </h2>
                            <div className="space-y-3">
                                {order.productItems?.map((item: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                                        <div>
                                            <p className="text-sm text-gray-200">{item.product.name}</p>
                                            <p className="text-xs text-gray-500">數量: {item.quantity}</p>
                                        </div>
                                        <p className="text-sm text-gray-300">NT${(item.quantity * item.unitPrice).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                                <p className="text-sm font-medium text-gray-400">總計</p>
                                <p className="text-lg font-light text-gold">NT${order.totalAmount.toLocaleString()}</p>
                            </div>
                        </motion.div>

                        {/* Payment Records Section - Phase 2A */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="bg-zinc-900/60 backdrop-blur-md border border-gold/10 rounded-2xl p-6 overflow-hidden"
                        >
                            <h2 className="text-sm font-light mb-6 flex items-center gap-2">
                                <span className="w-1 h-4 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                                金流交易紀錄 (Payment Records)
                            </h2>

                            {order.payments && order.payments.length > 0 ? (
                                <div className="space-y-4">
                                    {order.payments.map((payment: Payment) => (
                                        <div key={payment.id} className="bg-black/40 border border-white/5 rounded-xl p-4 transition-all hover:border-gold/20">
                                            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-amber-400/10 p-2 rounded-lg">
                                                        <CreditCard size={16} className="text-amber-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-0.5">商店交易編號</p>
                                                        <p className="text-xs font-mono text-gray-300">{payment.merchantTradeNo}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${paymentStatusConfig[payment.paymentStatus].className}`}>
                                                        {paymentStatusConfig[payment.paymentStatus].label}
                                                    </span>
                                                    <p className="text-[10px] text-gray-500">{new Date(payment.createdAt).toLocaleString("zh-TW")}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-[11px]">
                                                <div>
                                                    <p className="text-gray-500 mb-1">綠界交易編號</p>
                                                    <p className="text-gray-300 font-mono truncate" title={payment.ecpayTradeNo || "N/A"}>
                                                        {payment.ecpayTradeNo || "—"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 mb-1">金額</p>
                                                    <p className="text-amber-400 font-mono">NT${payment.totalAmount.toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 mb-1">付款方式</p>
                                                    <p className="text-gray-300">{payment.paymentMethod || "—"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 mb-1">付款時間</p>
                                                    <p className="text-gray-300">{payment.paidAt ? new Date(payment.paidAt).toLocaleString("zh-TW") : "—"}</p>
                                                </div>
                                            </div>

                                            {/* RtnMsg Info */}
                                            {(payment.rtnCode || payment.rtnMsg) && (
                                                <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg mb-2">
                                                    <div className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-mono text-gray-400">{payment.rtnCode}</div>
                                                    <div className="text-[10px] text-gray-400 truncate">{payment.rtnMsg}</div>
                                                </div>
                                            )}

                                            {/* Raw Callback Toggle */}
                                            <button 
                                                onClick={() => toggleCallback(payment.id)}
                                                className="flex items-center gap-1.5 text-[10px] text-gray-600 hover:text-gray-400 transition-colors mt-2"
                                            >
                                                <ChevronDown size={12} className={`transition-transform ${expandedCallbacks[payment.id] ? 'rotate-180' : ''}`} />
                                                {expandedCallbacks[payment.id] ? '收起詳細回傳數據' : '查看詳細回傳數據 (Raw Callback)'}
                                            </button>

                                            <AnimatePresence>
                                                {expandedCallbacks[payment.id] && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <pre className="mt-3 p-3 bg-black/60 border border-white/5 rounded-lg text-[9px] font-mono text-gray-500 overflow-x-auto">
                                                            {JSON.stringify(payment.rawCallback, null, 2)}
                                                        </pre>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl">
                                    <Clock size={24} className="mx-auto text-gray-700 mb-2" />
                                    <p className="text-xs text-gray-600 font-light">尚無金流交易紀錄</p>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Action Panel */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6"
                        >
                            <h2 className="text-sm font-light mb-4 flex items-center gap-2 text-gray-400">
                                <span className="w-1 h-4 bg-purple-400 rounded-full" />
                                操作面板
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest text-gray-500 block mb-2">訂單狀態</label>
                                    <div className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-300">
                                        {order.status}
                                    </div>
                                </div>
                                <button disabled className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 text-gray-600 cursor-not-allowed text-sm">
                                    <Send size={14} />
                                    發送通知信 (Phase 3)
                                </button>
                                <button disabled className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 text-gray-600 cursor-not-allowed text-sm">
                                    <RotateCcw size={14} />
                                    申請退款 (Phase 4)
                                </button>
                            </div>
                        </motion.div>

                        {/* Internal Notes */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6"
                        >
                            <h2 className="text-sm font-light mb-4 flex items-center gap-2 text-gray-400">
                                <span className="w-1 h-4 bg-orange-400 rounded-full" />
                                管理員備註
                            </h2>
                            <p className="text-xs text-gray-500 mb-4">{order.adminNotes || "無備註"}</p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={noteInput}
                                    onChange={(e) => setNoteInput(e.target.value)}
                                    placeholder="快速筆記..."
                                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none"
                                />
                                <button className="p-2 rounded-xl bg-gold/10 text-gold hover:bg-gold/20">
                                    <MessageSquare size={16} />
                                </button>
                            </div>
                        </motion.div>

                        {/* Links */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6"
                        >
                            <h2 className="text-sm font-light mb-4 flex items-center gap-2 text-gray-400">
                                <span className="w-1 h-4 bg-blue-400 rounded-full" />
                                捷徑
                            </h2>
                            <div className="space-y-2">
                                <a 
                                    href={`/payment/checkout?orderId=${order.id}`} 
                                    target="_blank" 
                                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-xs text-gray-300"
                                >
                                    <span>前往付款連結 (Customer View)</span>
                                    <ExternalLink size={12} />
                                </a>
                            </div>
                        </motion.div>
                    </div>
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

