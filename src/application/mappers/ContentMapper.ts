import { ContentDTO } from "../dto/ContentDTO";
import { ContentEntity, ContentType } from "@/domain/models/Content";

export class ContentMapper {
    static toDTO(entity: ContentEntity): ContentDTO {
        const dto: ContentDTO = {
            id: entity.id,
            title: entity.title,
            subtitle: entity.subtitle,
            description: entity.description,
            coverImage: entity.coverImage,
            price: entity.price,
            tags: entity.tags || [],
            publishStatus: entity.publishStatus,
            contentType: entity.contentType,
            metadata: entity.metadata,
            createdAt: entity.createdAt.toISOString(),
            updatedAt: entity.updatedAt.toISOString(),
        };

        if (entity.contentType === ContentType.WORKSHOP && entity.workshop) {
            dto.workshop = {
                location: entity.workshop.location,
                duration: entity.workshop.duration,
                capacity: {
                    total: entity.workshop.totalCap ?? 0,
                    remaining: entity.workshop.remCap ?? 0,
                }
            };
        }

        if (entity.contentType === ContentType.MUSIC && entity.music) {
            dto.music = {
                nameEn: entity.music.nameEn,
                equipment: {
                    required: entity.music.containsEquipment,
                    description: entity.music.equipmentDescription,
                },
                rental: {
                    available: entity.music.rentalAvailable,
                    offsetAllowed: entity.music.rentalOffsetAllowed,
                }
            };
        }

        return dto;
    }

    static toEntity(dto: Partial<ContentDTO>): Partial<ContentEntity> {
        // Implementation for mapping DTO back to Entity (e.g. for updates)
        return {
            title: dto.title,
            subtitle: dto.subtitle,
            description: dto.description,
            coverImage: dto.coverImage,
            price: dto.price,
            tags: dto.tags,
            publishStatus: dto.publishStatus,
            contentType: dto.contentType,
            // ... more mappings as needed
        };
    }
}
