import { ImageDto } from "./ImageDto";

export interface CartItemDto {
    id: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    
    productId: number;
    productName: string;
    productBrand: string;

    images: ImageDto[];
}