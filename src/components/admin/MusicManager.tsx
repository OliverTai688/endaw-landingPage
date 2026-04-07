'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Edit, Trash2, X, Music2,
    ChevronDown, ChevronRight, Image as ImageIcon,
} from 'lucide-react';
import { PublishStatus } from '@prisma/client';
import { DBStatusBadge } from './DBStatusBadge';
import { ImageUploadField } from './ImageUploadField';

// ── Types ──────────────────────────────────────────────

interface PackageForm {
    name: string;
    lessonCount: number;
    bonusLessons: number;
    validDuration: number;
    firstClassDate: string;
    formationRequired: boolean;
    formationDecisionDays: number;
    refundPolicy: string;
    price: number;
    status: string;
    highlights: string;
    includedEquipment: string;
}

interface LevelForm {
    name: string;
    packages: PackageForm[];
}

interface FAQForm {
    question: string;
    answer: string;
}

interface InstrumentForm {
    name: string;
    nameEn: string;
    coverImage: string;
    description: string;
    containsEquipment: boolean;
    equipmentDescription: string;
    rentalAvailable: boolean;
    rentalOffsetAllowed: boolean;
    levels: LevelForm[];
    faqs: FAQForm[];
}

interface InstrumentData {
    id: string;
    name: string;
    nameEn: string;
    coverImage: string;
    description: string;
    containsEquipment: boolean;
    equipmentDescription: string | null;
    rentalAvailable: boolean;
    rentalOffsetAllowed: boolean;
    levels: any[];
    faqs: any[];
}

const emptyPackage: PackageForm = {
    name: '', lessonCount: 1, bonusLessons: 0, validDuration: 3,
    firstClassDate: '', formationRequired: false, formationDecisionDays: 0,
    refundPolicy: '', price: 0, status: 'DRAFT', highlights: '', includedEquipment: '',
};

const emptyForm: InstrumentForm = {
    name: '', nameEn: '', coverImage: '', description: '',
    containsEquipment: false, equipmentDescription: '',
    rentalAvailable: false, rentalOffsetAllowed: false,
    levels: [], faqs: [],
};

