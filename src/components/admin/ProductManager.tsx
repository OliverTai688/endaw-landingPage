'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    X,
    Image as ImageIcon,
    Tag,
    Globe,
    ChevronDown,
} from 'lucide-react';
import { ProductStatus } from '@prisma/client';
import { useProducts } from '../providers/ProductProvider';
import { DBStatusBadge } from './DBStatusBadge';
import { ImageUploadField } from './ImageUploadField';
import type { ProductEntity } from '@/domain/models/Product';

// ── Types ──────────────────────────────────────────────

interface ImageForm {
    url: string;
    alt: string;
    sortOrder: number;
    isPrimary: boolean;
}

interface VariantForm {
    type: string;
    value: string;
    priceAdj: number;
}

interface SpecForm {
    label: string;
    value: string;
    sortOrder: number;
}

interface ProductForm {
    name: string;
    slug: string;
    slogan: string;
    shortDescription: string;
    description: string;
    price: number;
    currency: string;
    status: ProductStatus;
    images: ImageForm[];
    variants: VariantForm[];
    specs: SpecForm[];
}

const emptyForm: ProductForm = {
    name: '',
    slug: '',
    slogan: '',
    shortDescription: '',
    description: '',
    price: 0,
    currency: 'TWD',
    status: ProductStatus.DRAFT,
    images: [],
    variants: [],
    specs: [],
};

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

// ── Main Component ─────────────────────────────────────

