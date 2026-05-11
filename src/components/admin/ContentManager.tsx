"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Trash2,
    Edit,
    Eye,
    ToggleLeft,
    ToggleRight,
    Music as MusicIcon,
    Sparkles,
    Search,
    MoreVertical
} from "lucide-react";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "./RichTextEditor";
import { Upload } from "lucide-react";
import { ContentType, ContentEntity, PublishStatus } from "../../domain/models/Content";
import { useContent } from "../providers/ContentProvider";
import { DBStatusBadge } from "./DBStatusBadge";

export function ContentManager() {
    const { service, refreshContent, isDbConnected } = useContent();
    const [activeTab, setActiveTab] = useState<ContentType>(ContentType.WORKSHOP);
    const [statusFilter, setStatusFilter] = useState<PublishStatus | 'ALL'>('ALL');
    const [items, setItems] = useState<ContentEntity[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ContentEntity | null>(null);
    const [newTitle, setNewTitle] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [newPrice, setNewPrice] = useState(0);
    const router = useRouter();

    useEffect(() => {
        async function fetch() {
            const data = await refreshContent(activeTab);
            setItems(data);
        }
        fetch();
    }, [activeTab, service]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this item?")) return;
        await service?.deleteContent(id);
        const data = await refreshContent(activeTab);
        setItems(data);
    };

    const handleSetStatus = async (id: string, status: PublishStatus) => {
        // @ts-ignore - setStatus added to underlying repository access via service
        await service?.setStatus(id, status);
        const data = await refreshContent(activeTab);
        setItems(data);
    };

    const handleTogglePublish = async (id: string) => {
        await service?.togglePublishStatus(id);
        const data = await refreshContent(activeTab);
        setItems(data);
    };

    const handleCreate = async () => {
        if (!newTitle.trim()) return;

        await service?.createContent({
            title: newTitle,
            description: newDescription || "New content description",
            coverImage: "https://images.unsplash.com/photo-1514525253361-bee243870eb2?w=800&auto=format&fit=crop&q=60",
            price: newPrice,
            tags: [],
            publishStatus: PublishStatus.DRAFT,
            contentType: activeTab,
        });

        const data = await refreshContent(activeTab);
        setItems(data);
        resetForm();
        setIsCreateModalOpen(false);
    };

    const handleUpdate = async () => {
        if (!editingItem || !editingItem.title.trim()) return;

        await service?.updateContent(editingItem.id, {
            title: editingItem.title,
            subtitle: editingItem.subtitle,
            description: editingItem.description,
            price: editingItem.price,
            coverImage: editingItem.coverImage,
            tags: editingItem.tags,
            metadata: editingItem.metadata
        });

        const data = await refreshContent(activeTab);
        setItems(data);
        setIsEditModalOpen(false);
        setEditingItem(null);
    };

    const resetForm = () => {
        setNewTitle("");
        setNewDescription("");
        setNewPrice(0);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.url) {
                if (isEditing && editingItem) {
                    setEditingItem({ ...editingItem, coverImage: data.url });
                } else {
                    // For create modal, it's a bit tricky since we don't have a state for coverImage individually 
                    // in this version, but I'll add an alert for now or just update a new state if needed.
                    // Actually, I should probably allow editing coverImage in Create modal too.
                }
            }
        } catch (err) {
            console.error("Upload failed", err);
        }
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || item.publishStatus === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const STATUS_LABELS: Record<string, string> = {
        '全部': '全部',
        [PublishStatus.PUBLISHED]: '已發佈',
        [PublishStatus.DRAFT]: '草稿',
        [PublishStatus.ARCHIVED]: '已封存',
    };
    const STATUS_COLORS: Record<string, string> = {
        '全部': 'bg-blue-400',
        [PublishStatus.PUBLISHED]: 'bg-emerald-400',
        [PublishStatus.DRAFT]: 'bg-orange-400',
        [PublishStatus.ARCHIVED]: 'bg-gray-400',
    };

    return (
        <div className="flex flex-col h-full bg-black text-white">
            {/* Top Bar */}
            <div className="p-4 md:p-6 border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-20 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-light tracking-wider">內容管理</h1>
                        <DBStatusBadge />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="relative flex-1 min-w-[160px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input
                                type="text"
                                placeholder="搜尋內容..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-zinc-900/50 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold/50 transition-colors"
                            />
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-gold text-black px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 shrink-0"
                        >
                            <Plus size={18} /> 建立新內容
                        </motion.button>
                    </div>
                </div>

                {/* Tablet/Mobile: Horizontal tabs + status filters */}
                <div className="lg:hidden flex flex-col gap-2">
                    <div className="flex gap-2">
                        <TabButton
                            active={activeTab === ContentType.WORKSHOP}
                            onClick={() => setActiveTab(ContentType.WORKSHOP)}
                            icon={<Sparkles size={16} />}
                            label="工作坊"
                        />
                        <TabButton
                            active={activeTab === ContentType.MUSIC}
                            onClick={() => setActiveTab(ContentType.MUSIC)}
                            icon={<MusicIcon size={16} />}
                            label="樂器課程"
                        />
                    </div>
                    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
                        {['全部', PublishStatus.PUBLISHED, PublishStatus.DRAFT, PublishStatus.ARCHIVED].map((status) => {
                            const key = status === '全部' ? 'ALL' : status as any;
                            const isActive = statusFilter === key;
                            return (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(key)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${isActive ? 'bg-white/15 text-white' : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300'}`}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS[status]}`} />
                                    {STATUS_LABELS[status]}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Desktop: Sidebar Tabs */}
                <div className="hidden lg:flex flex-col w-64 border-r border-white/5 p-4 gap-6">
                    <div className="flex flex-col gap-2">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 px-4 mb-2 font-bold">內容類型</p>
                        <TabButton
                            active={activeTab === ContentType.WORKSHOP}
                            onClick={() => setActiveTab(ContentType.WORKSHOP)}
                            icon={<Sparkles size={18} />}
                            label="工作坊"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 px-4 mb-2 font-bold">狀態流程</p>
                        {['全部', PublishStatus.PUBLISHED, PublishStatus.DRAFT, PublishStatus.ARCHIVED].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status === '全部' ? 'ALL' : status as any)}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs transition-all duration-300 ${statusFilter === (status === '全部' ? 'ALL' : status)
                                    ? "bg-white/10 text-white font-medium"
                                    : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
                                    }`}
                            >
                                <div className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS[status]}`} />
                                {STATUS_LABELS[status]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Table */}
                <div className="flex-1 overflow-auto p-4 md:p-6">
                    <div className="bg-zinc-900/30 border border-white/5 rounded-2xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 text-gray-400 text-xs uppercase tracking-widest">
                                    <th className="px-6 py-4 font-medium">內容</th>
                                    <th className="px-6 py-4 font-medium">狀態</th>
                                    <th className="px-6 py-4 font-medium">價格</th>
                                    <th className="px-6 py-4 font-medium text-right">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredItems.map((item) => (
                                    <tr key={item.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-800 border border-white/10 flex-shrink-0">
                                                    <img src={item.coverImage} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white group-hover:text-gold transition-colors">{item.title}</p>
                                                    <p className="text-xs text-gray-500 truncate max-w-xs">{item.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold ${item.publishStatus === PublishStatus.PUBLISHED ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                                item.publishStatus === PublishStatus.ARCHIVED ? "bg-zinc-800 text-gray-500 border border-white/5 opacity-50" :
                                                    "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                                                }`}>
                                {item.publishStatus === PublishStatus.PUBLISHED ? '已發佈' :
                                 item.publishStatus === PublishStatus.DRAFT ? '草稿' : '已封存'}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                            ${item.price}
                        </td>
                        <td className="px-4 py-3 md:px-6 md:py-4">
                            <div className="flex items-center justify-end gap-1">
                                {item.publishStatus !== PublishStatus.ARCHIVED ? (
                                    <>
                                        <button
                                            onClick={() => handleTogglePublish(item.id)}
                                            className={`p-2.5 rounded-lg transition-colors ${item.publishStatus === PublishStatus.PUBLISHED ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'text-gray-400 hover:bg-white/5'}`}
                                            title={item.publishStatus === PublishStatus.PUBLISHED ? "取消發佈" : "發佈"}
                                        >
                                            {item.publishStatus === PublishStatus.PUBLISHED ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                        </button>
                                        <button
                                            onClick={() => handleSetStatus(item.id, PublishStatus.ARCHIVED)}
                                            className="p-2.5 text-gray-500 hover:bg-white/5 rounded-lg transition-colors"
                                            title="封存"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => handleSetStatus(item.id, PublishStatus.DRAFT)}
                                        className="p-2.5 text-gold hover:bg-gold/10 rounded-lg transition-colors"
                                        title="恢復為草稿"
                                    >
                                        <Plus className="rotate-45" size={18} />
                                    </button>
                                )}
                                <div className="w-px h-4 bg-white/10 mx-1" />
                                <button
                                    onClick={() => router.push(`${activeTab === ContentType.WORKSHOP ? "/workshops" : "/music"}?preview=true`)}
                                    className="p-2.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                                    title="預覽"
                                >
                                    <Eye size={18} />
                                </button>
                                <button
                                    onClick={() => {
                                        setEditingItem({ ...item });
                                        setIsEditModalOpen(true);
                                    }}
                                    className="p-2.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                                    title="編輯"
                                >
                                    <Edit size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-2.5 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                                    title="刪除"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>

        {filteredItems.length === 0 && (
            <div className="p-12 text-center">
                <p className="text-gray-500 font-light">此類別尚無內容。</p>
            </div>
        )}
                    </div>
                </div>
            </div>

            {/* Creation Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCreateModalOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 md:p-8 overflow-y-auto flex-1">
                            <h2 className="text-xl font-light mb-6">建立新{activeTab === ContentType.WORKSHOP ? "工作坊" : "樂器課程"}</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-widest block mb-1">標題</label>
                                    <input
                                        autoFocus
                                        type="text"
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        placeholder="輸入標題..."
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-widest block mb-1">價格</label>
                                    <input
                                        type="number"
                                        value={newPrice}
                                        onChange={(e) => setNewPrice(Number(e.target.value))}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-widest block mb-1">描述 (HTML/富文本)</label>
                                    <RichTextEditor
                                        content={newDescription}
                                        onChange={setNewDescription}
                                    />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm"
                                    >
                                        取消
                                    </button>
                                    <button
                                        onClick={handleCreate}
                                        disabled={!newTitle.trim()}
                                        className="flex-1 px-4 py-3 rounded-xl bg-gold text-black font-medium hover:brightness-110 transition-all disabled:opacity-50 disabled:grayscale text-sm"
                                    >
                                        建立項目
                                    </button>
                                </div>
                            </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Modal */}
            <AnimatePresence>
                {isEditModalOpen && editingItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEditModalOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 md:p-8 overflow-y-auto flex-1">
                            <h2 className="text-xl font-light mb-6 flex items-center gap-2">
                                <Edit size={20} className="text-gold" />
                                編輯{activeTab === ContentType.WORKSHOP ? "工作坊" : "樂器課程"}
                            </h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="text-xs text-gray-500 uppercase tracking-widest block mb-1">標題</label>
                                        <input
                                            type="text"
                                            value={editingItem.title}
                                            onChange={(e) => editingItem && setEditingItem({ ...editingItem, title: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs text-gray-500 uppercase tracking-widest block mb-1">副標題</label>
                                        <input
                                            type="text"
                                            value={editingItem.subtitle || ""}
                                            onChange={(e) => editingItem && setEditingItem({ ...editingItem, subtitle: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-widest block mb-1">價格</label>
                                        <input
                                            type="number"
                                            value={editingItem.price}
                                            onChange={(e) => editingItem && setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-widest block mb-1">標籤 (逗號分隔)</label>
                                        <input
                                            type="text"
                                            value={editingItem.tags?.join(", ") || ""}
                                            onChange={(e) => editingItem && setEditingItem({ ...editingItem, tags: e.target.value.split(",").map(t => t.trim()) })}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <div className="flex justify-between items-end mb-1">
                                            <label className="text-xs text-gray-500 uppercase tracking-widest block">封面圖片連結</label>
                                            <label className="cursor-pointer group">
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileUpload(e, true)}
                                                />
                                                <span className="flex items-center gap-1.5 text-[10px] text-gray-500 group-hover:text-gold transition-colors">
                                                    <Upload size={12} />
                                                    上傳圖片
                                                </span>
                                            </label>
                                        </div>
                                        <input
                                            type="text"
                                            value={editingItem.coverImage}
                                            onChange={(e) => editingItem && setEditingItem({ ...editingItem, coverImage: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors text-xs"
                                        />
                                    </div>
                                </div>

                                {/* Dynamic Metadata Fields */}
                                {activeTab === ContentType.WORKSHOP ? (
                                    <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                                        <div className="col-span-2">
                                            <h3 className="text-[10px] uppercase tracking-widest text-gold mb-2 font-bold">工作坊專屬欄位</h3>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-xs text-gray-500 uppercase tracking-widest block mb-1">地點</label>
                                            <input
                                                type="text"
                                                value={editingItem?.metadata?.location || ""}
                                                onChange={(e) => editingItem && setEditingItem({
                                                    ...editingItem,
                                                    metadata: { ...(editingItem.metadata || {}), location: e.target.value }
                                                })}
                                                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase tracking-widest block mb-1">總名額</label>
                                            <input
                                                type="number"
                                                value={editingItem.metadata?.capacity?.total || 20}
                                                onChange={(e) => editingItem && setEditingItem({
                                                    ...editingItem,
                                                    metadata: {
                                                        ...(editingItem.metadata || {}),
                                                        capacity: { ...(editingItem.metadata?.capacity || {}), total: Number(e.target.value) }
                                                    }
                                                })}
                                                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase tracking-widest block mb-1">剩餘名額</label>
                                            <input
                                                type="number"
                                                value={editingItem.metadata?.capacity?.remaining || 20}
                                                onChange={(e) => editingItem && setEditingItem({
                                                    ...editingItem,
                                                    metadata: {
                                                        ...(editingItem.metadata || {}),
                                                        capacity: { ...(editingItem.metadata?.capacity || {}), remaining: Number(e.target.value) }
                                                    }
                                                })}
                                                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/50"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                                        <div className="col-span-2">
                                            <h3 className="text-[10px] uppercase tracking-widest text-blue-400 mb-2 font-bold">樂器課程專屬欄位</h3>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase tracking-widest block mb-1">URL 代碼 (例如: guitar)</label>
                                            <input
                                                type="text"
                                                value={editingItem?.metadata?.nameEn || ""}
                                                onChange={(e) => editingItem && setEditingItem({
                                                    ...editingItem,
                                                    metadata: { ...(editingItem.metadata || {}), nameEn: e.target.value }
                                                })}
                                                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/50"
                                            />
                                        </div>
                                        <div className="flex items-center gap-4 pt-6">
                                            <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={editingItem.metadata?.rentalAvailable || false}
                                                    onChange={(e) => editingItem && setEditingItem({
                                                        ...editingItem,
                                                        metadata: { ...(editingItem.metadata || {}), rentalAvailable: e.target.checked }
                                                    })}
                                                    className="rounded border-white/10 bg-black/50"
                                                />
                                                提供租借
                                            </label>
                                            <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={editingItem.metadata?.containsEquipment || false}
                                                    onChange={(e) => editingItem && setEditingItem({
                                                        ...editingItem,
                                                        metadata: { ...(editingItem.metadata || {}), containsEquipment: e.target.checked }
                                                    })}
                                                    className="rounded border-white/10 bg-black/50"
                                                />
                                                包含器材
                                            </label>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-widest block mb-1">描述 (HTML/富文本)</label>
                                    <RichTextEditor
                                        content={editingItem.description}
                                        onChange={(html) => setEditingItem({ ...editingItem, description: html })}
                                    />
                                </div>

                                {/* Registration Field Builder */}
                                <RegistrationFieldBuilder contentId={editingItem.id} />

                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => {
                                            setIsEditModalOpen(false);
                                            setEditingItem(null);
                                        }}
                                        className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm"
                                    >
                                        放棄
                                    </button>
                                    <button
                                        onClick={handleUpdate}
                                        disabled={!editingItem?.title?.trim()}
                                        className="flex-1 px-4 py-3 rounded-xl bg-gold text-black font-medium hover:brightness-110 transition-all disabled:opacity-50 text-sm"
                                    >
                                        保存變更
                                    </button>
                                </div>
                            </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
}

// ─── Registration Field Builder ───────────────────────────────────────────────

interface RegField {
  id: string;
  label: string;
  type: "TEXT" | "TEXTAREA" | "SELECT" | "CHECKBOX" | "RADIO" | "DATE";
  required: boolean;
  options: string[];
  placeholder: string;
  scope: "ORDER" | "ATTENDEE";
  sortOrder: number;
}

const FIELD_TYPE_LABELS: Record<RegField["type"], string> = {
  TEXT: "單行文字",
  TEXTAREA: "多行文字",
  SELECT: "下拉選單",
  CHECKBOX: "多選框",
  RADIO: "單選",
  DATE: "日期",
};

function emptyField(): Omit<RegField, "id"> {
  return { label: "", type: "TEXT", required: false, options: [], placeholder: "", scope: "ORDER", sortOrder: 0 };
}

function RegistrationFieldBuilder({ contentId }: { contentId: string }) {
  const [fields, setFields] = useState<RegField[]>([]);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Omit<RegField, "id">>(emptyField());
  const [editId, setEditId] = useState<string | null>(null);
  const [optionInput, setOptionInput] = useState("");

  useEffect(() => {
    if (!contentId) return;
    fetch(`/api/bff/v1/admin/content/${contentId}/fields`)
      .then((r) => r.json())
      .then((json) => { if (json.success) setFields(json.data); })
      .catch(console.error);
  }, [contentId]);

  async function saveNew() {
    if (!draft.label.trim()) return;
    const res = await fetch(`/api/bff/v1/admin/content/${contentId}/fields`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...draft, sortOrder: fields.length }),
    });
    const json = await res.json();
    if (json.success) {
      setFields((prev) => [...prev, json.data]);
      setDraft(emptyField());
      setOptionInput("");
      setAdding(false);
    }
  }

  async function saveEdit(id: string) {
    const res = await fetch(`/api/bff/v1/admin/content/${contentId}/fields?fieldId=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const json = await res.json();
    if (json.success) {
      setFields((prev) => prev.map((f) => (f.id === id ? json.data : f)));
      setEditId(null);
    }
  }

  async function deleteField(id: string) {
    if (!confirm("確定刪除此欄位？")) return;
    await fetch(`/api/bff/v1/admin/content/${contentId}/fields?fieldId=${id}`, { method: "DELETE" });
    setFields((prev) => prev.filter((f) => f.id !== id));
  }

  function startEdit(field: RegField) {
    setEditId(field.id);
    setDraft({ label: field.label, type: field.type, required: field.required, options: field.options, placeholder: field.placeholder, scope: field.scope, sortOrder: field.sortOrder });
    setOptionInput(field.options.join(", "));
    setAdding(false);
  }

  const inputCls = "w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/50 transition-colors";

  function FieldForm({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
    const needsOptions = ["SELECT", "CHECKBOX", "RADIO"].includes(draft.type);
    return (
      <div className="border border-gold/20 rounded-xl p-4 space-y-3 bg-gold/5">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">欄位名稱 *</label>
            <input className={inputCls} value={draft.label} onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))} placeholder="如：飲食需求" />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">類型</label>
            <select className={`${inputCls} bg-black`} value={draft.type} onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value as RegField["type"] }))}>
              {Object.entries(FIELD_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">填寫對象</label>
            <select className={`${inputCls} bg-black`} value={draft.scope} onChange={(e) => setDraft((d) => ({ ...d, scope: e.target.value as RegField["scope"] }))}>
              <option value="ORDER">整筆訂單</option>
              <option value="ATTENDEE">每位參加人</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">提示文字（選填）</label>
            <input className={inputCls} value={draft.placeholder} onChange={(e) => setDraft((d) => ({ ...d, placeholder: e.target.value }))} placeholder="輸入提示文字" />
          </div>
          {needsOptions && (
            <div className="col-span-2">
              <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">選項（逗號分隔）</label>
              <input
                className={inputCls}
                value={optionInput}
                onChange={(e) => {
                  setOptionInput(e.target.value);
                  setDraft((d) => ({ ...d, options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }));
                }}
                placeholder="選項A, 選項B, 選項C"
              />
            </div>
          )}
          <div className="col-span-2 flex items-center gap-2">
            <input type="checkbox" id="req-check" checked={draft.required} onChange={(e) => setDraft((d) => ({ ...d, required: e.target.checked }))} className="accent-gold" />
            <label htmlFor="req-check" className="text-xs text-gray-400 cursor-pointer">必填欄位</label>
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onCancel} className="px-3 py-1.5 text-xs text-gray-400 border border-white/10 rounded-lg hover:text-white transition-colors">取消</button>
          <button type="button" onClick={onSave} disabled={!draft.label.trim()} className="px-4 py-1.5 text-xs bg-gold text-black rounded-lg font-medium hover:brightness-110 transition-all disabled:opacity-40">儲存欄位</button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-white/5 pt-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[10px] uppercase tracking-widest text-gold font-bold">報名自定義欄位</h3>
        {!adding && !editId && (
          <button type="button" onClick={() => { setAdding(true); setDraft(emptyField()); setOptionInput(""); }} className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gold border border-white/10 hover:border-gold/40 px-2.5 py-1.5 rounded-lg transition-all">
            <Plus size={11} /> 新增欄位
          </button>
        )}
      </div>

      <div className="space-y-2 mb-3">
        {fields.length === 0 && !adding && (
          <p className="text-xs text-gray-600 py-2">尚無自定義欄位</p>
        )}
        {fields.map((f) => (
          <div key={f.id}>
            {editId === f.id ? (
              <FieldForm onSave={() => saveEdit(f.id)} onCancel={() => setEditId(null)} />
            ) : (
              <div className="flex items-center justify-between bg-white/3 border border-white/8 rounded-lg px-3 py-2">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[10px] bg-white/10 text-gray-400 px-1.5 py-0.5 rounded">{FIELD_TYPE_LABELS[f.type]}</span>
                  <span className="text-xs text-gray-200 truncate">{f.label}</span>
                  {f.required && <span className="text-[10px] text-red-400">必填</span>}
                  <span className="text-[10px] text-gray-600">{f.scope === "ATTENDEE" ? "每人" : "整單"}</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button type="button" onClick={() => startEdit(f)} className="p-1 text-gray-500 hover:text-gold transition-colors"><Edit size={12} /></button>
                  <button type="button" onClick={() => deleteField(f.id)} className="p-1 text-gray-500 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {adding && <FieldForm onSave={saveNew} onCancel={() => setAdding(false)} />}
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-300 ${active
                ? "bg-gold text-black font-medium shadow-lg shadow-gold/20"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
        >
            {icon}
            {label}
        </button>
    );
}
