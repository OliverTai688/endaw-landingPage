import { OrderEntity, PaymentStatus } from "../../domain/models/Order";
import { IOrderRepository, OrderFilters, PaginatedResult } from "../../infrastructure/repositories/IOrderRepository";

export class OrderService {
    constructor(private repository: IOrderRepository) {}

    async getOrders(filters: OrderFilters, page: number = 1, pageSize: number = 20): Promise<PaginatedResult<OrderEntity>> {
        return this.repository.findAll(filters, page, pageSize);
    }

    async getOrderById(id: string): Promise<OrderEntity | null> {
        return this.repository.findById(id);
    }

    async createOrder(data: Omit<OrderEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<OrderEntity> {
        return this.repository.create(data);
    }

    async updateOrderStatus(id: string, status: PaymentStatus): Promise<OrderEntity> {
        return this.repository.updateStatus(id, status);
    }

    async updateOrder(id: string, data: Partial<OrderEntity>): Promise<OrderEntity> {
        return this.repository.update(id, data);
    }

    async addNote(id: string, note: string): Promise<OrderEntity> {
        const order = await this.repository.findById(id);
        if (!order) throw new Error("Order not found");
        const existingNotes = order.adminNotes || "";
        const timestamp = new Date().toISOString().slice(0, 10);
        const updatedNotes = existingNotes
            ? `${existingNotes}\n${timestamp} - ${note}`
            : `${timestamp} - ${note}`;
        return this.repository.update(id, { adminNotes: updatedNotes });
    }
}
