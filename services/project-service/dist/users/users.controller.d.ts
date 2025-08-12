import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getUsers(): Promise<{
        users: {
            id: string;
            email: string;
            username: string;
            firstName: string;
            lastName: string;
            role: string;
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
        id: string;
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        role: string;
        isActive: boolean;
        isVerified: boolean;
        createdAt: Date;
        lastLoginAt: Date;
    }>;
}
