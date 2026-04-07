'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Package, 
    AlertTriangle, 
    TrendingUp, 
    TrendingDown, 
    History, 
    Activity,
    Minus,
    Plus,
    RefreshCcw
} from 'lucide-react';
import { AdjustmentType } from '@prisma/client';
import { useInventory } from '../providers/InventoryProvider';
import { DBStatusBadge } from './DBStatusBadge';

export function InventoryManager() {
    const { inventory, isLoading, fetchInventory, adjustStock } = useInventory();
    const [isAdjusting, setIsAdjusting] = useState<string | null>(null);

    useEffect(() => {
        fetchInventory();
    }, []);

    const allAdjustments = inventory
        .flatMap(i => i.adjustments.map((a: any) => ({ ...a, productName: i.product.name })))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div className="flex flex-col h-full bg-black text-white font-sans">
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-20">
                <div className="flex items-center gap-6">
                    <h1 className="text-xl font-light tracking-wider">庫存與異動</h1>
                    <DBStatusBadge />
                </div>
                <button 
                    onClick={fetchInventory}
                    className="p-2 text-gray-500 hover:text-white transition-colors"
                >
                    <RefreshCcw size={20} className={isLoading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Inventory Table */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 border-b border-white/5">
                                    <tr className="text-[10px] uppercase tracking-widest text-gray-500">
                                        <th className="px-6 py-4 font-bold">Product</th>
                                        <th className="px-6 py-4 font-bold">Stock</th>
                                        <th className="px-6 py-4 font-bold text-center">Status</th>
                                        <th className="px-6 py-4 font-bold text-right">Adjust</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {isLoading && inventory.length === 0 ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <tr key={i} className="animate-pulse h-16 bg-white/2" />
                                        ))
                                    ) : inventory.map((item) => (
                                        <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-white uppercase tracking-tight">{item.product.name}</div>
                                                <div className="text-[10px] text-gray-500 font-mono">{item.product.slug}</div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-lg font-bold text-gold">
                                                {item.currentStock}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    {item.currentStock <= item.lowThreshold ? (
                                                        <span className="flex items-center gap-1 text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full text-[10px] font-bold border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]">
                                                            <AlertTriangle size={12} /> LOW
                                                        </span>
                                                    ) : (
                                                        <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-500/20">
                                                            HEALTHY
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => adjustStock(item.productId, 1, AdjustmentType.OUTBOUND)}
                                                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <button 
                                                        onClick={() => adjustStock(item.productId, 1, AdjustmentType.INBOUND)}
                                                        className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Timeline / Logs */}
                    <div className="space-y-6">
                        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gold mb-6 flex items-center gap-2">
                                <History size={16} /> 異動對帳單
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                            </h3>
                            
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                                {allAdjustments.length === 0 ? (
                                    <div className="text-center py-10 text-gray-600 text-sm italic">尚無任何異動紀錄</div>
                                ) : allAdjustments.map((adj) => (
                                    <div key={adj.id} className="p-4 bg-white/2 rounded-xl border border-white/5 group hover:border-white/10 transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="font-bold text-xs uppercase tracking-tight text-white mb-0.5">{adj.productName}</div>
                                                <div className="text-[10px] text-gray-500 font-mono tracking-tighter">
                                                    {adj.type === AdjustmentType.INBOUND ? "進貨補庫" : adj.type === AdjustmentType.OUTBOUND ? "訂單扣庫" : "退貨入庫"}
                                                </div>
                                            </div>
                                            <div className={`text-sm font-mono font-bold ${
                                                adj.type === AdjustmentType.INBOUND ? "text-emerald-400" : "text-rose-400"
                                            }`}>
                                                {adj.type === AdjustmentType.INBOUND ? "+" : "-"}{adj.quantity}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] text-gray-600">
                                            <div className="bg-white/5 px-1.5 rounded">Prev: {adj.previousStock}</div>
                                            <div className="flex items-center gap-1">
                                                <ClockIcon size={8} /> {new Date(adj.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                                            </div>
                                            <div className="bg-white/5 px-1.5 rounded text-white/50">New: {adj.newStock}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ClockIcon({ size }: { size: number }) {
    return <Activity size={size} />;
}
