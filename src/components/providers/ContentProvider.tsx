"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ContentEntity, ContentType, PublishStatus } from '../../domain/models/Content';

interface ContentContextType {
    service: any; // Using a mock service that talks to API
    isDbConnected: boolean;
    refreshContent: (type: ContentType) => Promise<ContentEntity[]>;
    isLoading: boolean;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: ReactNode }) {
    const [isDbConnected, setIsDbConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function checkStatus() {
            try {
                const res = await fetch('/api/admin/db-status');
                const data = await res.json();
                setIsDbConnected(data.connected);
            } catch (e) {
                setIsDbConnected(false);
            } finally {
                setIsLoading(false);
            }
        }
        checkStatus();
    }, []);

    // Mock service that maps method calls to API routes
    const mockService = {
        getContentsByType: async (type: ContentType) => {
            const res = await fetch(`/api/content?type=${type}`);
            return res.json();
        },
        createContent: async (data: any) => {
            const res = await fetch('/api/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            return res.json();
        },
        updateContent: async (id: string, data: any) => {
            const res = await fetch('/api/content', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...data }),
            });
            return res.json();
        },
        deleteContent: async (id: string) => {
            const res = await fetch(`/api/content?id=${id}`, {
                method: 'DELETE',
            });
            return res.json();
        },
        setStatus: async (id: string, status: PublishStatus) => {
            const res = await fetch(`/api/content?id=${id}&action=setStatus`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            return res.json();
        },
        togglePublishStatus: async (id: string) => {
            const res = await fetch(`/api/content?id=${id}&action=togglePublish`, {
                method: 'PATCH',
            });
            return res.json();
        }
    };

    const refreshContent = async (type: ContentType) => {
        return mockService.getContentsByType(type);
    };

    return (
        <ContentContext.Provider value={{ service: mockService, isDbConnected, refreshContent, isLoading }}>
            {children}
        </ContentContext.Provider>
    );
}

export function useContent() {
    const context = useContext(ContentContext);
    if (context === undefined) {
        throw new Error('useContent must be used within a ContentProvider');
    }
    return context;
}
