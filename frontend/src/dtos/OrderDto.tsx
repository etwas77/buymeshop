import { OrderItemDto } from "./OrderItemDto";

export interface OrderDto {
    id: string; 
    orderDate: string;
    totalAmount: number;
    status: string;
    userId: string;
    orderItems: OrderItemDto[];
}