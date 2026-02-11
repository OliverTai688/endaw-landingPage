"use client";

import { CheckCircle2, AlertCircle } from "lucide-react";
import { useContent } from "../providers/ContentProvider";

export function DBStatusBadge() {
    const { isDbConnected, isLoading } = useContent();

    if (isLoading) return <div className="animate-pulse bg-zinc-800 h-6 w-24 rounded-full" />;

    return (
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${isDbConnected
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-amber-500/10 border-amber-500/20 text-amber-400"
            }`}>
            {isDbConnected ? (
                <>
                    <CheckCircle2 size={12} />
                    <span>Database Connected</span>
                </>
            ) : (
                <>
                    <AlertCircle size={12} />
                    <span>Preview Mode (No Persistence)</span>
                </>
            )}
        </div>
    );
}