export function ProductManager() {
    const { products, isLoading, fetchProducts, saveProduct, updateProduct, deleteProduct } = useProducts();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<ProductForm>(emptyForm);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const filteredProducts = products.filter(
        (p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.slug.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setIsModalOpen(true);
    };

    const openEdit = (product: ProductEntity) => {
        setEditingId(product.id);
        setForm({
            name: product.name,
            slug: product.slug,
            slogan: product.slogan || '',
            shortDescription: product.shortDescription || '',
            description: product.description,
            price: product.price,
            currency: product.currency,
            status: product.status as ProductStatus,
            images: (product.images || []).map((img) => ({
                url: img.url,
                alt: img.alt || '',
                sortOrder: img.sortOrder,
                isPrimary: img.isPrimary,
            })),
            variants: (product.variants || []).map((v) => ({
                type: v.type,
                value: v.value,
                priceAdj: v.priceAdj,
            })),
            specs: (product.specs || []).map((s) => ({
                label: s.label,
                value: s.value,
                sortOrder: s.sortOrder,
            })),
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('確定要刪除此商品嗎？此操作無法還原。')) return;
        await deleteProduct(id);
    };

    const handleSave = async () => {
        if (!form.name.trim() || !form.slug.trim()) return;
        setIsSaving(true);
        try {
            if (editingId) {
                await updateProduct({ id: editingId, ...form });
            } else {
                await saveProduct(form);
            }
            setIsModalOpen(false);
            setForm(emptyForm);
            setEditingId(null);
        } finally {
            setIsSaving(false);
        }
    };

    const updateField = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) => {
        setForm((prev) => {
            const next = { ...prev, [key]: value };
            // auto-generate slug from name when creating
            if (key === 'name' && !editingId) {
                next.slug = slugify(value as string);
            }
            return next;
        });
    };

    // ── Sub-resource helpers ───────────────────────────

    const addImage = () =>
        updateField('images', [...form.images, { url: '', alt: '', sortOrder: form.images.length, isPrimary: form.images.length === 0 }]);
    const removeImage = (i: number) =>
        updateField('images', form.images.filter((_, idx) => idx !== i));
    const updateImage = (i: number, patch: Partial<ImageForm>) =>
        updateField('images', form.images.map((img, idx) => (idx === i ? { ...img, ...patch } : img)));

    const addVariant = () =>
        updateField('variants', [...form.variants, { type: '', value: '', priceAdj: 0 }]);
    const removeVariant = (i: number) =>
        updateField('variants', form.variants.filter((_, idx) => idx !== i));
    const updateVariant = (i: number, patch: Partial<VariantForm>) =>
        updateField('variants', form.variants.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));

    const addSpec = () =>
        updateField('specs', [...form.specs, { label: '', value: '', sortOrder: form.specs.length }]);
    const removeSpec = (i: number) =>
        updateField('specs', form.specs.filter((_, idx) => idx !== i));
    const updateSpec = (i: number, patch: Partial<SpecForm>) =>
        updateField('specs', form.specs.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

    // ── Render ──────────────────────────────────────────

    return (
        <div className="flex flex-col h-full bg-black text-white font-sans">
            {/* Top Bar */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-20">
                <div className="flex items-center gap-6">
                    <h1 className="text-xl font-light tracking-wider">商品管理</h1>
                    <DBStatusBadge />
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder="搜尋商品..."
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
                        <Plus size={18} /> 新增商品
                    </motion.button>
                </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1 overflow-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
                    <AnimatePresence mode="popLayout">
                        {isLoading
                            ? Array.from({ length: 4 }).map((_, i) => (
                                  <div key={i} className="bg-zinc-900/30 border border-white/5 rounded-2xl h-80 animate-pulse" />
                              ))
                            : filteredProducts.map((product, i) => (
                                  <ProductCard
                                      key={product.id}
                                      product={product}
                                      onEdit={() => openEdit(product)}
                                      onDelete={() => handleDelete(product.id)}
                                      index={i}
                                  />
                              ))}
                    </AnimatePresence>
                </div>
                {!isLoading && filteredProducts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-500">
                        <Tag size={48} className="mb-4 opacity-30" />
                        <p className="font-light">尚無商品，點擊「新增商品」開始</p>
                    </div>
                )}
            </div>

            {/* ── Create / Edit Modal ──────────────────── */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[5vh] overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl mb-12"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-white/5">
                                <h2 className="text-lg font-light flex items-center gap-2">
                                    {editingId ? (
                                        <>
                                            <Edit size={18} className="text-gold" /> 編輯商品
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={18} className="text-gold" /> 新增商品
                                        </>
                                    )}
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                    <X size={18} className="text-gray-400" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                                {/* ─ A. 基本資訊 ─ */}
                                <SectionTitle title="基本資訊" />
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="商品名稱" className="col-span-2">
                                        <input
                                            autoFocus
                                            type="text"
                                            value={form.name}
                                            onChange={(e) => updateField('name', e.target.value)}
                                            placeholder="輸入商品名稱"
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors"
                                        />
                                    </Field>
                                    <Field label="Slug (URL 識別碼)">
                                        <input
                                            type="text"
                                            value={form.slug}
                                            onChange={(e) => updateField('slug', e.target.value)}
                                            placeholder="product-slug"
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors font-mono text-sm"
                                        />
                                    </Field>
                                    <Field label="標語 (Slogan)">
                                        <input
                                            type="text"
                                            value={form.slogan}
                                            onChange={(e) => updateField('slogan', e.target.value)}
                                            placeholder="一句話描述"
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors"
                                        />
                                    </Field>
                                    <Field label="簡短描述" className="col-span-2">
                                        <textarea
                                            value={form.shortDescription}
                                            onChange={(e) => updateField('shortDescription', e.target.value)}
                                            placeholder="簡短描述（列表頁顯示）"
                                            rows={2}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors resize-none"
                                        />
                                    </Field>
                                    <Field label="完整描述" className="col-span-2">
                                        <textarea
                                            value={form.description}
                                            onChange={(e) => updateField('description', e.target.value)}
                                            placeholder="詳細商品描述"
                                            rows={4}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors resize-none"
                                        />
                                    </Field>
                                    <Field label="價格">
                                        <input
                                            type="number"
                                            value={form.price}
                                            onChange={(e) => updateField('price', Number(e.target.value))}
                                            min={0}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors"
                                        />
                                    </Field>
                                    <Field label="幣別">
                                        <div className="relative">
                                            <select
                                                value={form.currency}
                                                onChange={(e) => updateField('currency', e.target.value)}
                                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors appearance-none pr-10"
                                            >
                                                <option value="TWD">TWD 新台幣</option>
                                                <option value="USD">USD 美元</option>
                                            </select>
                                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                        </div>
                                    </Field>
                                    <Field label="狀態">
                                        <div className="relative">
                                            <select
                                                value={form.status}
                                                onChange={(e) => updateField('status', e.target.value as ProductStatus)}
                                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors appearance-none pr-10"
                                            >
                                                <option value={ProductStatus.DRAFT}>草稿</option>
                                                <option value={ProductStatus.PUBLISHED}>已上架</option>
                                                <option value={ProductStatus.ARCHIVED}>已封存</option>
                                            </select>
                                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                        </div>
                                    </Field>
                                </div>

                                {/* ─ B. 商品規格 ─ */}
                                <SectionTitle title="商品規格" count={form.specs.length} onAdd={addSpec} />
                                {form.specs.map((spec, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <input
                                            type="text"
                                            value={spec.label}
                                            onChange={(e) => updateSpec(i, { label: e.target.value })}
                                            placeholder="規格名稱（如：材質）"
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors flex-1"
                                        />
                                        <input
                                            type="text"
                                            value={spec.value}
                                            onChange={(e) => updateSpec(i, { value: e.target.value })}
                                            placeholder="規格值（如：不鏽鋼）"
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors flex-1"
                                        />
                                        <button onClick={() => removeSpec(i)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}

                                {/* ─ C. 商品變體 ─ */}
                                <SectionTitle title="商品變體" count={form.variants.length} onAdd={addVariant} />
                                {form.variants.map((variant, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <input
                                            type="text"
                                            value={variant.type}
                                            onChange={(e) => updateVariant(i, { type: e.target.value })}
                                            placeholder="類型（如：尺寸）"
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors w-28"
                                        />
                                        <input
                                            type="text"
                                            value={variant.value}
                                            onChange={(e) => updateVariant(i, { value: e.target.value })}
                                            placeholder="值（如：L）"
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors flex-1"
                                        />
                                        <input
                                            type="number"
                                            value={variant.priceAdj}
                                            onChange={(e) => updateVariant(i, { priceAdj: Number(e.target.value) })}
                                            placeholder="加價"
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors w-24"
                                        />
                                        <button onClick={() => removeVariant(i)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}

                                {/* ─ D. 商品圖片 ─ */}
                                <SectionTitle title="商品圖片" count={form.images.length} onAdd={addImage} />
                                {form.images.map((img, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 bg-black/30 rounded-xl border border-white/5">
                                        <div className="w-16 h-16 rounded-lg bg-zinc-800 border border-white/10 flex-shrink-0 overflow-hidden flex items-center justify-center">
                                            {img.url ? (
                                                <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon size={20} className="text-zinc-600" />
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <ImageUploadField
                                                label={`圖片 ${i + 1}`}
                                                value={img.url}
                                                onChange={(url) => updateImage(i, { url })}
                                                showPreview={false}
                                            />
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={img.alt}
                                                    onChange={(e) => updateImage(i, { alt: e.target.value })}
                                                    placeholder="Alt 描述"
                                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors text-xs flex-1"
                                                />
                                                <label className="flex items-center gap-1.5 text-[10px] text-gray-400 cursor-pointer whitespace-nowrap">
                                                    <input
                                                        type="checkbox"
                                                        checked={img.isPrimary}
                                                        onChange={(e) => {
                                                            // only one primary at a time
                                                            const updated = form.images.map((im, idx) => ({
                                                                ...im,
                                                                isPrimary: idx === i ? e.target.checked : false,
                                                            }));
                                                            updateField('images', updated);
                                                        }}
                                                        className="rounded border-white/10 bg-black/50"
                                                    />
                                                    主圖
                                                </label>
                                            </div>
                                        </div>
                                        <button onClick={() => removeImage(i)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Modal Footer */}
                            <div className="flex gap-4 p-6 border-t border-white/5">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={!form.name.trim() || !form.slug.trim() || isSaving}
                                    className="flex-1 px-4 py-3 rounded-xl bg-gold text-black font-medium hover:brightness-110 transition-all disabled:opacity-50 disabled:grayscale text-sm"
                                >
                                    {isSaving ? '儲存中...' : editingId ? '保存變更' : '建立商品'}
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

function ProductCard({ product, onEdit, onDelete, index }: { product: ProductEntity; onEdit: () => void; onDelete: () => void; index: number }) {
    const statusConfig: Record<string, { label: string; cls: string }> = {
        [ProductStatus.PUBLISHED]: { label: '已上架', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
        [ProductStatus.DRAFT]: { label: '草稿', cls: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
        [ProductStatus.ARCHIVED]: { label: '已封存', cls: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
    };
    const status = statusConfig[product.status] || statusConfig[ProductStatus.DRAFT];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="group bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden hover:border-gold/30 transition-all duration-500"
        >
            <div className="aspect-square relative flex items-center justify-center bg-zinc-950">
                {product.images?.[0] ? (
                    <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-105 transition-all duration-700"
                    />
                ) : (
                    <ImageIcon className="text-zinc-800" size={48} />
                )}

                <div className="absolute top-4 left-4">
                    <span
                        className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${status.cls}`}
                    >
                        {status.label}
                    </span>
                </div>

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px]">
                    <button onClick={onEdit} className="p-3 bg-white text-black rounded-full hover:bg-gold transition-colors">
                        <Edit size={20} />
                    </button>
                    <button onClick={onDelete} className="p-3 bg-white/10 text-white rounded-full hover:bg-red-500/30 border border-white/20 transition-colors">
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

            <div className="p-5">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-lg group-hover:text-gold transition-colors line-clamp-1">{product.name}</h3>
                    <div className="font-mono text-sm text-gold">${product.price.toLocaleString()}</div>
                </div>
                <p className="text-xs text-gray-500 font-mono tracking-tighter mb-4">{product.slug}</p>

                <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest pt-4 border-t border-white/5">
                    <div className="flex items-center gap-1.5 text-blue-400">
                        <Tag size={12} /> {(product as any).inventory?.currentStock || 0} IN STOCK
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Globe size={12} /> {product.currency}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

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