function slugify(text: string): string {
    return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

// ── Main Component ─────────────────────────────────────

export function MusicManager() {
    const [instruments, setInstruments] = useState<InstrumentData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<InstrumentForm>(emptyForm);
    const [isSaving, setIsSaving] = useState(false);
    const [expandedLevel, setExpandedLevel] = useState<number | null>(null);

    const fetchInstruments = useCallback(async () => {
        try {
            const res = await fetch('/api/bff/v1/admin/music');
            const json = await res.json();
            if (json.success) setInstruments(json.data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchInstruments(); }, [fetchInstruments]);

    const filtered = instruments.filter(
        (i) => i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.nameEn.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setExpandedLevel(null);
        setIsModalOpen(true);
    };

    const openEdit = (inst: InstrumentData) => {
        setEditingId(inst.id);
        setForm({
            name: inst.name,
            nameEn: inst.nameEn,
            coverImage: inst.coverImage,
            description: inst.description,
            containsEquipment: inst.containsEquipment,
            equipmentDescription: inst.equipmentDescription || '',
            rentalAvailable: inst.rentalAvailable,
            rentalOffsetAllowed: inst.rentalOffsetAllowed,
            levels: (inst.levels || []).map((level: any) => ({
                name: level.name,
                packages: (level.packages || []).map((pkg: any) => ({
                    name: pkg.name,
                    lessonCount: pkg.lessonCount,
                    bonusLessons: pkg.bonusLessons,
                    validDuration: pkg.validDuration,
                    firstClassDate: pkg.firstClassDate ? new Date(pkg.firstClassDate).toISOString().substring(0, 16) : '',
                    formationRequired: pkg.formationRequired,
                    formationDecisionDays: pkg.formationDecisionDays,
                    refundPolicy: pkg.refundPolicy,
                    price: pkg.price,
                    status: pkg.status,
                    highlights: (pkg.highlights || []).join(', '),
                    includedEquipment: (pkg.includedEquipment || []).join(', '),
                })),
            })),
            faqs: (inst.faqs || []).map((faq: any) => ({
                question: faq.question,
                answer: faq.answer,
            })),
        });
        setExpandedLevel(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('確定要刪除此樂器課程嗎？所有相關的等級、套票和 FAQ 都會被刪除。')) return;
        await fetch(`/api/bff/v1/admin/music?id=${id}`, { method: 'DELETE' });
        fetchInstruments();
    };

    const handleSave = async () => {
        if (!form.name.trim() || !form.nameEn.trim()) return;
        setIsSaving(true);
        try {
            const payload = {
                ...(editingId ? { id: editingId } : {}),
                name: form.name,
                nameEn: form.nameEn,
                coverImage: form.coverImage,
                description: form.description,
                containsEquipment: form.containsEquipment,
                equipmentDescription: form.equipmentDescription || null,
                rentalAvailable: form.rentalAvailable,
                rentalOffsetAllowed: form.rentalOffsetAllowed,
                levels: form.levels.map((level) => ({
                    name: level.name,
                    packages: level.packages.map((pkg) => ({
                        name: pkg.name,
                        lessonCount: pkg.lessonCount,
                        bonusLessons: pkg.bonusLessons,
                        validDuration: pkg.validDuration,
                        firstClassDate: pkg.firstClassDate ? new Date(pkg.firstClassDate).toISOString() : null,
                        registrationStartDates: [],
                        formationRequired: pkg.formationRequired,
                        formationDecisionDays: pkg.formationDecisionDays,
                        refundPolicy: pkg.refundPolicy,
                        price: pkg.price,
                        status: pkg.status,
                        highlights: pkg.highlights.split(',').map((s: string) => s.trim()).filter(Boolean),
                        includedEquipment: pkg.includedEquipment.split(',').map((s: string) => s.trim()).filter(Boolean),
                    })),
                })),
                faqs: form.faqs.map((faq) => ({
                    question: faq.question,
                    answer: faq.answer,
                })),
            };

            const method = editingId ? 'PUT' : 'POST';
            await fetch('/api/bff/v1/admin/music', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            setIsModalOpen(false);
            setForm(emptyForm);
            setEditingId(null);
            fetchInstruments();
        } finally {
            setIsSaving(false);
        }
    };

    const updateField = <K extends keyof InstrumentForm>(key: K, value: InstrumentForm[K]) => {
        setForm((prev) => {
            const next = { ...prev, [key]: value };
            if (key === 'name' && !editingId) {
                next.nameEn = slugify(value as string);
            }
            return next;
        });
    };

    // Level helpers
    const addLevel = () => updateField('levels', [...form.levels, { name: '', packages: [] }]);
    const removeLevel = (i: number) => updateField('levels', form.levels.filter((_, idx) => idx !== i));
    const updateLevel = (i: number, patch: Partial<LevelForm>) =>
        updateField('levels', form.levels.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

    // Package helpers
    const addPackage = (li: number) => {
        const levels = [...form.levels];
        levels[li] = { ...levels[li], packages: [...levels[li].packages, { ...emptyPackage }] };
        updateField('levels', levels);
    };
    const removePackage = (li: number, pi: number) => {
        const levels = [...form.levels];
        levels[li] = { ...levels[li], packages: levels[li].packages.filter((_, idx) => idx !== pi) };
        updateField('levels', levels);
    };
    const updatePackage = (li: number, pi: number, patch: Partial<PackageForm>) => {
        const levels = [...form.levels];
        levels[li] = {
            ...levels[li],
            packages: levels[li].packages.map((p, idx) => (idx === pi ? { ...p, ...patch } : p)),
        };
        updateField('levels', levels);
    };

    // FAQ helpers
    const addFaq = () => updateField('faqs', [...form.faqs, { question: '', answer: '' }]);
    const removeFaq = (i: number) => updateField('faqs', form.faqs.filter((_, idx) => idx !== i));
    const updateFaq = (i: number, patch: Partial<FAQForm>) =>
        updateField('faqs', form.faqs.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));

    // ── Render ──────────────────────────────────────────

    return (
        <div className="flex flex-col h-full bg-black text-white font-sans">
            {/* Top Bar */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-20">
                <div className="flex items-center gap-6">
                    <h1 className="text-xl font-light tracking-wider">樂器課程管理</h1>
                    <DBStatusBadge />
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input type="text" placeholder="搜尋樂器..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-zinc-900/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-gold/50 transition-colors w-64" />
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openCreate} className="bg-gold text-black px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg shadow-gold/20">
                        <Plus size={18} /> 新增樂器
                    </motion.button>
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
                    <AnimatePresence mode="popLayout">
                        {isLoading
                            ? Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="bg-zinc-900/30 border border-white/5 rounded-2xl h-80 animate-pulse" />
                            ))
                            : filtered.map((inst, i) => {
                                const totalPkgs = inst.levels.reduce((sum: number, l: any) => sum + (l.packages?.length || 0), 0);
                                return (
                                    <motion.div
                                        key={inst.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="group bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden hover:border-gold/30 transition-all duration-500"
                                    >
                                        <div className="aspect-[4/3] relative flex items-center justify-center bg-zinc-950">
                                            {inst.coverImage ? (
                                                <img src={inst.coverImage} alt={inst.name} className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700" />
                                            ) : (
                                                <ImageIcon className="text-zinc-800" size={48} />
                                            )}
                                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                                {inst.rentalAvailable && (
                                                    <span className="px-2 py-1 rounded-md text-[10px] font-bold backdrop-blur-md border bg-blue-500/10 text-blue-400 border-blue-500/20">可租借</span>
                                                )}
                                                {inst.containsEquipment && (
                                                    <span className="px-2 py-1 rounded-md text-[10px] font-bold backdrop-blur-md border bg-green-500/10 text-green-400 border-green-500/20">含器材</span>
                                                )}
                                            </div>
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px]">
                                                <button onClick={() => openEdit(inst)} className="p-3 bg-white text-black rounded-full hover:bg-gold transition-colors">
                                                    <Edit size={20} />
                                                </button>
                                                <button onClick={() => handleDelete(inst.id)} className="p-3 bg-white/10 text-white rounded-full hover:bg-red-500/30 border border-white/20 transition-colors">
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <h3 className="font-bold text-lg group-hover:text-gold transition-colors line-clamp-1 mb-1">{inst.name}</h3>
                                            <p className="text-xs text-gray-500 font-mono tracking-tighter mb-3">{inst.nameEn}</p>
                                            <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest pt-3 border-t border-white/5">
                                                <div className="flex items-center gap-1.5">
                                                    <Music2 size={12} />
                                                    {inst.levels.length} 等級 · {totalPkgs} 套票
                                                </div>
                                                <div>{inst.faqs.length} FAQ</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                    </AnimatePresence>
                </div>
                {!isLoading && filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-500">
                        <Music2 size={48} className="mb-4 opacity-30" />
                        <p className="font-light">尚無樂器課程，點擊「新增樂器」開始</p>
                    </div>
                )}
            </div>

            {/* ── Create / Edit Modal ──────────────────── */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[5vh] overflow-y-auto">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-3xl bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl mb-12">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-white/5">
                                <h2 className="text-lg font-light flex items-center gap-2">
                                    {editingId ? (<><Edit size={18} className="text-gold" /> 編輯樂器課程</>) : (<><Plus size={18} className="text-gold" /> 新增樂器課程</>)}
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors"><X size={18} className="text-gray-400" /></button>
                            </div>

                            {/* Body */}
                            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                                {/* 基本資訊 */}
                                <SectionTitle title="基本資訊" />
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="樂器名稱">
                                        <input autoFocus type="text" value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="如：吉他" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors" />
                                    </Field>
                                    <Field label="英文名稱 (URL)">
                                        <input type="text" value={form.nameEn} onChange={(e) => updateField('nameEn', e.target.value)} placeholder="guitar" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors font-mono text-sm" />
                                    </Field>
                                    <div className="col-span-2">
                                        <ImageUploadField label="封面圖片" value={form.coverImage} onChange={(url) => updateField('coverImage', url)} />
                                    </div>
                                    <Field label="課程介紹（支援 HTML）" className="col-span-2">
                                        <textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} rows={4} placeholder="<h2>課程介紹</h2><p>...</p>" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors resize-none text-sm" />
                                    </Field>
                                </div>

                                {/* 器材與租借 */}
                                <SectionTitle title="器材與租借" />
                                <div className="grid grid-cols-2 gap-4">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" checked={form.containsEquipment} onChange={(e) => updateField('containsEquipment', e.target.checked)} className="rounded border-white/10 bg-black/50" />
                                        <span className="text-sm text-gray-300">含器材</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" checked={form.rentalAvailable} onChange={(e) => updateField('rentalAvailable', e.target.checked)} className="rounded border-white/10 bg-black/50" />
                                        <span className="text-sm text-gray-300">可租借</span>
                                    </label>
                                    {form.containsEquipment && (
                                        <Field label="器材說明" className="col-span-2">
                                            <input type="text" value={form.equipmentDescription} onChange={(e) => updateField('equipmentDescription', e.target.value)} placeholder="如：贈送鼓棒一組" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors" />
                                        </Field>
                                    )}
                                    {form.rentalAvailable && (
                                        <label className="flex items-center gap-3 cursor-pointer col-span-2">
                                            <input type="checkbox" checked={form.rentalOffsetAllowed} onChange={(e) => updateField('rentalOffsetAllowed', e.target.checked)} className="rounded border-white/10 bg-black/50" />
                                            <span className="text-sm text-gray-300">租金可折抵購買</span>
                                        </label>
                                    )}
                                </div>

                                {/* 課程等級 */}
                                <SectionTitle title="課程等級" count={form.levels.length} onAdd={addLevel} />
                                {form.levels.map((level, li) => (
                                    <div key={li} className="border border-white/10 rounded-xl overflow-hidden">
                                        <div
                                            className="flex items-center justify-between p-4 bg-black/30 cursor-pointer"
                                            onClick={() => setExpandedLevel(expandedLevel === li ? null : li)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <ChevronRight size={14} className={`text-gray-400 transition-transform ${expandedLevel === li ? 'rotate-90' : ''}`} />
                                                <input
                                                    type="text"
                                                    value={level.name}
                                                    onChange={(e) => { e.stopPropagation(); updateLevel(li, { name: e.target.value }); }}
                                                    onClick={(e) => e.stopPropagation()}
                                                    placeholder="等級名稱（如：初學者）"
                                                    className="bg-transparent border-none text-white focus:outline-none text-sm font-medium"
                                                />
                                                <span className="text-[10px] text-gray-500">({level.packages.length} 套票)</span>
                                            </div>
                                            <button onClick={(e) => { e.stopPropagation(); removeLevel(li); }} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>

                                        {expandedLevel === li && (
                                            <div className="p-4 space-y-4 border-t border-white/5">
                                                {level.packages.map((pkg, pi) => (
                                                    <div key={pi} className="p-4 bg-black/20 rounded-xl border border-white/5 space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[10px] text-gold uppercase tracking-widest font-bold">套票 {pi + 1}</span>
                                                            <button onClick={() => removePackage(li, pi)} className="p-1 text-gray-500 hover:text-red-400 transition-colors">
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <Field label="套票名稱" className="col-span-2">
                                                                <input type="text" value={pkg.name} onChange={(e) => updatePackage(li, pi, { name: e.target.value })} placeholder="如：吉他入門體驗" className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-gold/50 transition-colors" />
                                                            </Field>
                                                            <Field label="堂數">
                                                                <input type="number" value={pkg.lessonCount} onChange={(e) => updatePackage(li, pi, { lessonCount: Number(e.target.value) })} min={1} className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-gold/50 transition-colors" />
                                                            </Field>
                                                            <Field label="贈送堂數">
                                                                <input type="number" value={pkg.bonusLessons} onChange={(e) => updatePackage(li, pi, { bonusLessons: Number(e.target.value) })} min={0} className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-gold/50 transition-colors" />
                                                            </Field>
                                                            <Field label="價格 (NT$)">
                                                                <input type="number" value={pkg.price} onChange={(e) => updatePackage(li, pi, { price: Number(e.target.value) })} min={0} className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-gold/50 transition-colors" />
                                                            </Field>
                                                            <Field label="有效月數">
                                                                <input type="number" value={pkg.validDuration} onChange={(e) => updatePackage(li, pi, { validDuration: Number(e.target.value) })} min={1} className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-gold/50 transition-colors" />
                                                            </Field>
                                                            <Field label="狀態">
                                                                <div className="relative">
                                                                    <select value={pkg.status} onChange={(e) => updatePackage(li, pi, { status: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-gold/50 transition-colors appearance-none pr-8">
                                                                        <option value="DRAFT">草稿</option>
                                                                        <option value="PUBLISHED">已上架</option>
                                                                    </select>
                                                                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                                                </div>
                                                            </Field>
                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                <input type="checkbox" checked={pkg.formationRequired} onChange={(e) => updatePackage(li, pi, { formationRequired: e.target.checked })} className="rounded border-white/10 bg-black/50" />
                                                                <span className="text-xs text-gray-300">需成班</span>
                                                            </label>
                                                            <Field label="亮點（逗號分隔）" className="col-span-2">
                                                                <input type="text" value={pkg.highlights} onChange={(e) => updatePackage(li, pi, { highlights: e.target.value })} placeholder="買五送一, 三個月完成" className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-gold/50 transition-colors" />
                                                            </Field>
                                                            <Field label="退費政策" className="col-span-2">
                                                                <textarea value={pkg.refundPolicy} onChange={(e) => updatePackage(li, pi, { refundPolicy: e.target.value })} rows={2} placeholder="退費規則..." className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-gold/50 transition-colors resize-none" />
                                                            </Field>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button onClick={() => addPackage(li)} className="w-full py-2 border border-dashed border-white/10 rounded-xl text-xs text-gray-400 hover:text-gold hover:border-gold/30 transition-colors flex items-center justify-center gap-1">
                                                    <Plus size={12} /> 新增套票
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* FAQ */}
                                <SectionTitle title="常見問題 FAQ" count={form.faqs.length} onAdd={addFaq} />
                                {form.faqs.map((faq, i) => (
                                    <div key={i} className="space-y-2 p-3 bg-black/20 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <input type="text" value={faq.question} onChange={(e) => updateFaq(i, { question: e.target.value })} placeholder="問題" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-gold/50 transition-colors flex-1" />
                                            <button onClick={() => removeFaq(i)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <textarea value={faq.answer} onChange={(e) => updateFaq(i, { answer: e.target.value })} placeholder="回答" rows={2} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-gold/50 transition-colors resize-none" />
                                    </div>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="flex gap-4 p-6 border-t border-white/5">
                                <button onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm">取消</button>
                                <button onClick={handleSave} disabled={!form.name.trim() || !form.nameEn.trim() || isSaving} className="flex-1 px-4 py-3 rounded-xl bg-gold text-black font-medium hover:brightness-110 transition-all disabled:opacity-50 disabled:grayscale text-sm">
                                    {isSaving ? '儲存中...' : editingId ? '保存變更' : '建立樂器課程'}
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
