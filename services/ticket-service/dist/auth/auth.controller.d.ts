import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto, ChangePasswordDto } from './dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(req: any, loginDto: LoginDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: any;
            email: any;
            username: any;
            firstName: any;
            lastName: any;
            role: any;
            isActive: any;
            isVerified: any;
        };
    }>;
    register(registerDto: RegisterDto): Promise<{
        email: string;
        username: string | null;
        firstName: string | null;
        lastName: string | null;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        isActive: boolean;
        isVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
        lastLoginAt: Date | null;
    }>;
    refresh(refreshTokenDto: RefreshTokenDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            username: string;
            firstName: string;
            lastName: string;
            role: import(".prisma/client").$Enums.Role;
        };
    }>;
    logout(req: any): Promise<{
        message: string;
    }>;
    logoutAll(req: any): Promise<{
        message: string;
    }>;
    getProfile(req: any): Promise<{
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        isActive: boolean;
        isVerified: boolean;
        createdAt: Date;
        lastLoginAt: Date;
    }>;
    changePassword(req: any, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    getPermissions(req: any): Promise<{
        role: import(".prisma/client").$Enums.Role;
        permissions: {
            name: string;
            description: string;
            resource: string;
            action: string;
        }[];
    }>;
}
