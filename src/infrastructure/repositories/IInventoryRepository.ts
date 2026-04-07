import { ProductInventoryEntity, StockAdjustmentEntity, AdjustmentType } from "../../domain/models/Inventory";

export interface IInventoryRepository {
    findByProductId(productId: string): Promise<ProductInventoryEntity | null>;
    findAll(): Promise<ProductInventoryEntity[]>;
    findLowStock(): Promise<ProductInventoryEntity[]>;
    adjustStock(productId: string, type: AdjustmentType, quantity: number, reason?: string, adjustedBy?: string): Promise<ProductInventoryEntity>;
    getAdjustmentHistory(productId: string): Promise<StockAdjustmentEntity[]>;
    setThreshold(productId: string, threshold: number): Promise<ProductInventoryEntity>;
}
