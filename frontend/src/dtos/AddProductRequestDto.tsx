import { CategoryDto } from "./CategoryDto";

export interface AddProductRequestDto {
    name: string;
    brand: string;
    price: number;
    inventory: number;
    description: string;
    category: CategoryDto;
}