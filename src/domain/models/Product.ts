export enum ProductStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    ARCHIVED = 'ARCHIVED',
}

export interface ProductImageEntity {
    id: string;
    productId: string;
    url: string;
    alt?: string;
    sortOrder: number;
    isPrimary: boolean;
}

export interface ProductVariantEntity {
    id: string;
    productId: string;
    type: string;
    value: string;
    priceAdj: number;
}

export interface ProductSpecEntity {
    id: string;
    productId: string;
    label: string;
    value: string;
    sortOrder: number;
}

export interface ProductEntity {
    id: string;
    slug: string;
    name: string;
    slogan?: string;
    shortDescription?: string;
    description: string;
    price: number;
    currency: string;
    status: ProductStatus;
    images?: ProductImageEntity[];
    variants?: ProductVariantEntity[];
    specs?: ProductSpecEntity[];
    createdAt: Date;
    updatedAt: Date;
}
