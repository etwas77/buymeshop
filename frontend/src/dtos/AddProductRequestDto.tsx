import { CategoryDto } from "./CategoryDto";
import { ImageDto } from "./ImageDto";

export interface AddProductRequestDto {
    name: string;
    brand: string;
    price: number;
    inventory: number;
    description: string;
    category: CategoryDto;
    images?: ImageDto[];
}