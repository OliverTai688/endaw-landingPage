import { Prisma } from "@prisma/client";
import { ContentEntity, ContentType, PublishStatus } from "../../domain/models/Content";
import { IContentRepository } from "./IContentRepository";
import prisma from "../../lib/prisma";

type ContentWithRelations = Prisma.ContentGetPayload<{ include: { workshop: true, music: true } }>;

export class PrismaContentRepository implements IContentRepository {
    async create(content: Omit<ContentEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContentEntity> {
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
                // Handle complex relations for Workshop/Music if needed
                ...(content.contentType === ContentType.WORKSHOP ? {
                    workshop: {
                        create: {
                            location: content.metadata?.location,
                            duration: content.metadata?.duration,
                            totalCap: content.metadata?.capacity?.total,
                            remCap: content.metadata?.capacity?.remaining,
                        }
                    }
                } : {}),
                ...(content.contentType === ContentType.MUSIC ? {
                    music: {
                        create: {
                            nameEn: content.metadata?.nameEn,
                            containsEquipment: content.metadata?.containsEquipment,
                            equipmentDescription: content.metadata?.equipmentDescription,
                            rentalAvailable: content.metadata?.rentalAvailable,
                            rentalOffsetAllowed: content.metadata?.rentalOffsetAllowed,
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
        // Fetch existing to get type and current properties if not provided in partial update
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
                // Handle nested updates based on the target type
                ...(contentType === ContentType.WORKSHOP ? {
                    workshop: {
                        upsert: {
                            create: {
                                location: content.metadata?.location || "",
                                duration: content.metadata?.duration || "",
                                totalCap: content.metadata?.capacity?.total || 0,
                                remCap: content.metadata?.capacity?.remaining || 0,
                            },
                            update: {
                                location: content.metadata?.location,
                                duration: content.metadata?.duration,
                                totalCap: content.metadata?.capacity?.total,
                                remCap: content.metadata?.capacity?.remaining,
                            }
                        }
                    }
                } : {}),
                ...(contentType === ContentType.MUSIC ? {
                    music: {
                        upsert: {
                            create: {
                                nameEn: content.metadata?.nameEn || "",
                                containsEquipment: content.metadata?.containsEquipment || false,
                                equipmentDescription: content.metadata?.equipmentDescription || "",
                                rentalAvailable: content.metadata?.rentalAvailable || false,
                                rentalOffsetAllowed: content.metadata?.rentalOffsetAllowed || false,
                            },
                            update: {
                                nameEn: content.metadata?.nameEn,
                                containsEquipment: content.metadata?.containsEquipment,
                                equipmentDescription: content.metadata?.equipmentDescription,
                                rentalAvailable: content.metadata?.rentalAvailable,
                                rentalOffsetAllowed: content.metadata?.rentalOffsetAllowed,
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
        return {
            id: item.id,
            title: item.title,
            subtitle: item.subtitle ?? undefined,
            description: item.description,
            coverImage: item.coverImage,
            price: item.price,
            tags: item.tags,
            publishStatus: item.status as PublishStatus,
            contentType: item.type as ContentType,
            metadata: {
                ...(item.metadata as any),
                // Merge relational data into metadata if it exists
                ...(item.workshop ? {
                    location: item.workshop.location,
                    duration: item.workshop.duration,
                    capacity: {
                        total: item.workshop.totalCap,
                        remaining: item.workshop.remCap
                    }
                } : {}),
                ...(item.music ? {
                    nameEn: item.music.nameEn,
                    containsEquipment: item.music.containsEquipment,
                    equipmentDescription: item.music.equipmentDescription,
                    rentalAvailable: item.music.rentalAvailable,
                    rentalOffsetAllowed: item.music.rentalOffsetAllowed
                } : {})
            },
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
        };
    }
}
