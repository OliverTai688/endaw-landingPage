"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Image as ImageIcon, Type, Info, CheckCircle2, AlertCircle, Camera, Check } from "lucide-react";
import { sendFeedbackEmail } from "@/app/admin/actions";
import { domToPng } from "modern-screenshot";

interface FeedbackOverlayProps {
    children: React.ReactNode;
    pageName: string;
}

export default function FeedbackOverlay({ children, pageName }: FeedbackOverlayProps) {
    const [isInternal, setIsInternal] = useState(false);
    const [isFeedbackMode, setIsFeedbackMode] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedElement, setSelectedElement] = useState<{ context: string; x: number; y: number } | null>(null);
    const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
    const [highlightRect, setHighlightRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

    const [suggestionType, setSuggestionType] = useState<"content" | "image" | "comment">("comment");
    const [content, setContent] = useState("");
    const [imageLink, setImageLink] = useState("");
    const [screenshot, setScreenshot] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

    useEffect(() => {
        const cookies = document.cookie.split('; ');
        const authCookie = cookies.find(row => row.startsWith('internal_access='));
        if (authCookie && authCookie.split('=')[1] === 'true') {
            setIsInternal(true);
        }
    }, []);

    // Handle Hover to show precision highlight
    const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
        if (!isFeedbackMode || showModal) {
            setHighlightRect(null);
            return;
        }

        const target = e.target as HTMLElement;
        if (!target || target.closest('.feedback-ignore')) {
            setHighlightRect(null);
            return;
        }

        const rect = target.getBoundingClientRect();
        setHighlightRect({
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
            height: rect.height
        });
        setHoveredElement(target);
    }, [isFeedbackMode, showModal]);

    const captureScreenshot = async (element: HTMLElement) => {
        setIsCapturing(true);
        try {
            await new Promise(r => setTimeout(r, 200));

            let target = element;

            // Smarter parent selection: if the element is small or absolute, find a stable container
            const style = window.getComputedStyle(element);
            const isSmall = element.offsetWidth < 150 || element.offsetHeight < 40;
            const isAbsolute = style.position === 'absolute' || style.position === 'fixed';

            if (isSmall || isAbsolute || element.tagName === 'SPAN' || element.tagName === 'BUTTON' || element.tagName === 'I') {
                let parent = element.parentElement;
                while (parent && !parent.classList.contains('feedback-ignore')) {
                    // Stop at meaningful containers
                    const pStyle = window.getComputedStyle(parent);
                    if (parent.offsetWidth >= 300 && parent.offsetHeight >= 100) {
                        target = parent;
                        break;
                    }
                    if (pStyle.position === 'relative' && parent.offsetWidth > 200) {
                        target = parent;
                    }
                    parent = parent.parentElement;
                    if (parent && (parent.tagName === 'MAIN' || parent.tagName === 'SECTION' || parent.tagName === 'BODY')) break;
                }
            }

            const dataUrl = await domToPng(target, {
                scale: 1.5,
                backgroundColor: "#000000",
                quality: 1,
                style: {
                    margin: '0',
                    padding: '20px',
                    whiteSpace: target.innerText.includes('NT$') ? 'nowrap' : 'normal',
                    backgroundColor: '#000000',
                },
                filter: (node) => {
                    if (node instanceof HTMLElement && node.classList.contains('feedback-ignore')) {
                        return false;
                    }
                    return true;
                }
            });
            return dataUrl;
        } catch (err) {
            console.error("Screenshot capture failed:", err);
            return null;
        } finally {
            setIsCapturing(false);
        }
    };

    const handleGlobalClick = async (e: MouseEvent) => {
        if (!isFeedbackMode || showModal) return;

        const target = e.target as HTMLElement;
        if (target.closest('.feedback-ignore')) return;

        e.preventDefault();
        e.stopPropagation();

        // Get meaningful context
        let context = target.innerText.slice(0, 50).trim();
        if (!context) {
            const img = target.querySelector('img') || (target.tagName === 'IMG' ? target : null);
            if (img) {
                const htmlImg = img as HTMLImageElement;
                context = `Image: ${htmlImg.alt || htmlImg.src.split('/').pop() || 'unnamed'}`;
            } else {
                context = target.tagName.toLowerCase();
            }
        }

        setSelectedElement({
            context: context || "Selected area",
            x: e.clientX,
            y: e.clientY
        });

        // Capture screenshot of the clicked element or its container
        const snapshot = await captureScreenshot(target);
        setScreenshot(snapshot);

        setShowModal(true);
        setIsFeedbackMode(false); // Exit mode once selected to avoid confusion
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (showModal) setShowModal(false);
                else if (isFeedbackMode) setIsFeedbackMode(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFeedbackMode, showModal]);

    useEffect(() => {
        if (isFeedbackMode && !showModal) {
            document.addEventListener('mousemove', handleGlobalMouseMove);
            document.addEventListener('click', handleGlobalClick, true);
            document.body.style.cursor = 'crosshair';
        } else {
            document.removeEventListener('mousemove', handleGlobalMouseMove);
            document.removeEventListener('click', handleGlobalClick, true);
            document.body.style.cursor = 'default';
            setHighlightRect(null);
        }
        return () => {
            document.removeEventListener('mousemove', handleGlobalMouseMove);
            document.removeEventListener('click', handleGlobalClick, true);
            document.body.style.cursor = 'default';
        };
    }, [isFeedbackMode, showModal, handleGlobalMouseMove]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedElement) return;

        setStatus("sending");
        const res = await sendFeedbackEmail({
            page: pageName,
            pageUrl: window.location.href,
            elementContext: selectedElement.context,
            suggestionType,
            content,
            imageLink: suggestionType === "image" ? imageLink : undefined,
            screenshot: screenshot || undefined
        });

        if (res.success) {
            setStatus("success");
            setTimeout(() => {
                setShowModal(false);
                resetForm();
            }, 2000);
        } else {
            setStatus("error");
        }
    };

    const resetForm = () => {
        setStatus("idle");
        setContent("");
        setImageLink("");
        setSuggestionType("comment");
        setSelectedElement(null);
        setScreenshot(null);
    };

    if (!isInternal) return <>{children}</>;

    return (
        <div className="relative">
            {children}

            {/* Precision Highlight Overlay */}
            <AnimatePresence>
                {highlightRect && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed pointer-events-none z-[90] border-2 border-gold/60 bg-gold/5 rounded-sm transition-all duration-150"
                        style={{
                            top: highlightRect.top - window.scrollY,
                            left: highlightRect.left - window.scrollX,
                            width: highlightRect.width,
                            height: highlightRect.height,
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Feedback Mode Toggle */}
            <div className="fixed bottom-8 left-8 z-[100] feedback-ignore">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsFeedbackMode(!isFeedbackMode)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full shadow-2xl transition-all duration-300 ${isFeedbackMode
                        ? "bg-gold text-black font-bold"
                        : "bg-zinc-900/80 backdrop-blur-md text-white border border-white/20"
                        }`}
                >
                    <MessageSquare size={20} />
                    {isFeedbackMode ? "關閉選取" : "進入修改模式"}
                </motion.button>
            </div>

            <AnimatePresence>
                {showModal && selectedElement && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 feedback-ignore">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !status.startsWith("sending") && setShowModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 0.95, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-xl bg-zinc-900 border border-gold/30 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                                <h3 className="text-xl font-light text-white flex items-center gap-2">
                                    <MessageSquare className="text-gold" size={24} />
                                    提供修改建議
                                </h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors group"
                                >
                                    <X size={20} className="text-zinc-400 group-hover:text-white" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                <form id="feedback-form" onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="p-4 bg-white/10 border border-white/20 rounded-lg shadow-inner">
                                            <p className="text-[10px] text-gold/80 uppercase tracking-widest font-bold mb-1">已選取區域</p>
                                            <p className="text-sm text-zinc-100 font-medium">"{selectedElement.context}"</p>
                                        </div>

                                        {/* Screenshot Preview */}
                                        {screenshot && (
                                            <div className="space-y-2">
                                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-1">
                                                    <Camera size={12} /> 畫面截圖
                                                </p>
                                                <div className="relative w-full rounded-lg border border-white/10 overflow-hidden bg-black/40 flex items-center justify-center p-2 min-h-[160px]">
                                                    <img
                                                        src={screenshot}
                                                        alt="Screenshot context"
                                                        className="max-w-full max-h-[300px] object-contain shadow-2xl rounded-sm"
                                                    />
                                                </div>
                                                <p className="text-[10px] text-zinc-600 text-right italic font-light">
                                                    自動擷取目視範圍
                                                </p>
                                            </div>
                                        )}

                                        <div className="space-y-3">
                                            <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">建議類型</p>
                                            <div className="grid grid-cols-3 gap-3">
                                                {[
                                                    { id: "comment", label: "留言建議", icon: <Info size={16} /> },
                                                    { id: "content", label: "修改內容", icon: <Type size={16} /> },
                                                    { id: "image", label: "更換圖片", icon: <ImageIcon size={16} /> }
                                                ].map((type) => (
                                                    <button
                                                        key={type.id}
                                                        type="button"
                                                        disabled={status === "sending"}
                                                        onClick={() => setSuggestionType(type.id as any)}
                                                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${suggestionType === type.id
                                                            ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]"
                                                            : "bg-white/10 border-white/10 text-white hover:border-white/30"
                                                            }`}
                                                    >
                                                        {type.icon}
                                                        <span className="text-xs font-medium">{type.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {suggestionType === "image" && (
                                            <div className="space-y-2">
                                                <label className="text-xs text-zinc-400 uppercase tracking-widest font-bold">圖片網址 Link</label>
                                                <input
                                                    type="url"
                                                    required
                                                    value={imageLink}
                                                    disabled={status === "sending"}
                                                    onChange={(e) => setImageLink(e.target.value)}
                                                    placeholder="https://example.com/image.jpg"
                                                    className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-[#D4AF37] outline-none transition-all"
                                                />
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <label className="text-xs text-zinc-400 uppercase tracking-widest font-bold">
                                                {suggestionType === "comment" ? "建議描述" : "修改說明 / 新內容"}
                                            </label>
                                            <textarea
                                                required
                                                rows={3}
                                                value={content}
                                                disabled={status === "sending"}
                                                onChange={(e) => setContent(e.target.value)}
                                                placeholder={suggestionType === "comment" ? "請輸入您的建議內容..." : "請輸入要修改後的內容..."}
                                                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-[#D4AF37] outline-none transition-all resize-none shadow-inner"
                                            />
                                        </div>
                                    </div>
                                </form>
                            </div>

                            {/* Footer Submit */}
                            <div className="p-6 border-t border-white/10 bg-white/5">
                                <motion.button
                                    form="feedback-form"
                                    disabled={status === "sending" || status === "success"}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold uppercase tracking-wider transition-all ${status === "success"
                                        ? "bg-green-500 text-white"
                                        : "bg-[#D4AF37] text-black hover:brightness-110 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                                        }`}
                                >
                                    {status === "idle" && <><Send size={18} /> 發送建議</>}
                                    {status === "sending" && "正在傳送..."}
                                    {status === "success" && <><Check size={18} /> 提交成功</>}
                                    {status === "error" && <><AlertCircle size={18} /> 傳送失敗，請重試</>}
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Hint when feedback mode is on */}
            <AnimatePresence>
                {isFeedbackMode && !showModal && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-24 left-8 z-[100] bg-zinc-900/95 backdrop-blur-md border border-gold/50 rounded-lg px-4 py-3 text-sm text-white flex items-center gap-3 shadow-2xl feedback-ignore"
                    >
                        <div className="bg-gold/20 p-1.5 rounded-full">
                            <Info size={16} className="text-gold" />
                        </div>
                        <span className="font-medium tracking-wide">選取您要修改的區塊（已開啟自動截圖）</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
