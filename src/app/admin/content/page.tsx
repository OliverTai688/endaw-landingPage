"use client";

import { Suspense } from "react";
import { ContentProvider } from "../../../components/providers/ContentProvider";
import { ContentManager } from "../../../components/admin/ContentManager";

export default function AdminContentPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-full bg-black flex items-center justify-center">
                    <div className="w-10 h-10 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
                </div>
            }
        >
            <ContentProvider>
                <ContentManager />
            </ContentProvider>
        </Suspense>
    );
}
