"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcryptjs");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUsers(query) {
        const { page = 1, limit = 10, role, search, isActive } = query;
        const skip = (page - 1) * limit;
        const where = {
            ...(role && { role }),
            ...(isActive !== undefined && { isActive }),
            ...(search && {
                OR: [
                    { email: { contains: search, mode: 'insensitive' } },
                    { username: { contains: search, mode: 'insensitive' } },
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                ],
            }),
        };
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                select: {
                    id: true,
                    email: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    isActive: true,
                    isVerified: true,
                    createdAt: true,
                    lastLoginAt: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]);
        return {
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async getUserById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true,
                lastLoginAt: true,
                refreshTokens: {
                    where: { isRevoked: false },
                    select: { id: true, createdAt: true, expiresAt: true },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async createUser(createUserDto) {
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: createUserDto.email },
                    ...(createUserDto.username ? [{ username: createUserDto.username }] : []),
                ],
            },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email or username already exists');
        }
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                ...createUserDto,
                password: hashedPassword,
            },
            select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
                isVerified: true,
                createdAt: true,
            },
        });
        return user;
    }
    async updateUser(id, updateUserDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!existingUser) {
            throw new common_1.NotFoundException('User not found');
        }
        if (updateUserDto.username && updateUserDto.username !== existingUser.username) {
            const usernameExists = await this.prisma.user.findFirst({
                where: {
                    username: updateUserDto.username,
                    id: { not: id },
                },
            });
            if (usernameExists) {
                throw new common_1.ConflictException('Username already exists');
            }
        }
        const user = await this.prisma.user.update({
            where: { id },
            data: updateUserDto,
            select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
                isVerified: true,
                updatedAt: true,
            },
        });
        return user;
    }
    async deleteUser(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.prisma.user.delete({
            where: { id },
        });
        return { message: 'User deleted successfully' };
    }
    async toggleUserStatus(id, isActive) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: { isActive },
            select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
                isVerified: true,
            },
        });
        if (!isActive) {
            await this.prisma.refreshToken.updateMany({
                where: { userId: id },
                data: { isRevoked: true },
            });
        }
        return updatedUser;
    }
    async getUserPermissions(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: { role: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const permissions = await this.prisma.rolePermission.findMany({
            where: { role: user.role },
            include: { permission: true },
        });
        return {
            role: user.role,
            permissions: permissions.map(rp => ({
                name: rp.permission.name,
                description: rp.permission.description,
                resource: rp.permission.resource,
                action: rp.permission.action,
            })),
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map