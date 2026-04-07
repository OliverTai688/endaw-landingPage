"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";

type OrderStatus = "COMPLETED" | "PENDING" | "REFUNDED";

interface OrderItem {
    name: string;
    quantity: number;
    unitPrice: number;
}

interface OrderNote {
    id: string;
    content: string;
    author: string;
    date: string;
}

interface OrderDetail {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    type: string;
    date: string;
    paymentMethod: string;
    customer: {
        name: string;
        email: string;
        phone: string;
    };
    items: OrderItem[];
    notes: OrderNote[];
    refundHistory: { date: string; amount: number; reason: string }[];
}

const mockOrderData: Record<string, OrderDetail> = {
    "ord-001": {
        id: "ord-001",
        orderNumber: "ORD-2026-0001",
        status: "COMPLETED",
        type: "工作坊",
        date: "2026-03-15",
        paymentMethod: "信用卡",
        customer: { name: "林小明", email: "ming@example.com", phone: "0912-345-678" },
        items: [{ name: "手碟體驗工作坊 - 三月場", quantity: 1, unitPrice: 2800 }],
        notes: [
            { id: "n1", content: "客戶要求安排靠窗座位", author: "Admin", date: "2026-03-14 10:30" },
        ],
        refundHistory: [],
    },
    "ord-002": {
        id: "ord-002",
        orderNumber: "ORD-2026-0002",
        status: "PENDING",
        type: "樂器課",
        date: "2026-03-18",
        paymentMethod: "銀行轉帳",
        customer: { name: "陳美玲", email: "meiling@example.com", phone: "0923-456-789" },
        items: [{ name: "手碟基礎課程 - 四堂", quantity: 1, unitPrice: 4500 }],
        notes: [],
        refundHistory: [],
    },
    "ord-004": {
        id: "ord-004",
        orderNumber: "ORD-2026-0004",
        status: "REFUNDED",
        type: "工作坊",
        date: "2026-03-22",
        paymentMethod: "信用卡",
        customer: { name: "張雅婷", email: "yating@example.com", phone: "0934-567-890" },
        items: [{ name: "手碟體驗工作坊 - 三月場", quantity: 1, unitPrice: 2800 }],
        notes: [
            { id: "n2", content: "客戶因行程衝突申請退款", author: "Admin", date: "2026-03-23 14:00" },
        ],
        refundHistory: [
            { date: "2026-03-24", amount: 2800, reason: "客戶因行程衝突取消" },
        ],
    },
};

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
    COMPLETED: {
        label: "已完成",
        className: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    },
    PENDING: {
        label: "待付款",
        className: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
    },
    REFUNDED: {
        label: "已退款",
        className: "bg-red-500/10 text-red-400 border border-red-500/20",
    },
};

