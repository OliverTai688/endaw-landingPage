'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { ProductEntity } from '@/domain/models/Product';
import { CreateProductInput, UpdateProductInput } from '@/domain/schemas/ProductSchema';

interface ProductContextType {
    products: ProductEntity[];
    isLoading: boolean;
    fetchProducts: () => Promise<void>;
    saveProduct: (data: CreateProductInput) => Promise<{ success: boolean; error?: string }>;
    updateProduct: (data: UpdateProductInput) => Promise<{ success: boolean; error?: string }>;
    deleteProduct: (id: string) => Promise<{ success: boolean; error?: string }>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
    const [products, setProducts] = useState<ProductEntity[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/bff/v1/admin/products');
            const json = await res.json();
            if (json.success) setProducts(json.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const saveProduct = async (data: CreateProductInput) => {
        try {
            const res = await fetch('/api/bff/v1/admin/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const json = await res.json();
            if (json.success) await fetchProducts();
            return json;
        } catch (err) {
            console.error(err);
            return { success: false, error: 'Failed to save product' };
        }
    };

    const updateProduct = async (data: UpdateProductInput) => {
        try {
            const res = await fetch('/api/bff/v1/admin/products', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const json = await res.json();
            if (json.success) await fetchProducts();
            return json;
        } catch (err) {
            console.error(err);
            return { success: false, error: 'Failed to update product' };
        }
    };

    const deleteProduct = async (id: string) => {
        try {
            const res = await fetch(`/api/bff/v1/admin/products?id=${id}`, {
                method: 'DELETE',
            });
            const json = await res.json();
            if (json.success) await fetchProducts();
            return json;
        } catch (err) {
            console.error(err);
            return { success: false, error: 'Failed to delete product' };
        }
    };

    return (
        <ProductContext.Provider value={{ products, isLoading, fetchProducts, saveProduct, updateProduct, deleteProduct }}>
            {children}
        </ProductContext.Provider>
    );
}

export function useProducts() {
    const context = useContext(ProductContext);
    if (!context) throw new Error('useProducts must be used within ProductProvider');
    return context;
}
