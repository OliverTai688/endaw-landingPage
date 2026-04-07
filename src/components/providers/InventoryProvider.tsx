'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface InventoryContextType {
    inventory: any[];
    isLoading: boolean;
    fetchInventory: () => Promise<void>;
    adjustStock: (productId: string, amount: number, type: string, reason?: string) => Promise<any>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
    const [inventory, setInventory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchInventory = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/bff/v1/admin/inventory');
            const json = await res.json();
            if (json.success) setInventory(json.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const adjustStock = async (productId: string, amount: number, type: string, reason?: string) => {
        try {
            const res = await fetch('/api/bff/v1/admin/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, amount, type, reason })
            });
            const json = await res.json();
            if (json.success) await fetchInventory();
            return json;
        } catch (err) {
            console.error(err);
            return { success: false, error: 'Adjustment failed' };
        }
    };

    return (
        <InventoryContext.Provider value={{ inventory, isLoading, fetchInventory, adjustStock }}>
            {children}
        </InventoryContext.Provider>
    );
}

export function useInventory() {
    const context = useContext(InventoryContext);
    if (!context) throw new Error('useInventory must be used within InventoryProvider');
    return context;
}
