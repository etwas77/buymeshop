import { AddressDto } from "./AddressDto";
import { CartDto } from "./CartDto";
import { OrderDto } from "./OrderDto";
import { RoleDto } from "./RoleDto";


export interface UserDto {
    id: string; 
    firstName: string;
    lastName: string;
    email: string;
    roles: RoleDto[];
    cart: CartDto;
    orders: OrderDto[];
    addresses: AddressDto[];
}