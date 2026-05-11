'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Music2, Calendar, Clock, CheckCircle2,
    AlertCircle, PauseCircle, X, Edit, Trash2,
    RefreshCw, ChevronDown, User, FileText,
} from 'lucide-react';
import { EnrollmentStatus } from '@prisma/client';
import { DBStatusBadge } from './DBStatusBadge';

interface Enrollment {
    id: string;
    status: EnrollmentStatus;
    startDate: string;
    expiryDate: string;
    adminNotes: string | null;
    activatedBy: string | null;
    createdAt: string;
    customer: { id: string; name: string; email: string; phone: string | null };
    package: {
        id: string;
        name: string;
        validDuration: number;
        lessonCount: number;
        level: {
            name: string;
            instrument: { name: string; nameEn: string };
        };
    };
    order: { orderNumber: string };
}

const STATUS_CONFIG: Record<EnrollmentStatus, { label: string; color: string; icon: any }> = {
    [EnrollmentStatus.ACTIVE]:    { label: '進行中', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', icon: CheckCircle2 },
    [EnrollmentStatus.PENDING]:   { label: '待啟用', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', icon: Clock },
    [EnrollmentStatus.EXPIRED]:   { label: '已到期', color: 'text-gray-500 bg-gray-500/10 border-gray-500/20', icon: AlertCircle },
    [EnrollmentStatus.SUSPENDED]: { label: '已暫停', color: 'text-rose-400 bg-rose-400/10 border-rose-400/20', icon: PauseCircle },
};

const daysUntil = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export function EnrollmentManager() {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<EnrollmentStatus | 'ALL'>('ALL');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editModal, setEditModal] = useState<Partial<Enrollment> | null>(null);
    const [editForm, setEditForm] = useState({ status: '' as EnrollmentStatus, startDate: '', adminNotes: '' });
    const [isSaving, setIsSaving] = useState(false);

    const fetchEnrollments = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter !== 'ALL') params.set('status', statusFilter);
            const res = await fetch(`/api/bff/v1/admin/enrollments?${params}`);
            const json = await res.json();
            if (json.success) setEnrollments(json.data);
        } finally {
            setIsLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => { fetchEnrollments(); }, [fetchEnrollments]);

    const filtered = enrollments.filter(e => {
        const q = searchTerm.toLowerCase();
        return (
            e.customer.name.toLowerCase().includes(q) ||
            e.customer.email.toLowerCase().includes(q) ||
            e.package.level.instrument.name.toLowerCase().includes(q) ||
            e.order.orderNumber.toLowerCase().includes(q)
        );
    });

    const openEdit = (e: Enrollment) => {
        setEditingId(e.id);
        setEditModal(e);
        setEditForm({
            status: e.status,
            startDate: new Date(e.startDate).toISOString().substring(0, 10),
            adminNotes: e.adminNotes || '',
        });
    };

    const handleSave = async () => {
        if (!editingId) return;
        setIsSaving(true);
        try {
            await fetch('/api/bff/v1/admin/enrollments', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingId,
                    status: editForm.status,
                    startDate: editForm.startDate,
                    adminNotes: editForm.adminNotes,
                }),
            });
            setEditingId(null);
            setEditModal(null);
            fetchEnrollments();
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('確定要刪除此學員紀錄嗎？')) return;
        await fetch(`/api/bff/v1/admin/enrollments?id=${id}`, { method: 'DELETE' });
        fetchEnrollments();
    };

    return (
        <div className="flex flex-col h-full bg-black text-white font-sans">
            {/* Top Bar */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-20">
                <div className="flex items-center gap-6">
                    <h1 className="text-xl font-light tracking-wider">學員管理</h1>
                    <DBStatusBadge />
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder="搜尋學員、訂單號..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-zinc-900/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-gold/50 transition-colors w-64"
                        />
                    </div>
                    <button onClick={fetchEnrollments} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition-colors" title="重新整理">
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar filter */}
                <div className="w-52 border-r border-white/5 flex flex-col p-4 gap-1 shrink-0">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-600 px-3 mb-2 font-bold">狀態篩選</p>
                    {(['ALL', ...Object.values(EnrollmentStatus)] as const).map((s) => {
                        const cfg = s !== 'ALL' ? STATUS_CONFIG[s] : null;
                        const count = s === 'ALL' ? enrollments.length : enrollments.filter(e => e.status === s).length;
                        return (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s as any)}
                                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${statusFilter === s ? 'bg-gold/10 text-gold font-medium' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                            >
                                <div className="flex items-center gap-2">
                                    {cfg && <cfg.icon size={14} />}
                                    <span>{s === 'ALL' ? '全部' : cfg!.label}</span>
                                </div>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5">{count}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Main List */}
                <div className="flex-1 overflow-auto p-6 bg-zinc-950/20">
                    <div className="max-w-5xl mx-auto space-y-4">
                        <AnimatePresence mode="popLayout">
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="h-36 rounded-2xl bg-zinc-900/30 border border-white/5 animate-pulse" />
                                ))
                            ) : filtered.length === 0 ? (
                                <div className="text-center py-24 text-gray-500 border border-dashed border-white/10 rounded-3xl">
                                    <Music2 size={36} className="mx-auto mb-4 opacity-30" />
                                    <p className="font-light">目前沒有學員資料</p>
                                    <p className="text-xs mt-1">訂單付款後，請到「訂單管理」啟用套票</p>
                                </div>
                            ) : (
                                filtered.map((enrollment, i) => (
                                    <EnrollmentCard
                                        key={enrollment.id}
                                        enrollment={enrollment}
                                        index={i}
                                        onEdit={openEdit}
                                        onDelete={handleDelete}
                                    />
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingId && editModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setEditingId(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium">編輯學員記錄</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {(editModal as Enrollment).customer?.name} · {(editModal as Enrollment).package?.level?.instrument?.name}
                                    </p>
                                </div>
                                <button onClick={() => setEditingId(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <X size={18} className="text-gray-400" />
                                </button>
                            </div>

                            <div className="p-6 space-y-5">
                                {/* Status */}
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400 uppercase tracking-widest font-bold">狀態</label>
                                    <div className="relative">
                                        <select
                                            value={editForm.status}
                                            onChange={(e) => setEditForm(f => ({ ...f, status: e.target.value as EnrollmentStatus }))}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-gold/50 pr-10"
                                        >
                                            {Object.values(EnrollmentStatus).map(s => (
                                                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Start Date */}
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400 uppercase tracking-widest font-bold">開始日期（自動計算到期日）</label>
                                    <input
                                        type="date"
                                        value={editForm.startDate}
                                        onChange={(e) => setEditForm(f => ({ ...f, startDate: e.target.value }))}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors"
                                    />
                                    {editForm.startDate && (editModal as Enrollment).package && (() => {
                                        const start = new Date(editForm.startDate);
                                        const expiry = new Date(start);
                                        expiry.setMonth(expiry.getMonth() + (editModal as Enrollment).package.validDuration);
                                        return (
                                            <p className="text-xs text-gold/70">
                                                到期日預覽：{expiry.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                        );
                                    })()}
                                </div>

                                {/* Notes */}
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400 uppercase tracking-widest font-bold">管理員備注</label>
                                    <textarea
                                        rows={3}
                                        value={editForm.adminNotes}
                                        onChange={(e) => setEditForm(f => ({ ...f, adminNotes: e.target.value }))}
                                        placeholder="例如：學員申請延長有效期..."
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors resize-none text-sm"
                                    />
                                </div>
                            </div>

                            <div className="p-6 border-t border-white/10 flex gap-3">
                                <button onClick={() => setEditingId(null)} className="flex-1 py-3 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors text-sm">
                                    取消
                                </button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex-1 py-3 rounded-xl bg-gold text-black font-bold text-sm shadow-lg shadow-gold/20 disabled:opacity-50"
                                >
                                    {isSaving ? '儲存中...' : '儲存變更'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function EnrollmentCard({ enrollment, index, onEdit, onDelete }: {
    enrollment: Enrollment;
    index: number;
    onEdit: (e: Enrollment) => void;
    onDelete: (id: string) => void;
}) {
    const cfg = STATUS_CONFIG[enrollment.status];
    const daysLeft = daysUntil(enrollment.expiryDate);
    const isExpiringSoon = daysLeft > 0 && daysLeft <= 14;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 hover:border-gold/20 transition-all duration-300 relative overflow-hidden group"
        >
            {/* Status accent bar */}
            <div className={`absolute top-0 left-0 w-1 h-full ${cfg.color.split(' ')[0]}`} />

            <div className="flex flex-col md:flex-row gap-6">
                {/* Student info */}
                <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-widest border ${cfg.color}`}>
                            <cfg.icon size={11} />
                            {cfg.label}
                        </span>
                        <span className="text-[10px] font-mono text-gold bg-gold/10 px-2 py-0.5 rounded border border-gold/20">
                            #{enrollment.order.orderNumber}
                        </span>
                        {isExpiringSoon && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 font-bold">
                                ⚠ 即將到期 ({daysLeft}天)
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                            <User size={16} className="text-gray-400" />
                        </div>
                        <div>
                            <p className="font-medium text-white">{enrollment.customer.name}</p>
                            <p className="text-xs text-gray-500">{enrollment.customer.email}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <Music2 size={14} className="text-gold shrink-0" />
                        <span className="text-white">{enrollment.package.level.instrument.name}</span>
                        <span className="text-gray-600">·</span>
                        <span className="text-gray-400">{enrollment.package.level.name}</span>
                        <span className="text-gray-600">·</span>
                        <span className="text-gray-400">{enrollment.package.name}</span>
                    </div>

                    {enrollment.adminNotes && (
                        <div className="flex items-start gap-2 text-xs text-gray-500 bg-white/3 rounded-lg px-3 py-2 border border-white/5">
                            <FileText size={12} className="shrink-0 mt-0.5" />
                            <span>{enrollment.adminNotes}</span>
                        </div>
                    )}
                </div>

                {/* Dates + Actions */}
                <div className="flex flex-col items-end justify-between gap-4 md:min-w-[200px]">
                    <div className="text-right space-y-2">
                        <div className="text-xs text-gray-500 flex items-center justify-end gap-1">
                            <Calendar size={12} />
                            開始：{new Date(enrollment.startDate).toLocaleDateString('zh-TW')}
                        </div>
                        <div className={`text-xs flex items-center justify-end gap-1 ${daysLeft < 0 ? 'text-gray-600' : isExpiringSoon ? 'text-amber-400' : 'text-gray-400'}`}>
                            <Clock size={12} />
                            到期：{new Date(enrollment.expiryDate).toLocaleDateString('zh-TW')}
                        </div>
                        {daysLeft >= 0 && (
                            <div className={`text-right text-xs font-bold ${isExpiringSoon ? 'text-amber-400' : 'text-emerald-400'}`}>
                                剩餘 {daysLeft} 天
                            </div>
                        )}
                        {daysLeft < 0 && (
                            <div className="text-right text-xs text-gray-600">
                                已逾期 {Math.abs(daysLeft)} 天
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onEdit(enrollment)}
                            className="p-2.5 rounded-xl bg-white/5 text-gray-400 hover:bg-gold/10 hover:text-gold border border-white/10 transition-all"
                            title="編輯"
                        >
                            <Edit size={15} />
                        </button>
                        <button
                            onClick={() => onDelete(enrollment.id)}
                            className="p-2.5 rounded-xl bg-white/5 text-gray-400 hover:bg-red-500/10 hover:text-red-400 border border-white/10 transition-all"
                            title="刪除"
                        >
                            <Trash2 size={15} />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
