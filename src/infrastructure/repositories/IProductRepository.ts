import { ProductEntity, ProductStatus } from "../../domain/models/Product";

export interface IProductRepository {
    create(product: Omit<ProductEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProductEntity>;
    update(id: string, data: Partial<ProductEntity>): Promise<ProductEntity>;
    delete(id: string): Promise<void>;
    findById(id: string): Promise<ProductEntity | null>;
    findAll(status?: ProductStatus): Promise<ProductEntity[]>;
    findBySlug(slug: string): Promise<ProductEntity | null>;
}
