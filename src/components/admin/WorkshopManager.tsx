'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Edit, Trash2, X, Calendar,
    MapPin, Users, ChevronDown, Image as ImageIcon,
} from 'lucide-react';
import { PublishStatus } from '@prisma/client';
import { DBStatusBadge } from './DBStatusBadge';
import { ImageUploadField } from './ImageUploadField';

// ── Types ──────────────────────────────────────────────

interface InstructorForm {
    name: string;
    bio: string;
    avatar: string;
}

interface WorkshopForm {
    title: string;
    subtitle: string;
    description: string;
    coverImage: string;
    price: number;
    tags: string;
    status: PublishStatus;
    // metadata
    instructor: InstructorForm;
    scheduleDate: string;
    scheduleLocation: string;
    scheduleDuration: string;
    capacityTotal: number;
    capacityRemaining: number;
    registrationDeadline: string;
    attendanceRules: string;
    refundPolicy: string;
    seoTitle: string;
    seoDescription: string;
    galleryImages: string[];
}

interface WorkshopData {
    id: string;
    title: string;
    subtitle: string | null;
    description: string;
    coverImage: string;
    price: number;
    status: PublishStatus;
    tags: string[];
    metadata: any;
    workshop: {
        location: string | null;
        duration: string | null;
        totalCap: number | null;
        remCap: number | null;
    } | null;
    createdAt: string;
}

const emptyForm: WorkshopForm = {
    title: '',
    subtitle: '',
    description: '',
    coverImage: '',
    price: 0,
    tags: '',
    status: PublishStatus.DRAFT,
    instructor: { name: '', bio: '', avatar: '' },
    scheduleDate: '',
    scheduleLocation: '',
    scheduleDuration: '',
    capacityTotal: 20,
    capacityRemaining: 20,
    registrationDeadline: '',
    attendanceRules: '',
    refundPolicy: '',
    seoTitle: '',
    seoDescription: '',
    galleryImages: [],
};

// ── Main Component ─────────────────────────────────────

