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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcryptjs");
const prisma_service_1 = require("../prisma/prisma.service");
const redis_service_1 = require("../redis/redis.service");
const client_1 = require("@prisma/client");
let AuthService = class AuthService {
    constructor(prisma, jwtService, configService, redisService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.redisService = redisService;
    }
    async validateUser(email, password) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: {
                refreshTokens: {
                    where: { isRevoked: false },
                },
            },
        });
        if (user && await bcrypt.compare(password, user.password)) {
            if (!user.isActive) {
                throw new common_1.UnauthorizedException('Account is disabled');
            }
            const { password: _, ...result } = user;
            return result;
        }
        return null;
    }
    async login(user) {
        const payload = {
            email: user.email,
            sub: user.id,
            role: user.role,
            username: user.username
        };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
            expiresIn: '7d',
        });
        await this.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        await this.redisService.set(`user_session:${user.id}`, JSON.stringify({ id: user.id, email: user.email, role: user.role }), 3600);
        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                isActive: user.isActive,
                isVerified: user.isVerified,
            },
        };
    }
    async register(registerDto) {
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: registerDto.email },
                    ...(registerDto.username ? [{ username: registerDto.username }] : []),
                ],
            },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User already exists');
        }
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: registerDto.email,
                username: registerDto.username,
                firstName: registerDto.firstName,
                lastName: registerDto.lastName,
                password: hashedPassword,
                role: registerDto.role || client_1.Role.CLIENT,
                isActive: true,
                isVerified: false,
            },
        });
        const { password: _, ...result } = user;
        return result;
    }
    async refreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });
            const storedToken = await this.prisma.refreshToken.findUnique({
                where: { token: refreshToken },
                include: { user: true },
            });
            if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            const user = storedToken.user;
            if (!user.isActive) {
                throw new common_1.UnauthorizedException('Account is disabled');
            }
            const newPayload = {
                email: user.email,
                sub: user.id,
                role: user.role,
                username: user.username
            };
            const newAccessToken = this.jwtService.sign(newPayload);
            return {
                access_token: newAccessToken,
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                },
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async logout(userId) {
        await this.prisma.refreshToken.updateMany({
            where: { userId },
            data: { isRevoked: true },
        });
        await this.redisService.del(`user_session:${userId}`);
        return { message: 'Logged out successfully' };
    }
    async logoutAll(userId) {
        await this.prisma.refreshToken.updateMany({
            where: { userId },
            data: { isRevoked: true },
        });
        await this.redisService.deletePattern(`user_session:${userId}*`);
        return { message: 'Logged out from all devices' };
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
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
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return user;
    }
    async changePassword(userId, changePasswordDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const isCurrentPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            throw new common_1.BadRequestException('Current password is incorrect');
        }
        const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword },
        });
        await this.prisma.refreshToken.updateMany({
            where: { userId },
            data: { isRevoked: true },
        });
        return { message: 'Password changed successfully' };
    }
    async getUserPermissions(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
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
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        redis_service_1.RedisService])
], AuthService);
//# sourceMappingURL=auth.service.js.map