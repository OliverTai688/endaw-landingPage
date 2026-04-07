import { z } from "zod";
import { ProductStatus } from "@prisma/client";

export const ProductImageSchema = z.object({
    url: z.string().min(1, "Image URL is required"),
    alt: z.string().optional(),
    sortOrder: z.number().int().default(0),
    isPrimary: z.boolean().default(false),
});

export const ProductVariantSchema = z.object({
    type: z.string().min(1, "Variant type is required"),
    value: z.string().min(1, "Variant value is required"),
    priceAdj: z.number().int().default(0),
});

export const ProductSpecSchema = z.object({
    label: z.string().min(1, "Spec label is required"),
    value: z.string().min(1, "Spec value is required"),
    sortOrder: z.number().int().default(0),
});

export const ProductSchema = z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required"),
    slogan: z.string().optional(),
    shortDescription: z.string().optional(),
    description: z.string().default(""),
    price: z.number().min(0, "Price cannot be negative"),
    currency: z.string().default("TWD"),
    status: z.nativeEnum(ProductStatus).default(ProductStatus.DRAFT),
    images: z.array(ProductImageSchema).optional(),
    variants: z.array(ProductVariantSchema).optional(),
    specs: z.array(ProductSpecSchema).optional(),
});

export const CreateProductSchema = ProductSchema;
export const UpdateProductSchema = ProductSchema.partial().extend({
    id: z.string().min(1),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
