import { RoleDto } from "./RoleDto";

export interface AuthDto {
    id: string;
    roles: RoleDto[];
}