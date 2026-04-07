'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    MoreVertical, 
    Package, 
    ChevronRight, 
    Truck, 
    CheckCircle2, 
    Filter,
    Clock,
    CreditCard,
    MapPin,
    Hash
} from 'lucide-react';
import { OrderStatus } from '@prisma/client';
import { useOrders } from '../providers/OrderProvider';
import { DBStatusBadge } from './DBStatusBadge';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: any }> = {
    [OrderStatus.PENDING_PAYMENT]: { label: '待付款', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', icon: Clock },
    [OrderStatus.PAID]: { label: '已付款', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', icon: CreditCard },
    [OrderStatus.PROCESSING]: { label: '處理中', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20', icon: Package },
    [OrderStatus.SHIPPED]: { label: '已出貨', color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20', icon: Truck },
    [OrderStatus.DELIVERED]: { label: '已送達', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', icon: CheckCircle2 },
    [OrderStatus.CANCELLED]: { label: '已取消', color: 'text-gray-500 bg-gray-500/10 border-gray-500/20', icon: Filter },
    [OrderStatus.REFUNDED]: { label: '已退款', color: 'text-rose-400 bg-rose-400/10 border-rose-400/20', icon: Hash },
};

export function OrderManager() {
    const { orders, isLoading, fetchOrders, updateStatus } = useOrders();
    const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchOrders(filter);
    }, [filter]);

    const filteredOrders = orders.filter(o => 
        o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-black text-white font-sans">
            {/* Top Bar - Matching ContentManager */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-20">
                <div className="flex items-center gap-6">
                    <h1 className="text-xl font-light tracking-wider">訂單 Pipeline</h1>
                    <DBStatusBadge />
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder="搜尋訂單編號、客戶..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-zinc-900/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-gold/50 transition-colors w-72"
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Fixed Sidebar for Filters */}
                <div className="w-64 border-r border-white/5 p-4 flex flex-col gap-6 overflow-y-auto">
                    <div className="flex flex-col gap-1">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 px-4 mb-2 font-bold">訂單狀態階段</p>
                        <FilterButton active={filter === 'ALL'} onClick={() => setFilter('ALL')} label="所有訂單" count={orders.length} />
                        <div className="h-px bg-white/5 my-2" />
                        {Object.values(OrderStatus).map((status) => (
                            <FilterButton 
                                key={status} 
                                active={filter === status} 
                                onClick={() => setFilter(status)} 
                                label={STATUS_CONFIG[status].label}
                                status={status}
                                count={orders.filter(o => o.status === status).length}
                            />
                        ))}
                    </div>
                </div>

                {/* Main Pipeline View */}
                <div className="flex-1 overflow-auto p-6 bg-zinc-950/20">
                    <div className="max-w-6xl mx-auto space-y-4">
                        <AnimatePresence mode="popLayout">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
                                </div>
                            ) : filteredOrders.length === 0 ? (
                                <div className="text-center py-20 text-gray-500 font-light border border-dashed border-white/10 rounded-3xl">
                                    目前沒有相符的訂單
                                </div>
                            ) : (
                                filteredOrders.map((order, idx) => (
                                    <OrderCard 
                                        key={order.id} 
                                        order={order} 
                                        onUpdateStatus={updateStatus}
                                        index={idx}
                                    />
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FilterButton({ active, onClick, label, status, count }: any) {
    const config = status ? STATUS_CONFIG[status as OrderStatus] : null;
    return (
        <button
            onClick={onClick}
            className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all duration-300 ${active
                ? "bg-gold text-black font-medium shadow-lg shadow-gold/20"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
        >
            <div className="flex items-center gap-3">
                {config && <config.icon size={16} />}
                <span>{label}</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${active ? 'bg-black/20 font-bold' : 'bg-white/5'}`}>
                {count}
            </span>
        </button>
    );
}

function OrderCard({ order, onUpdateStatus, index }: any) {
    const config = STATUS_CONFIG[order.status as OrderStatus];
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 hover:border-gold/30 transition-all duration-300 relative overflow-hidden"
        >
            {/* Pipeline Progress Accent */}
            <div className={`absolute top-0 left-0 w-1 h-full ${config.color.split(' ')[0]}`} />
            
            <div className="flex flex-col md:flex-row justify-between gap-6">
                {/* Leading: Order Info */}
                <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-gold bg-gold/10 px-2 py-0.5 rounded border border-gold/20 uppercase tracking-widest">
                            {order.orderNumber}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border ${config.color}`}>
                            {config.label}
                        </span>
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-gold transition-colors">
                            {order.customer.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                            <MapPin size={12} /> {order.shippingAddress || "數位產品/無地址"}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        {order.productItems.slice(0, 3).map((item: any, i: number) => (
                            <div key={i} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-gray-400">
                                {item.product.name} x{item.quantity}
                            </div>
                        ))}
                        {order.productItems.length > 3 && (
                            <div className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-gray-400">
                                +{order.productItems.length - 3}
                            </div>
                        )}
                    </div>
                </div>

                {/* Middle: Amount & Date */}
                <div className="flex flex-col items-end justify-center gap-2">
                    <div className="text-xl font-mono font-bold text-white">
                        <span className="text-xs mr-1 text-gray-500">{order.currency}</span>
                        {order.totalAmount.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Clock size={10} /> {new Date(order.createdAt).toLocaleString()}
                    </div>
                </div>

                {/* Trailing: Pipeline Actions */}
                <div className="flex items-center gap-2 border-l border-white/5 pl-6">
                    <AnimatePresence mode="wait">
                        {order.status === OrderStatus.PENDING_PAYMENT && (
                             <ActionButton 
                                onClick={() => onUpdateStatus(order.id, OrderStatus.PAID)}
                                icon={<CreditCard size={18} />}
                                label="確認收款"
                                color="bg-blue-500 hover:bg-blue-600 shadow-blue-500/20"
                             />
                        )}
                        {order.status === OrderStatus.PAID && (
                             <ActionButton 
                                onClick={() => onUpdateStatus(order.id, OrderStatus.PROCESSING)}
                                icon={<Package size={18} />}
                                label="開始處理"
                                color="bg-purple-500 hover:bg-purple-600 shadow-purple-500/20"
                             />
                        )}
                        {order.status === OrderStatus.PROCESSING && (
                             <ActionButton 
                                onClick={() => onUpdateStatus(order.id, OrderStatus.SHIPPED)}
                                icon={<Truck size={18} />}
                                label="完成出貨"
                                color="bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/20"
                             />
                        )}
                        {order.status === OrderStatus.SHIPPED && (
                             <ActionButton 
                                onClick={() => onUpdateStatus(order.id, OrderStatus.DELIVERED)}
                                icon={<CheckCircle2 size={18} />}
                                label="確認送達"
                                color="bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
                             />
                        )}
                    </AnimatePresence>
                    
                    <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 transition-all">
                        <MoreVertical size={20} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

function ActionButton({ onClick, icon, label, color }: any) {
    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-black font-bold text-sm shadow-lg transition-all ${color}`}
        >
            {icon}
            <span>{label}</span>
        </motion.button>
    );
}
