import { Prisma } from "@prisma/client";
import { ContentEntity, ContentType, PublishStatus, ContentDomain } from "../../domain/models/Content";
import { IContentRepository } from "./IContentRepository";
import prisma from "../../lib/prisma";

type ContentWithRelations = Prisma.ContentGetPayload<{ include: { workshop: true, music: true } }>;

export class PrismaContentRepository implements IContentRepository {
    async create(contentInput: Omit<ContentEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContentEntity> {
        // Technically, contentInput should already be validated by the domain/BFF
        // But we can ensure it here or just spread it
        const content = contentInput; 
        
        const created = await prisma.content.create({
            data: {
                title: content.title,
                subtitle: content.subtitle,
                description: content.description,
                coverImage: content.coverImage,
                price: content.price,
                type: content.contentType as any,
                status: content.publishStatus as any,
                tags: content.tags || [],
                metadata: content.metadata as any,
                ...(content.contentType === ContentType.WORKSHOP && content.workshop ? {
                    workshop: {
                        create: {
                            location: content.workshop.location,
                            duration: content.workshop.duration,
                            totalCap: content.workshop.totalCap,
                            remCap: content.workshop.remCap,
                        }
                    }
                } : {}),
                ...(content.contentType === ContentType.MUSIC && content.music ? {
                    music: {
                        create: {
                            nameEn: content.music.nameEn,
                            containsEquipment: content.music.containsEquipment,
                            equipmentDescription: content.music.equipmentDescription,
                            rentalAvailable: content.music.rentalAvailable,
                            rentalOffsetAllowed: content.music.rentalOffsetAllowed,
                        }
                    }
                } : {})
            },
            include: {
                workshop: true,
                music: true,
            }
        });

        return this.toEntity(created as ContentWithRelations);
    }

    async update(id: string, content: Partial<ContentEntity>): Promise<ContentEntity> {
        const existing = await prisma.content.findUnique({ where: { id } });
        if (!existing) throw new Error("Content not found");

        const contentType = content.contentType || (existing.type as unknown as ContentType);

        const updated = await prisma.content.update({
            where: { id },
            data: {
                title: content.title,
                subtitle: content.subtitle,
                description: content.description,
                coverImage: content.coverImage,
                price: content.price,
                status: content.publishStatus as any,
                tags: content.tags,
                metadata: content.metadata as any,
                ...(contentType === ContentType.WORKSHOP && content.workshop ? {
                    workshop: {
                        upsert: {
                            create: {
                                location: content.workshop.location || "",
                                duration: content.workshop.duration || "",
                                totalCap: content.workshop.totalCap || 0,
                                remCap: content.workshop.remCap || 0,
                            },
                            update: {
                                location: content.workshop.location,
                                duration: content.workshop.duration,
                                totalCap: content.workshop.totalCap,
                                remCap: content.workshop.remCap,
                            }
                        }
                    }
                } : {}),
                ...(contentType === ContentType.MUSIC && content.music ? {
                    music: {
                        upsert: {
                            create: {
                                nameEn: content.music.nameEn || "",
                                containsEquipment: content.music.containsEquipment || false,
                                equipmentDescription: content.music.equipmentDescription || "",
                                rentalAvailable: content.music.rentalAvailable || false,
                                rentalOffsetAllowed: content.music.rentalOffsetAllowed || false,
                            },
                            update: {
                                nameEn: content.music.nameEn,
                                containsEquipment: content.music.containsEquipment,
                                equipmentDescription: content.music.equipmentDescription,
                                rentalAvailable: content.music.rentalAvailable,
                                rentalOffsetAllowed: content.music.rentalOffsetAllowed,
                            }
                        }
                    }
                } : {})
            },
            include: {
                workshop: true,
                music: true,
            }
        });

        return this.toEntity(updated as ContentWithRelations);
    }

    async delete(id: string): Promise<void> {
        await prisma.content.delete({ where: { id } });
    }

    async findAllByType(type: ContentType): Promise<ContentEntity[]> {
        console.log('PrismaContentRepository.findAllByType called with type:', type);
        try {
            const list = await prisma.content.findMany({
                where: { type: type as any },
                /* include: {
                    workshop: true,
                    music: true,
                },
                orderBy: { createdAt: 'desc' } */
            });
            console.log('PrismaContentRepository.findAllByType success, items count:', list.length);
            return list.map((item: any) => this.toEntity(item as ContentWithRelations));
        } catch (error: any) {
            console.error('PrismaContentRepository.findAllByType error:', error);
            throw error;
        }
    }

    async findById(id: string): Promise<ContentEntity | null> {
        const item = await prisma.content.findUnique({
            where: { id },
            include: {
                workshop: true,
                music: true,
            }
        });

        return item ? this.toEntity(item as ContentWithRelations) : null;
    }

    private toEntity(item: ContentWithRelations): ContentEntity {
        const entity: ContentEntity = {
            id: item.id,
            title: item.title,
            subtitle: item.subtitle ?? undefined,
            description: item.description,
            coverImage: item.coverImage,
            price: item.price,
            tags: item.tags,
            publishStatus: item.status as PublishStatus,
            contentType: item.type as ContentType,
            metadata: item.metadata as any,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
        };

        if (item.workshop) {
            entity.workshop = {
                location: item.workshop.location ?? undefined,
                duration: item.workshop.duration ?? undefined,
                totalCap: item.workshop.totalCap ?? undefined,
                remCap: item.workshop.remCap ?? undefined,
            };
        }

        if (item.music) {
            entity.music = {
                nameEn: item.music.nameEn ?? undefined,
                containsEquipment: item.music.containsEquipment,
                equipmentDescription: item.music.equipmentDescription ?? undefined,
                rentalAvailable: item.music.rentalAvailable,
                rentalOffsetAllowed: item.music.rentalOffsetAllowed,
            };
        }

        return entity;
    }
}
