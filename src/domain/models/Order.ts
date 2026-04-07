export enum OrderType {
    WORKSHOP = 'WORKSHOP',
    MUSIC = 'MUSIC',
    PRODUCT = 'PRODUCT',
}

export enum PaymentStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED',
    PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export enum RefundStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    PROCESSED = 'PROCESSED',
    REJECTED = 'REJECTED',
}

export interface CustomerEntity {
    id: string;
    name: string;
    email: string;
    phone?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface OrderItemEntity {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    variant?: string;
}

export interface RefundEntity {
    id: string;
    orderId: string;
    amount: number;
    reason: string;
    status: RefundStatus;
    processedBy?: string;
    processedAt?: Date;
    createdAt: Date;
}

export interface OrderEntity {
    id: string;
    orderNumber: string;
    orderType: OrderType;
    customerId: string;
    customer?: CustomerEntity;
    workshopId?: string;
    musicPackageId?: string;
    productItems?: OrderItemEntity[];
    subtotal: number;
    currency: string;
    discount: number;
    totalAmount: number;
    paymentStatus: PaymentStatus;
    paymentMethod?: string;
    transactionId?: string;
    paidAt?: Date;
    adminNotes?: string;
    refunds?: RefundEntity[];
    createdAt: Date;
    updatedAt: Date;
}
