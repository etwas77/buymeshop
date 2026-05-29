import { CartDto } from "./CartDto";
import { OrderDto } from "./OrderDto";


export interface UserDto {
    id: string; 
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    cart: CartDto[];
    orders: OrderDto[];
}