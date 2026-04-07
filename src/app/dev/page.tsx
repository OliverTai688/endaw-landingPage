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
                        <Card key={item.id} className="overflow-hidden group">
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
                                <button className="px-4 py-2 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-300 transform active:scale-95">
                                    Book Now
                                </button>
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
