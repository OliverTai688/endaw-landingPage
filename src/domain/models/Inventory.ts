export enum AdjustmentType {
    INBOUND = 'INBOUND',
    OUTBOUND = 'OUTBOUND',
    CORRECTION = 'CORRECTION',
    RETURN = 'RETURN',
}

export interface StockAdjustmentEntity {
    id: string;
    inventoryId: string;
    type: AdjustmentType;
    quantity: number;
    reason?: string;
    adjustedBy?: string;
    createdAt: Date;
}

export interface ProductInventoryEntity {
    id: string;
    productId: string;
    currentStock: number;
    lowThreshold: number;
    adjustments?: StockAdjustmentEntity[];
    updatedAt: Date;
}
