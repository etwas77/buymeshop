export enum CountryEnum {
    GERMANY = 'DE', 
    USA = 'US',
    CANADA = 'CA',
    UK = 'GB',
    FRANCE = 'FR',
    AUSTRALIA = 'AU',
    INDIA = 'IN',
    JAPAN = 'JP',
    CHINA = 'CN',
    BRAZIL = 'BR',
}

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
    optionalName?: string;
}