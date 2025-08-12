import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getUsers(query: UserQueryDto): Promise<{
        users: {
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
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getUserById(id: string): Promise<{
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        isActive: boolean;
        isVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
        lastLoginAt: Date;
        refreshTokens: {
            id: string;
            createdAt: Date;
            expiresAt: Date;
        }[];
    }>;
    createUser(createUserDto: CreateUserDto): Promise<{
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        isActive: boolean;
        isVerified: boolean;
        createdAt: Date;
    }>;
    updateUser(id: string, updateUserDto: UpdateUserDto): Promise<{
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        isActive: boolean;
        isVerified: boolean;
        updatedAt: Date;
    }>;
    deleteUser(id: string): Promise<{
        message: string;
    }>;
    activateUser(id: string): Promise<{
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        isActive: boolean;
        isVerified: boolean;
    }>;
    deactivateUser(id: string): Promise<{
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        isActive: boolean;
        isVerified: boolean;
    }>;
    getUserPermissions(id: string): Promise<{
        role: import(".prisma/client").$Enums.Role;
        permissions: {
            name: string;
            description: string;
            resource: string;
            action: string;
        }[];
    }>;
}
