import { ProductEntity, ProductStatus } from "../../domain/models/Product";
import { IProductRepository } from "../../infrastructure/repositories/IProductRepository";

export class ProductService {
    constructor(private repository: IProductRepository) {}

    async getAllProducts(status?: ProductStatus): Promise<ProductEntity[]> {
        return this.repository.findAll(status);
    }

    async getProductById(id: string): Promise<ProductEntity | null> {
        return this.repository.findById(id);
    }

    async getProductBySlug(slug: string): Promise<ProductEntity | null> {
        return this.repository.findBySlug(slug);
    }

    async createProduct(data: Omit<ProductEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProductEntity> {
        return this.repository.create(data);
    }

    async updateProduct(id: string, data: Partial<ProductEntity>): Promise<ProductEntity> {
        return this.repository.update(id, data);
    }

    async deleteProduct(id: string): Promise<void> {
        return this.repository.delete(id);
    }

    async setStatus(id: string, status: ProductStatus): Promise<ProductEntity> {
        return this.repository.update(id, { status });
    }
}
