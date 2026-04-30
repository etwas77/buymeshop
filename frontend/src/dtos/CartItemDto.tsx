export interface CartItemDto {
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    
    productId: number;
    productName: string;
    productBrand: string;
}