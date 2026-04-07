import { ProductInventoryEntity, StockAdjustmentEntity, AdjustmentType } from "../../domain/models/Inventory";
import { IInventoryRepository } from "../../infrastructure/repositories/IInventoryRepository";

export class InventoryService {
    constructor(private repository: IInventoryRepository) {}

    async getAllInventory(): Promise<ProductInventoryEntity[]> {
        return this.repository.findAll();
    }

    async getByProductId(productId: string): Promise<ProductInventoryEntity | null> {
        return this.repository.findByProductId(productId);
    }

    async getLowStockAlerts(): Promise<ProductInventoryEntity[]> {
        return this.repository.findLowStock();
    }

    async adjustStock(
        productId: string,
        type: AdjustmentType,
        quantity: number,
        reason?: string,
        adjustedBy?: string,
    ): Promise<ProductInventoryEntity> {
        return this.repository.adjustStock(productId, type, quantity, reason, adjustedBy);
    }

    async getAdjustmentHistory(productId: string): Promise<StockAdjustmentEntity[]> {
        return this.repository.getAdjustmentHistory(productId);
    }

    async setThreshold(productId: string, threshold: number): Promise<ProductInventoryEntity> {
        return this.repository.setThreshold(productId, threshold);
    }
}
