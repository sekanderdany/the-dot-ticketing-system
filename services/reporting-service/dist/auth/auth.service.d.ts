import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { RegisterDto, ChangePasswordDto } from './dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private configService;
    private redisService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService, redisService: RedisService);
    validateUser(email: string, password: string): Promise<any>;
    login(user: any): Promise<{
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
    refreshToken(refreshToken: string): Promise<{
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
    logout(userId: string): Promise<{
        message: string;
    }>;
    logoutAll(userId: string): Promise<{
        message: string;
    }>;
    getProfile(userId: string): Promise<{
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
    changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    getUserPermissions(userId: string): Promise<{
        role: import(".prisma/client").$Enums.Role;
        permissions: {
            name: string;
            description: string;
            resource: string;
            action: string;
        }[];
    }>;
}
