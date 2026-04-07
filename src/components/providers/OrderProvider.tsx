'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { OrderStatus } from '@prisma/client';

interface OrderContextType {
    orders: any[];
    isLoading: boolean;
    fetchOrders: (filter?: OrderStatus | 'ALL') => Promise<void>;
    updateStatus: (id: string, status: OrderStatus, trackingNumber?: string) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchOrders = async (filter: OrderStatus | 'ALL' = 'ALL') => {
        setIsLoading(true);
        try {
            const url = filter === 'ALL' ? '/api/bff/v1/admin/orders' : `/api/bff/v1/admin/orders?status=${filter}`;
            const res = await fetch(url);
            const json = await res.json();
            if (json.success) setOrders(json.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const updateStatus = async (id: string, status: OrderStatus, trackingNumber?: string) => {
        try {
            const res = await fetch(`/api/bff/v1/admin/orders?id=${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, trackingNumber })
            });
            if (res.ok) await fetchOrders();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <OrderContext.Provider value={{ orders, isLoading, fetchOrders, updateStatus }}>
            {children}
        </OrderContext.Provider>
    );
}

export function useOrders() {
    const context = useContext(OrderContext);
    if (!context) throw new Error('useOrders must be used within OrderProvider');
    return context;
}
