import { AddressDto } from "./AddressDto";

export interface CreateUserRequestDto {
    firstName: string;
    lastName: string;

    email: string;
    password: string;

    addresses: AddressDto[];
}