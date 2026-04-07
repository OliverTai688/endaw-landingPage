import { z } from "zod";
import { ContentType, PublishStatus } from "../models/Content";

export const WorkshopSchema = z.object({
    location: z.string().min(1, "Location is required").optional(),
    duration: z.string().optional(),
    totalCap: z.number().int().min(0).optional(),
    remCap: z.number().int().min(0).optional(),
});

export const MusicSchema = z.object({
    nameEn: z.string().optional(),
    containsEquipment: z.boolean().default(false),
    equipmentDescription: z.string().optional(),
    rentalAvailable: z.boolean().default(false),
    rentalOffsetAllowed: z.boolean().default(false),
});

export const ContentSchema = z.object({
    title: z.string().min(1, "Title is required").max(100),
    subtitle: z.string().max(200).optional(),
    description: z.string().min(1, "Description is required"),
    coverImage: z.string().url("Invalid image URL"),
    price: z.number().min(0, "Price cannot be negative"),
    tags: z.array(z.string()).default([]),
    publishStatus: z.nativeEnum(PublishStatus).default(PublishStatus.DRAFT),
    contentType: z.nativeEnum(ContentType),
    metadata: z.record(z.string(), z.any()).optional(),
    workshop: WorkshopSchema.optional(),
    music: MusicSchema.optional(),
}).refine((data) => {
    if (data.contentType === ContentType.WORKSHOP && !data.workshop) {
        return false;
    }
    if (data.contentType === ContentType.MUSIC && !data.music) {
        return false;
    }
    return true;
}, {
    message: "Specialized metadata is required for the selected content type",
    path: ["contentType"],
});

export const CreateContentSchema = ContentSchema;
export const UpdateContentSchema = ContentSchema.partial();

export type CreateContentInput = z.infer<typeof CreateContentSchema>;
export type UpdateContentInput = z.infer<typeof UpdateContentSchema>;