function getDefaultOrder(id: string): OrderDetail {
    return {
        id,
        orderNumber: `ORD-2026-${id.replace("ord-", "").padStart(4, "0")}`,
        status: "COMPLETED",
        type: "商品",
        date: "2026-03-20",
        paymentMethod: "信用卡",
        customer: { name: "訪客", email: "guest@example.com", phone: "0900-000-000" },
        items: [{ name: "Tributary Pebble 5", quantity: 1, unitPrice: 129 }],
        notes: [],
        refundHistory: [],
    };
}

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const order = mockOrderData[id] || getDefaultOrder(id);

    const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order.status);
    const [noteInput, setNoteInput] = useState("");
    const [notes, setNotes] = useState<OrderNote[]>(order.notes);

    const totalAmount = order.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
    );

    const handleAddNote = () => {
        if (!noteInput.trim()) return;
        const newNote: OrderNote = {
            id: `n-${Date.now()}`,
            content: noteInput,
            author: "Admin",
            date: new Date().toLocaleString("zh-TW"),
        };
        setNotes([newNote, ...notes]);
        setNoteInput("");
    };

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
                            建立於 {order.date}
                        </p>
                    </div>
                    <span
                        className={`px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider font-bold ${statusConfig[currentStatus].className}`}
                    >
                        {statusConfig[currentStatus].label}
                    </span>
                </motion.div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Left Column - 2/3 */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Info Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6"
                        >
                            <h2 className="text-sm font-light mb-4 flex items-center gap-2">
                                <span className="w-1 h-4 bg-gold rounded-full" />
                                訂單資訊
                            </h2>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">
                                        類型
                                    </p>
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <Tag size={14} className="text-gold/60" />
                                        {order.type}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">
                                        日期
                                    </p>
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <Calendar size={14} className="text-gold/60" />
                                        {order.date}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">
                                        付款方式
                                    </p>
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <CreditCard size={14} className="text-gold/60" />
                                        {order.paymentMethod}
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
                            <h2 className="text-sm font-light mb-4 flex items-center gap-2">
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
                                <div className="flex items-center gap-3 text-sm text-gray-300">
                                    <Phone size={14} className="text-gray-500" />
                                    {order.customer.phone}
                                </div>
                            </div>
                        </motion.div>

                        {/* Order Items Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6"
                        >
                            <h2 className="text-sm font-light mb-4 flex items-center gap-2">
                                <span className="w-1 h-4 bg-emerald-400 rounded-full" />
                                訂購項目
                            </h2>
                            <div className="space-y-3">
                                {order.items.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                                    >
                                        <div>
                                            <p className="text-sm text-gray-200">{item.name}</p>
                                            <p className="text-xs text-gray-500">
                                                數量: {item.quantity}
                                            </p>
                                        </div>
                                        <p className="text-sm text-gray-300">
                                            NT${(item.quantity * item.unitPrice).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                                <p className="text-sm font-medium text-gray-400">總計</p>
                                <p className="text-lg font-light text-gold">
                                    NT${totalAmount.toLocaleString()}
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column - 1/3 */}
                    <div className="space-y-6">
                        {/* Action Panel */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6"
                        >
                            <h2 className="text-sm font-light mb-4 flex items-center gap-2">
                                <span className="w-1 h-4 bg-purple-400 rounded-full" />
                                操作面板
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest text-gray-500 block mb-2">
                                        訂單狀態
                                    </label>
                                    <select
                                        value={currentStatus}
                                        onChange={(e) =>
                                            setCurrentStatus(e.target.value as OrderStatus)
                                        }
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-gold/50 transition-colors appearance-none cursor-pointer"
                                    >
                                        <option value="PENDING">待付款</option>
                                        <option value="COMPLETED">已完成</option>
                                        <option value="REFUNDED">已退款</option>
                                    </select>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all text-sm"
                                >
                                    <RotateCcw size={14} />
                                    申請退款
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition-all text-sm"
                                >
                                    <Send size={14} />
                                    發送通知信
                                </motion.button>
                            </div>
                        </motion.div>

                        {/* Internal Notes */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6"
                        >
                            <h2 className="text-sm font-light mb-4 flex items-center gap-2">
                                <span className="w-1 h-4 bg-orange-400 rounded-full" />
                                內部備註
                            </h2>

                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={noteInput}
                                    onChange={(e) => setNoteInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                                    placeholder="新增備註..."
                                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gold/50 transition-colors"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleAddNote}
                                    className="p-2 rounded-xl bg-gold/10 text-gold hover:bg-gold/20 transition-colors"
                                >
                                    <MessageSquare size={16} />
                                </motion.button>
                            </div>

                            <div className="space-y-3">
                                {notes.length > 0 ? (
                                    notes.map((note) => (
                                        <div
                                            key={note.id}
                                            className="border-l-2 border-white/10 pl-3 py-1"
                                        >
                                            <p className="text-xs text-gray-300">
                                                {note.content}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Clock size={10} className="text-gray-600" />
                                                <p className="text-[10px] text-gray-600">
                                                    {note.author} - {note.date}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-600 text-center py-4">
                                        尚無備註
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Refund History */}
                {order.refundHistory.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6"
                    >
                        <h2 className="text-sm font-light mb-4 flex items-center gap-2">
                            <span className="w-1 h-4 bg-red-400 rounded-full" />
                            退款紀錄
                        </h2>
                        <div className="space-y-3">
                            {order.refundHistory.map((refund, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                                >
                                    <div>
                                        <p className="text-sm text-gray-300">
                                            {refund.reason}
                                        </p>
                                        <p className="text-xs text-gray-500">{refund.date}</p>
                                    </div>
                                    <p className="text-sm text-red-400">
                                        -NT${refund.amount.toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
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