export function WorkshopManager() {
    const [workshops, setWorkshops] = useState<WorkshopData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<WorkshopForm>(emptyForm);
    const [isSaving, setIsSaving] = useState(false);

    const fetchWorkshops = useCallback(async () => {
        try {
            const res = await fetch('/api/bff/v1/admin/workshops');
            const json = await res.json();
            if (json.success) setWorkshops(json.data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchWorkshops(); }, [fetchWorkshops]);

    const filtered = workshops.filter(
        (w) => w.title.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setIsModalOpen(true);
    };

    const openEdit = (w: WorkshopData) => {
        const meta = w.metadata || {};
        setEditingId(w.id);
        setForm({
            title: w.title,
            subtitle: w.subtitle || '',
            description: w.description,
            coverImage: w.coverImage,
            price: w.price,
            tags: (w.tags || []).join(', '),
            status: w.status,
            instructor: meta.instructor || { name: '', bio: '', avatar: '' },
            scheduleDate: meta.schedule?.date ? meta.schedule.date.substring(0, 16) : '',
            scheduleLocation: meta.schedule?.location || w.workshop?.location || '',
            scheduleDuration: meta.schedule?.duration || w.workshop?.duration || '',
            capacityTotal: meta.capacity?.total || w.workshop?.totalCap || 0,
            capacityRemaining: meta.capacity?.remaining || w.workshop?.remCap || 0,
            registrationDeadline: meta.registrationDeadline ? meta.registrationDeadline.substring(0, 16) : '',
            attendanceRules: meta.policies?.attendanceRules || '',
            refundPolicy: meta.policies?.refundPolicy || '',
            seoTitle: meta.seo?.title || '',
            seoDescription: meta.seo?.description || '',
            galleryImages: meta.galleryImages || [],
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('確定要刪除此工作坊嗎？此操作無法還原。')) return;
        await fetch(`/api/bff/v1/admin/workshops?id=${id}`, { method: 'DELETE' });
        fetchWorkshops();
    };

    const handleSave = async () => {
        if (!form.title.trim()) return;
        setIsSaving(true);
        try {
            const metadata = {
                instructor: form.instructor,
                schedule: {
                    date: form.scheduleDate ? new Date(form.scheduleDate).toISOString() : null,
                    location: form.scheduleLocation,
                    duration: form.scheduleDuration,
                },
                capacity: {
                    total: form.capacityTotal,
                    remaining: form.capacityRemaining,
                },
                registrationDeadline: form.registrationDeadline ? new Date(form.registrationDeadline).toISOString() : null,
                policies: {
                    attendanceRules: form.attendanceRules,
                    refundPolicy: form.refundPolicy,
                },
                seo: {
                    title: form.seoTitle,
                    description: form.seoDescription,
                },
                galleryImages: form.galleryImages.filter(Boolean),
            };

            const payload = {
                ...(editingId ? { id: editingId } : {}),
                title: form.title,
                subtitle: form.subtitle,
                description: form.description,
                coverImage: form.coverImage,
                price: form.price,
                tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
                status: form.status,
                metadata,
            };

            const method = editingId ? 'PUT' : 'POST';
            await fetch('/api/bff/v1/admin/workshops', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            setIsModalOpen(false);
            setForm(emptyForm);
            setEditingId(null);
            fetchWorkshops();
        } finally {
            setIsSaving(false);
        }
    };

    const updateField = <K extends keyof WorkshopForm>(key: K, value: WorkshopForm[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const addGalleryImage = () => updateField('galleryImages', [...form.galleryImages, '']);
    const removeGalleryImage = (i: number) => updateField('galleryImages', form.galleryImages.filter((_, idx) => idx !== i));
    const updateGalleryImage = (i: number, val: string) =>
        updateField('galleryImages', form.galleryImages.map((v, idx) => (idx === i ? val : v)));

    // ── Render ──────────────────────────────────────────

    const statusConfig: Record<string, { label: string; cls: string }> = {
        [PublishStatus.PUBLISHED]: { label: '已上架', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
        [PublishStatus.DRAFT]: { label: '草稿', cls: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
        [PublishStatus.ARCHIVED]: { label: '已封存', cls: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
    };

    return (
        <div className="flex flex-col h-full bg-black text-white font-sans">
            {/* Top Bar */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-20">
                <div className="flex items-center gap-6">
                    <h1 className="text-xl font-light tracking-wider">工作坊管理</h1>
                    <DBStatusBadge />
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder="搜尋工作坊..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-zinc-900/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-gold/50 transition-colors w-64"
                        />
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={openCreate}
                        className="bg-gold text-black px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg shadow-gold/20"
                    >
                        <Plus size={18} /> 新增工作坊
                    </motion.button>
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                    <AnimatePresence mode="popLayout">
                        {isLoading
                            ? Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="bg-zinc-900/30 border border-white/5 rounded-2xl h-80 animate-pulse" />
                            ))
                            : filtered.map((w, i) => {
                                const meta = w.metadata || {};
                                const status = statusConfig[w.status] || statusConfig[PublishStatus.DRAFT];
                                return (
                                    <motion.div
                                        key={w.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="group bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden hover:border-gold/30 transition-all duration-500"
                                    >
                                        <div className="aspect-[16/10] relative flex items-center justify-center bg-zinc-950">
                                            {w.coverImage ? (
                                                <img src={w.coverImage} alt={w.title} className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700" />
                                            ) : (
                                                <ImageIcon className="text-zinc-800" size={48} />
                                            )}
                                            <div className="absolute top-4 left-4">
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${status.cls}`}>
                                                    {status.label}
                                                </span>
                                            </div>
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px]">
                                                <button onClick={() => openEdit(w)} className="p-3 bg-white text-black rounded-full hover:bg-gold transition-colors">
                                                    <Edit size={20} />
                                                </button>
                                                <button onClick={() => handleDelete(w.id)} className="p-3 bg-white/10 text-white rounded-full hover:bg-red-500/30 border border-white/20 transition-colors">
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <h3 className="font-bold text-lg group-hover:text-gold transition-colors line-clamp-1 mb-1">{w.title}</h3>
                                            <p className="text-xs text-gray-500 mb-3 line-clamp-1">{w.subtitle}</p>
                                            <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                                                {meta.schedule?.date && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        {new Date(meta.schedule.date).toLocaleDateString('zh-TW')}
                                                    </span>
                                                )}
                                                {(meta.schedule?.location || w.workshop?.location) && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin size={12} />
                                                        <span className="line-clamp-1 max-w-[120px]">{meta.schedule?.location || w.workshop?.location}</span>
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest pt-3 border-t border-white/5">
                                                <div className="flex items-center gap-1.5">
                                                    <Users size={12} />
                                                    {meta.capacity?.remaining || w.workshop?.remCap || 0} / {meta.capacity?.total || w.workshop?.totalCap || 0}
                                                </div>
                                                <div className="text-gold font-mono">
                                                    NT$ {w.price.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                    </AnimatePresence>
                </div>
                {!isLoading && filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-500">
                        <Calendar size={48} className="mb-4 opacity-30" />
                        <p className="font-light">尚無工作坊，點擊「新增工作坊」開始</p>
                    </div>
                )}
            </div>

            {/* ── Create / Edit Modal ──────────────────── */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[5vh] overflow-y-auto">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl mb-12">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-white/5">
                                <h2 className="text-lg font-light flex items-center gap-2">
                                    {editingId ? (<><Edit size={18} className="text-gold" /> 編輯工作坊</>) : (<><Plus size={18} className="text-gold" /> 新增工作坊</>)}
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors"><X size={18} className="text-gray-400" /></button>
                            </div>

                            {/* Body */}
                            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                                {/* 基本資訊 */}
                                <SectionTitle title="基本資訊" />
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="工作坊名稱" className="col-span-2">
                                        <input autoFocus type="text" value={form.title} onChange={(e) => updateField('title', e.target.value)} placeholder="輸入名稱" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors" />
                                    </Field>
                                    <Field label="副標題" className="col-span-2">
                                        <input type="text" value={form.subtitle} onChange={(e) => updateField('subtitle', e.target.value)} placeholder="副標題" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors" />
                                    </Field>
                                    <div className="col-span-2">
                                        <ImageUploadField label="封面圖片" value={form.coverImage} onChange={(url) => updateField('coverImage', url)} />
                                    </div>
                                    <Field label="價格 (NT$)">
                                        <input type="number" value={form.price} onChange={(e) => updateField('price', Number(e.target.value))} min={0} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors" />
                                    </Field>
                                    <Field label="狀態">
                                        <div className="relative">
                                            <select value={form.status} onChange={(e) => updateField('status', e.target.value as PublishStatus)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors appearance-none pr-10">
                                                <option value={PublishStatus.DRAFT}>草稿</option>
                                                <option value={PublishStatus.PUBLISHED}>已上架</option>
                                                <option value={PublishStatus.ARCHIVED}>已封存</option>
                                            </select>
                                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                        </div>
                                    </Field>
                                    <Field label="標籤（逗號分隔）" className="col-span-2">
                                        <input type="text" value={form.tags} onChange={(e) => updateField('tags', e.target.value)} placeholder="拉丁音樂, 節奏訓練" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors" />
                                    </Field>
                                    <Field label="描述（支援 HTML）" className="col-span-2">
                                        <textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} rows={5} placeholder="工作坊介紹..." className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors resize-none text-sm" />
                                    </Field>
                                </div>

                                {/* 講師資訊 */}
                                <SectionTitle title="講師資訊" />
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="講師姓名">
                                        <input type="text" value={form.instructor.name} onChange={(e) => updateField('instructor', { ...form.instructor, name: e.target.value })} placeholder="姓名" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors" />
                                    </Field>
                                    <div>
                                        <ImageUploadField label="講師頭像" value={form.instructor.avatar} onChange={(url) => updateField('instructor', { ...form.instructor, avatar: url })} previewClassName="w-14 h-14 rounded-full" />
                                    </div>
                                    <Field label="講師介紹" className="col-span-2">
                                        <textarea value={form.instructor.bio} onChange={(e) => updateField('instructor', { ...form.instructor, bio: e.target.value })} rows={3} placeholder="講師簡介" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors resize-none" />
                                    </Field>
                                </div>

                                {/* 時間地點 */}
                                <SectionTitle title="時間與地點" />
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="活動日期時間">
                                        <input type="datetime-local" value={form.scheduleDate} onChange={(e) => updateField('scheduleDate', e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors" />
                                    </Field>
                                    <Field label="活動時長">
                                        <input type="text" value={form.scheduleDuration} onChange={(e) => updateField('scheduleDuration', e.target.value)} placeholder="3 小時" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors" />
                                    </Field>
                                    <Field label="活動地點" className="col-span-2">
                                        <input type="text" value={form.scheduleLocation} onChange={(e) => updateField('scheduleLocation', e.target.value)} placeholder="地點" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors" />
                                    </Field>
                                    <Field label="名額總數">
                                        <input type="number" value={form.capacityTotal} onChange={(e) => updateField('capacityTotal', Number(e.target.value))} min={0} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors" />
                                    </Field>
                                    <Field label="剩餘名額">
                                        <input type="number" value={form.capacityRemaining} onChange={(e) => updateField('capacityRemaining', Number(e.target.value))} min={0} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors" />
                                    </Field>
                                    <Field label="報名截止時間" className="col-span-2">
                                        <input type="datetime-local" value={form.registrationDeadline} onChange={(e) => updateField('registrationDeadline', e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors" />
                                    </Field>
                                </div>

                                {/* 政策 */}
                                <SectionTitle title="上課須知與退費政策" />
                                <div className="space-y-4">
                                    <Field label="上課須知（支援 HTML）">
                                        <textarea value={form.attendanceRules} onChange={(e) => updateField('attendanceRules', e.target.value)} rows={4} placeholder="<h3>上課須知</h3><ul><li>...</li></ul>" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors resize-none text-sm" />
                                    </Field>
                                    <Field label="退費政策（支援 HTML）">
                                        <textarea value={form.refundPolicy} onChange={(e) => updateField('refundPolicy', e.target.value)} rows={4} placeholder="<h3>退費規則</h3><ul><li>...</li></ul>" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors resize-none text-sm" />
                                    </Field>
                                </div>

                                {/* 活動花絮 */}
                                <SectionTitle title="活動花絮圖片" count={form.galleryImages.length} onAdd={addGalleryImage} />
                                {form.galleryImages.map((url, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="flex-1">
                                            <ImageUploadField label={`圖片 ${i + 1}`} value={url} onChange={(val) => updateGalleryImage(i, val)} previewClassName="w-16 h-16" />
                                        </div>
                                        <button onClick={() => removeGalleryImage(i)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0 mt-5">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}

                                {/* SEO */}
                                <SectionTitle title="SEO 設定" />
                                <div className="grid grid-cols-1 gap-4">
                                    <Field label="SEO 標題">
                                        <input type="text" value={form.seoTitle} onChange={(e) => updateField('seoTitle', e.target.value)} placeholder="頁面標題" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors" />
                                    </Field>
                                    <Field label="SEO 描述">
                                        <textarea value={form.seoDescription} onChange={(e) => updateField('seoDescription', e.target.value)} rows={2} placeholder="頁面描述" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors resize-none" />
                                    </Field>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex gap-4 p-6 border-t border-white/5">
                                <button onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm">取消</button>
                                <button onClick={handleSave} disabled={!form.title.trim() || isSaving} className="flex-1 px-4 py-3 rounded-xl bg-gold text-black font-medium hover:brightness-110 transition-all disabled:opacity-50 disabled:grayscale text-sm">
                                    {isSaving ? '儲存中...' : editingId ? '保存變更' : '建立工作坊'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Sub-components ─────────────────────────────────────

function SectionTitle({ title, count, onAdd }: { title: string; count?: number; onAdd?: () => void }) {
    return (
        <div className="flex items-center justify-between pt-2">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold flex items-center gap-2">
                {title}
                {count !== undefined && <span className="text-gray-500 font-normal">({count})</span>}
            </h3>
            {onAdd && (
                <button onClick={onAdd} className="text-[10px] text-gray-400 hover:text-gold flex items-center gap-1 transition-colors">
                    <Plus size={12} /> 新增
                </button>
            )}
        </div>
    );
}

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
    return (
        <div className={className}>
            <label className="text-xs text-gray-500 uppercase tracking-widest block mb-1">{label}</label>
            {children}
        </div>
    );
}
