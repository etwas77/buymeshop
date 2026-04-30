import { CartItemDto } from "./CartItemDto";

export interface CartDto {
    items: CartItemDto[];
    totalAmount: number;
}