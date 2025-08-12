import { Role } from '@prisma/client';
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RegisterDto {
    email: string;
    username?: string;
    firstName: string;
    lastName: string;
    password: string;
    role?: Role;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
