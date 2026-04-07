import { ContentType, PublishStatus } from "@/domain/models/Content";

export interface ContentDTO {
    id: string;
    title: string;
    subtitle?: string;
    description: string;
    coverImage: string;
    price: number;
    tags: string[];
    publishStatus: PublishStatus;
    contentType: ContentType;
    metadata?: any;
    createdAt: string; // ISO String for transport
    updatedAt: string;
    
    // Flattened or structured payload for specific types
    workshop?: {
        location?: string;
        duration?: string;
        capacity?: {
            total: number;
            remaining: number;
        };
    };
    music?: {
        nameEn?: string;
        equipment: {
            required: boolean;
            description?: string;
        };
        rental: {
            available: boolean;
            offsetAllowed: boolean;
        };
    };
}

export interface CreateContentDTO {
    title: string;
    subtitle?: string;
    description: string;
    coverImage: string;
    price: number;
    tags?: string[];
    contentType: ContentType;
    workshop?: Partial<WorkshopDTO>;
    music?: Partial<MusicDTO>;
}

// Sub-DTOs for cleaner mapping
export interface WorkshopDTO {
    location: string;
    duration: string;
    totalCap: number;
    remCap: number;
}

export interface MusicDTO {
    nameEn: string;
    containsEquipment: boolean;
    equipmentDescription: string;
    rentalAvailable: boolean;
    rentalOffsetAllowed: boolean;
}
