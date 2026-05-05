import { CartItemDto } from "./CartItemDto";

export interface CartDto {
    id: number;
    items: CartItemDto[];
    totalAmount: number;
}