import { Role } from '@prisma/client';
export declare class CreateUserDto {
    email: string;
    username?: string;
    firstName: string;
    lastName: string;
    password: string;
    role: Role;
    isActive?: boolean;
    isVerified?: boolean;
}
export declare class UpdateUserDto {
    username?: string;
    firstName?: string;
    lastName?: string;
    role?: Role;
    isActive?: boolean;
    isVerified?: boolean;
}
export declare class UserQueryDto {
    page?: number;
    limit?: number;
    role?: Role;
    search?: string;
    isActive?: boolean;
}
