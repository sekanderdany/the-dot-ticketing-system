export declare class UsersService {
    private readonly testUser;
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
