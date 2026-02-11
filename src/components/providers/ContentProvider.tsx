"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ContentEntity, ContentType } from '../../domain/models/Content';
import { ContentService } from '../../application/use-cases/ContentUseCases';
import { RepositoryFactory } from '../../infrastructure/RepositoryFactory';

interface ContentContextType {
    service: ContentService | null;
    isDbConnected: boolean;
    refreshContent: (type: ContentType) => Promise<ContentEntity[]>;
    isLoading: boolean;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: ReactNode }) {
    const [service, setService] = useState<ContentService | null>(null);
    const [isDbConnected, setIsDbConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function init() {
            const connected = await RepositoryFactory.isDatabaseConnected();
            const repo = await RepositoryFactory.getRepository();
            const srv = new ContentService(repo);

            setIsDbConnected(connected);
            setService(srv);
            setIsLoading(false);
        }
        init();
    }, []);

    const refreshContent = async (type: ContentType) => {
        if (!service) return [];
        return service.getContentsByType(type);
    };

    return (
        <ContentContext.Provider value={{ service, isDbConnected, refreshContent, isLoading }}>
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
