"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContentDTO } from "@/application/dto/ContentDTO";
import { ContentType } from "@/domain/models/Content";

export default function DevPage() {
    const [contents, setContents] = useState<ContentDTO[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                // Testing with WORKSHOP type
                const res = await fetch("/api/bff/v1/content?type=WORKSHOP");
                const data = await res.json();
                if (Array.isArray(data)) {
                    setContents(data);
                }
            } catch (error) {
                console.error("Failed to fetch:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const [selectedItem, setSelectedItem] = useState<ContentDTO | null>(null);

    const handlePurchase = async (item: ContentDTO, price: number) => {
        try {
            const res = await fetch("/api/dev/create-demo-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: price,
                    itemName: item.title,
                    type: item.contentType,
                }),
            });
            const data = await res.json();
            if (data.success) {
                window.location.href = `/payment/checkout?orderId=${data.orderId}`;
            } else {
                alert("Failed to create test order: " + data.error);
            }
        } catch (error) {
            console.error(error);
            alert("Error creating order");
        }
    };

    if (selectedItem) {
        return (
            <div className="min-h-screen bg-black text-white p-8 pt-24 max-w-4xl mx-auto space-y-12">
                <button 
                    onClick={() => setSelectedItem(null)}
                    className="text-xs tracking-widest text-gray-500 hover:text-gold transition-colors flex items-center gap-2"
                >
                    ← BACK TO LIST
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="aspect-square relative rounded-2xl overflow-hidden border border-white/5">
                        <img src={selectedItem.coverImage} className="object-cover w-full h-full" alt={selectedItem.title} />
                    </div>
                    <div className="space-y-6">
                        <Badge variant="gold">{selectedItem.contentType}</Badge>
                        <h1 className="text-4xl font-light">{selectedItem.title}</h1>
                        <p className="text-gray-400 text-sm leading-relaxed">{selectedItem.subtitle}</p>
                        
                        <div className="pt-8 space-y-4">
                            <h3 className="text-xs tracking-widest text-gray-500 uppercase">Select a Plan (Simulation)</h3>
                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { name: "體驗方案 (Trial)", price: selectedItem.price, desc: "適合初次嘗試的您" },
                                    { name: "進階方案 (Advanced)", price: selectedItem.price * 3, desc: "包含深度教學與講義" },
                                    { name: "專業方案 (Pro)", price: selectedItem.price * 5, desc: "一對一指導與終身回放" }
                                ].map((plan) => (
                                    <button 
                                        key={plan.name}
                                        onClick={() => handlePurchase(selectedItem, plan.price)}
                                        className="text-left p-4 rounded-xl border border-white/5 bg-white/5 hover:border-gold/40 hover:bg-gold/5 transition-all group"
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-medium group-hover:text-gold transition-colors">{plan.name}</span>
                                            <span className="text-lg font-light text-gold">NT${plan.price.toLocaleString()}</span>
                                        </div>
                                        <p className="text-[10px] text-gray-600">{plan.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-8 pt-24 space-y-8">
            <header className="max-w-4xl mx-auto text-center space-y-4">
                <Badge variant="gold">System Verified</Badge>
                <h1 className="text-4xl font-light tracking-tight text-foreground">
                    BFF & <span className="text-gold">UI System</span>
                </h1>
                <p className="text-muted-foreground">
                    Verifying end-to-end data flow and component integration.
                </p>
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-xs text-amber-200 inline-block">
                    <strong>開發者測試模式：</strong> 點擊下方卡片進入詳情頁並選擇「模擬方案」後，將自動跳轉至綠界結帳。
                </div>
            </header>

            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <div className="h-48 bg-muted rounded-t-xl" />
                            <CardHeader>
                                <div className="h-6 w-2/3 bg-muted rounded" />
                                <div className="h-4 w-full bg-muted rounded" />
                            </CardHeader>
                        </Card>
                    ))
                ) : contents.length > 0 ? (
                    contents.map((item) => (
                        <Card 
                            key={item.id} 
                            onClick={() => setSelectedItem(item)}
                            className="overflow-hidden group cursor-pointer hover:border-gold/30 transition-all active:scale-95"
                        >
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={item.coverImage}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute top-4 right-4">
                                    <Badge variant="secondary" className="backdrop-blur-sm bg-black/50 border-gold/10">
                                        {item.contentType}
                                    </Badge>
                                </div>
                            </div>
                            <CardHeader>
                                <CardTitle>{item.title}</CardTitle>
                                <CardDescription>{item.subtitle}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {item.workshop && (
                                    <div className="text-sm space-y-2 text-muted-foreground">
                                        <p>📍 {item.workshop.location}</p>
                                        <p>⏳ {item.workshop.duration}</p>
                                        <div className="flex justify-between items-center pt-2">
                                            <span className="text-xs uppercase tracking-widest">Capacity</span>
                                            <span className="text-gold font-mono">
                                                {item.workshop.capacity?.remaining} / {item.workshop.capacity?.total}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="border-t border-gold/5 pt-6 justify-between items-center">
                                <span className="text-xl font-light text-white">${item.price}</span>
                                <div className="text-[10px] text-gray-500 uppercase tracking-tighter">View Details →</div>
                            </CardFooter>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full h-64 flex flex-col items-center justify-center border border-dashed border-gold/20 rounded-2xl text-muted-foreground space-y-4">
                        <p>No content found. Please seed the database.</p>
                        <Badge variant="outline">Empty State</Badge>
                    </div>
                )}
            </div>
        </div>
    );
}
