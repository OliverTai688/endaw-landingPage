import { OrderEntity, PaymentStatus } from "../../domain/models/Order";

export interface OrderFilters {
    orderType?: string;
    paymentStatus?: PaymentStatus;
    startDate?: Date;
    endDate?: Date;
    search?: string;
}

export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
}

export interface IOrderRepository {
    create(order: Omit<OrderEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<OrderEntity>;
    update(id: string, data: Partial<OrderEntity>): Promise<OrderEntity>;
    findById(id: string): Promise<OrderEntity | null>;
    findAll(filters: OrderFilters, page: number, pageSize: number): Promise<PaginatedResult<OrderEntity>>;
    updateStatus(id: string, status: PaymentStatus): Promise<OrderEntity>;
}
