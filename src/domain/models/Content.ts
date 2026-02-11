export enum ContentType {
    WORKSHOP = 'WORKSHOP',
    MUSIC = 'MUSIC',
}

export enum PublishStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    ARCHIVED = 'ARCHIVED',
}

export interface ContentEntity {
    id: string;
    title: string;
    subtitle?: string;
    description: string;
    coverImage: string;
    price: number;
    tags?: string[];
    publishStatus: PublishStatus;
    contentType: ContentType;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
