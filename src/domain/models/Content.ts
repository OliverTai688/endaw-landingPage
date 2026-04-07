export enum ContentType {
    WORKSHOP = 'WORKSHOP',
    MUSIC = 'MUSIC',
}

export enum PublishStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    ARCHIVED = 'ARCHIVED',
}

export interface WorkshopEntity {
    location?: string;
    duration?: string;
    totalCap?: number;
    remCap?: number;
}

export interface MusicEntity {
    nameEn?: string;
    containsEquipment: boolean;
    equipmentDescription?: string;
    rentalAvailable: boolean;
    rentalOffsetAllowed: boolean;
}

export interface ContentEntity {
    id: string;
    title: string;
    subtitle?: string;
    description: string;
    coverImage: string;
    price: number;
    tags: string[];
    publishStatus: PublishStatus;
    contentType: ContentType;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    
    // Domain associations
    workshop?: WorkshopEntity;
    music?: MusicEntity;
}

export class ContentDomain {
    static validate(data: unknown) {
        // Dynamic import to avoid circular dependency with ContentSchema
        const { ContentSchema } = require("../schemas/ContentSchema");
        return ContentSchema.parse(data);
    }

    static validateUpdate(data: unknown) {
        const { UpdateContentSchema } = require("../schemas/ContentSchema");
        return UpdateContentSchema.parse(data);
    }

    static create(data: Omit<ContentEntity, 'id'>): Omit<ContentEntity, 'id'> {
        return {
            ...data,
            tags: data.tags || [],
            publishStatus: data.publishStatus || PublishStatus.DRAFT,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }
}
