
export enum AddressType {
    HOME = 'HOME',
    WORK = 'WORK',
    SHIPPING = 'SHIPPING',
}

export interface AddressDto {
    id?: string;
    country: string;
    street: string;
    city: string;
    phone: string;

    addressType: AddressType;
    userId?: string;
}